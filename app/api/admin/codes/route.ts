/**
 * 查询所有兑换码 API
 * GET /api/admin/codes
 * Header: x-admin-password
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

interface CodeInfo {
  code: string;
  status: 'unused' | 'used';
  usedAt: number | null;
}

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const redis = getRedis();
    const allKeys: string[] = [];

    // SCAN 遍历所有 code:* keys
    let cursor = 0;
 do {
      const [nextCursor, keys] = await redis.scan(cursor, {
     match: 'code:*',
        count: 100,
      });
      cursor = Number(nextCursor);
      allKeys.push(...keys);
    } while (cursor !== 0);

    if (allKeys.length === 0) {
      return NextResponse.json({ codes: [] });
    }

    // 批量获取值
    const values = await redis.mget<string[]>(...allKeys);

    const codes: CodeInfo[] = allKeys.map((key, i) => {
      const code = key.replace('code:', '');
   const value = values[i];

   if (value && value.startsWith('used:')) {
 const timestamp = parseInt(value.slice(5), 10);
        return { code, status: 'used' as const, usedAt: timestamp };
      }
      return { code, status: 'unused' as const, usedAt: null };
    });

    // 排序：已用的按使用时间倒序，未用的在后面
    codes.sort((a, b) => {
      if (a.status === 'used' && b.status === 'used') {
        return (b.usedAt ?? 0) - (a.usedAt ?? 0);
      }
      if (a.status === 'used') return -1;
      if (b.status === 'used') return 1;
   return 0;
    });

    return NextResponse.json({ codes });
  } catch (error) {
    console.error('List codes error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
