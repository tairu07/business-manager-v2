/**
 * メールアドレスのマスキング。
 * 例: kenji@gmail.com -> k***@gmail.com
 *
 * 画面・ログ・分析には常にマスキング済みの値だけを使い、
 * 生のメールアドレスは表示しない。
 */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${local[0]}***@${domain}`;
}
