import type { LaunchTopic } from "@/config/launch";

/**
 * URLクエリ ?topic= の値を検証して返す。
 * 不正値・未指定は "both" にフォールバックする。
 * クエリにメールアドレスや受信者IDは入れない設計。
 */
export function parseTopic(value: string | string[] | undefined): LaunchTopic {
  if (value === "iphone" || value === "arbitrage" || value === "both") {
    return value;
  }
  return "both";
}
