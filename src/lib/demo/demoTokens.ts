/**
 * ローカル確認用の固定デモトークン。
 *
 * 本番では使用しない(シードを流さない限りDBに存在しない)。
 * 実運用のトークンは scripts/issue-token.ts で発行する
 * ランダムな32バイト値のみを使う。
 */

export const demoTokens = {
  /** まだ何も選択していないユーザー(preset付きURLの確認に使う) */
  fresh: "demo-token-fresh-user-000000000000000000",
  /** iPhone転売を選択済みのユーザー */
  iphoneSelected: "demo-token-iphone-user-00000000000000000",
  /** アービトラージを選択済みのユーザー */
  arbitrageSelected: "demo-token-arbitrage-user-00000000000000",
  /** 両方選択済みのユーザー */
  bothSelected: "demo-token-both-user-0000000000000000000",
  /** すでに配信停止済みのユーザー */
  optedOut: "demo-token-opted-out-user-00000000000000",
  /** 期限切れトークンのユーザー */
  expired: "demo-token-expired-user-0000000000000000",
  /** DBに存在しない無効トークン(シード対象外) */
  invalid: "demo-token-invalid-not-in-database-00000",
} as const;
