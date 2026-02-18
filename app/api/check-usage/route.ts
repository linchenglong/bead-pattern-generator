/**
 * 检查免费次数 / 消耗免费次数 / 验证 token
 * GET  /api/check-usage → 检查剩余次数
 * POST /api/check-usage → 消耗一次免费次数或验证 token
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateFingerprint, checkFreeUsage, consumeFreeUsage, verifyUsageToken } from '@/lib/usage';

function getClientInfo(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '0.0.0.0';
  const ua = req.headers.get('user-agent') || 'unknown';
  return { ip, ua };
}

export async function GET(req: NextRequest) {
  try {
    const { ip, ua } = getClientInfo(req);
const fingerprint = generateFingerprint(ip, ua);
    const usage = await checkFreeUsage(fingerprint);
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Check usage error:', error);
    return NextResponse.json({ allowed: true, usedCount: 0, remaining: 1 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 如果携带 token，验证 token
    if (body.token) {
      const result = await verifyUsageToken(body.token);
    if (result.valid) {
        return NextResponse.json({ allowed: true, method: 'token' });
      }
      return NextResponse.json({ allowed: false, error: 'token 无效或已过期' }, { status: 401 });
    }

    // 否则尝试消耗免费次数
    const { ip, ua } = getClientInfo(req);
    const fingerprint = generateFingerprint(ip, ua);
    const usage = await checkFreeUsage(fingerprint);

    if (!usage.allowed) {
      return NextResponse.json({ allowed: false, error: '免费次数已用完，请输入兑换码' }, { status: 403 });
    }

    await consumeFreeUsage(fingerprint);
    return NextResponse.json({ allowed: true, method: 'free' });
  } catch (error) {
    console.error('Consume usage error:', error);
    // 出错时默认放行，不影响用户体验
    return NextResponse.json({ allowed: true, method: 'fallback' });
  }
}
