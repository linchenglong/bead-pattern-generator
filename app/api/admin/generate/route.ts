/**
 * 管理员生成兑换码 API
 * POST /api/admin/generate
 * Body: { password: string, count: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆的 I/O/0/1
  let code = '';
  for (let i = 0; i < 8; i++) {
  code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, count = 10 } = body;

if (password !== process.env.ADMIN_PASSWORD) {
   return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const num = Math.min(Math.max(1, Number(count)), 100);
    const redis = getRedis();
    const codes: string[] = [];

    for (let i = 0; i < num; i++) {
      const code = generateCode();
      await redis.set(`code:${code}`, 'unused');
      codes.push(code);
    }

    return NextResponse.json({
      success: true,
   codes,
      message: `成功生成 ${codes.length} 个兑换码`,
    });
  } catch (error) {
    console.error('Generate codes error:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
