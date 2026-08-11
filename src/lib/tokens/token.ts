import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * 受信者別 opaque token の生成・検証ユーティリティ。
 *
 * - トークンは32バイト以上のランダム値(base64url)
 * - DBにはトークン本体ではなく HMAC-SHA256 ハッシュのみ保存する
 * - JWTは使わず、メールアドレス等の情報はトークンに一切含めない
 */

const MIN_TOKEN_BYTES = 32;

function secret(): string {
  const s = process.env.PREFERENCE_TOKEN_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "PREFERENCE_TOKEN_SECRET が未設定です(16文字以上を .env に設定してください)"
    );
  }
  return s;
}

/** 32バイトの推測困難な opaque token を生成する */
export function generateToken(): string {
  return randomBytes(MIN_TOKEN_BYTES).toString("base64url");
}

/** トークンをDB保存用ハッシュへ変換する(HMAC-SHA256, hex) */
export function hashToken(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

/** タイミング攻撃に配慮したハッシュ比較 */
export function safeEqualHash(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * トークンの形式チェック。
 * 形式不正なら DB を引かずに拒否する(結果は無効トークンと同じ共通エラー)。
 */
export function isPlausibleToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  // base64url 32バイト = 43文字。デモ用トークンも32文字以上に揃えている
  if (token.length < 32 || token.length > 128) return false;
  return /^[A-Za-z0-9_-]+$/.test(token);
}

/** ログ出力用: トークンを復元不能な短い識別子に変換する(生トークンをログへ出さない) */
export function tokenLogRef(token: string): string {
  return hashToken(token).slice(0, 8);
}
