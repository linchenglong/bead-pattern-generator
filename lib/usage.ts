/**
 * 免费次数管理
 * 服务端：基于设备指纹（IP + UA hash）追踪
 * 客户端：localStorage 辅助快速判断
 */
import { getRedis } from './redis';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_KEY = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET env var');
  return new TextEncoder().encode(secret);
};

const FREE_USES = 1; // 免费次数

/**
 * 生成设备指纹 (服务端)
 */
export function generateFingerprint(ip: string, userAgent: string): string {
  // 简单 hash: IP + UA
  let hash = 0;
  const str = `${ip}|${userAgent}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit int
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * 检查是否还有免费次数
 */
export async function checkFreeUsage(fingerprint: string): Promise<{
  allowed: boolean;
  usedCount: number;
  remaining: number;
}> {
  const redis = getRedis();
  const key = `usage:${fingerprint}`;
  const count = (await redis.get<number>(key)) || 0;

  return {
    allowed: count < FREE_USES,
    usedCount: count,
    remaining: Math.max(0, FREE_USES - count),
  };
}

/**
 * 消耗一次免费次数
 */
export async function consumeFreeUsage(fingerprint: string): Promise<number> {
  const redis = getRedis();
  const key = `usage:${fingerprint}`;
  return await redis.incr(key);
}

/**
 * 签发使用 token (兑换成功后)
 */
export async function signUsageToken(code: string): Promise<string> {
  return new SignJWT({ code, type: 'usage' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 天有效
    .sign(JWT_SECRET_KEY());
}

/**
 * 验证使用 token
 */
export async function verifyUsageToken(token: string): Promise<{ valid: boolean; code?: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY());
    if (payload.type === 'usage' && payload.code) {
      return { valid: true, code: payload.code as string };
  }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}
