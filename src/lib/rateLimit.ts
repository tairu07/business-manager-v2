/**
 * シンプルなインメモリ・レート制限(スライディングウィンドウ)。
 *
 * 単一インスタンス前提の基本的な保護。
 * 本番で複数インスタンス構成にする場合は Redis 等の共有ストアか、
 * エッジ/WAFレイヤーのレート制限へ置き換えること。
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** ウィンドウ長(ミリ秒) */
  windowMs: number;
  /** ウィンドウ内の最大リクエスト数 */
  max: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < options.windowMs);
  if (bucket.timestamps.length >= options.max) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}

/** リクエストからレート制限キー(クライアントIP相当)を得る。IPは保存しない */
export function rateLimitKeyFromRequest(request: Request, route: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${route}:${ip}`;
}

/** テスト用 */
export function resetRateLimits(): void {
  buckets.clear();
}
