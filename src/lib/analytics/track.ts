"use client";

/**
 * 個人情報を含まない分析イベント送信ユーティリティ。
 *
 * GTMが設定されていれば dataLayer へ push する。未設定なら何もしない。
 * メールアドレス・トークン・subscriberId等の禁止キーはホワイトリスト方式で遮断する。
 */

export type AnalyticsEventName =
  | "preference_page_view"
  | "category_selected"
  | "consent_confirmed"
  | "preference_updated"
  | "opt_out_started"
  | "opt_out_confirmed"
  | "launch_content_view"
  | "sales_lp_clicked";

/** 送信を許可するプロパティのホワイトリスト。これ以外のキーは送信されない */
const ALLOWED_PROPS = new Set([
  "campaign_id",
  "topic",
  "day_number",
  "selected_category_count",
  "category",
]);

export interface AnalyticsProps {
  campaign_id?: string;
  topic?: string;
  day_number?: number;
  selected_category_count?: number;
  category?: string;
}

/** ホワイトリスト外のキー(email, token, subscriberId等)を除去する */
export function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;
    out[key] = value;
  }
  return out;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: AnalyticsEventName, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  const payload = { event, ...sanitizeProps(props as Record<string, unknown>) };
  window.dataLayer?.push(payload);
  if (process.env.NODE_ENV === "development") {
    // 開発時の確認用。個人情報はホワイトリストで既に除去済み
    console.debug("[analytics]", payload);
  }
}
