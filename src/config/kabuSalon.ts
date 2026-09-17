/**
 * 株分析サロンLPの設定。
 *
 * 【 】付きはプレースホルダー。公開前に必ず正式情報へ置換すること。
 * 価格・定員は 2026/09 のコーチングセッション(寺田・船谷・岡村・古山)で
 * 出た数値を採用している。変更する場合はここだけを直せばLP全体に反映される。
 */
export const kabuSalonConfig = {
  /** サロン名(仮称。正式名称が決まったら差し替え) */
  name: "SENRITSU 株分析サロン",

  operator: {
    /** 運営者の表示名 */
    displayName: "大成",
    /** 運営法人の正式名称 */
    legalName: "株式会社SENRITSU",
    /** 問い合わせ先 */
    contact: "【問い合わせ先メールアドレス】",
  },

  pricing: {
    /** 通常価格(税抜・月額) */
    regular: 20000,
    /** 先行価格(税抜・月額) */
    earlyBird: 15000,
    /** 先行価格の対象人数 */
    earlyBirdSeats: 10,
    /** 消費税率 */
    taxRate: 0.1,
    /** 少人数運営のため上限を設ける(枠が埋まり次第、次回募集まで締切) */
    maxMembers: 30,
  },

  /** 3段階ラインナップのうちサロン以外の価格(税抜・月額) */
  ladder: {
    notePrice: 4980,
    /** IRアルファデータベース(開発中)の予定価格 */
    irAlphaPrice: 50000,
  },

  urls: {
    /** 申込(決済)ページ。UnivaPayの決済リンクを設定する */
    apply: "【申込・決済ページURL】",
    /** noteのURL */
    note: "【note URL】",
    /** プライバシーポリシー */
    privacyPolicy: "【プライバシーポリシーURL】",
    /** 特定商取引法に基づく表記 */
    tokushoho: "【特商法表記URL】",
  },
} as const;

/** 税込価格(円・整数) */
export function withTax(price: number): number {
  return Math.round(price * (1 + kabuSalonConfig.pricing.taxRate));
}

/** ¥表記+3桁カンマ */
export function yen(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}
