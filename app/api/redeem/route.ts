/**
 * 兑换码验证 API
 * POST /api/redeem
 * Body: { code: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { signUsageToken } from '@/lib/usage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: '请输入兑换码' }, { status: 400 });
    }

    const trimmedCode = code.trim().toUpperCase();
    const redis = getRedis();
    const key = `code:${trimmedCode}`;

    const value = await redis.get<string>(key);

    if (value === null) {
      return NextResponse.json({ error: '无效的兑换码' }, { status: 400 });
    }

    if (value.startsWith('used:')) {
      return NextResponse.json({ error: '该兑换码已被使用' }, { status: 400 });
    }

    if (value === 'unused') {
      await redis.set(key, `used:${Date.now()}`);
      const token = await signUsageToken(trimmedCode);
      return NextResponse.json({ success: true, token, message: '兑换成功！' });
    }

    return NextResponse.json({ error: '兑换码状态异常' }, { status: 500 });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
  }
}
