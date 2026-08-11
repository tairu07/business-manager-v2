import type { LaunchTopic } from "@/config/launch";

/**
 * メールテンプレートの共通型。
 * 本文はブロックの配列で表現し、HTML版とプレーンテキスト版を同一ソースから生成する。
 * 画像には依存しない(画像非表示でも内容が伝わる構造)。
 */

export type EmailBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  /** メインCTAボタン */
  | { type: "cta"; label: string; url: string }
  /** テキストリンク(事前選択リンク等) */
  | { type: "link"; label: string; url: string }
  /** 小さめの注記 */
  | { type: "note"; text: string };

export interface EmailDefinition {
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
}

export interface RenderedEmail {
  subject: string;
  previewText: string;
  html: string;
  text: string;
}

export interface EmailRenderOptions {
  topic: LaunchTopic;
  /**
   * 受信者別トークン。省略時は "{{TOKEN}}" のまま出力し、
   * メール配信システム側のマージタグ置換に任せる。
   */
  token?: string;
}
