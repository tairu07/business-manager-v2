/**
 * ローンチ企画の全設定を1か所に集約する設定ファイル。
 *
 * 正式情報が未確定の項目は【 】付きのプレースホルダーになっている。
 * 本番公開前に必ずすべてのプレースホルダーを正式情報へ置換すること。
 * (一覧は README「法務確認が必要なプレースホルダー一覧」を参照)
 */

export type LaunchTopic = "iphone" | "arbitrage" | "both";
export type Category = "iphone" | "arbitrage";

export const ALL_CATEGORIES: Category[] = ["iphone", "arbitrage"];

export const launchConfig = {
  /** 企画名 */
  campaignName: "iPhone転売 × アービトラージエキスパートコース 合同プロダクトローンチ",

  /** キャンペーンID(分析イベント・ConsentEventに記録される) */
  campaignId: process.env.CAMPAIGN_ID ?? "launch_2026_joint",

  /** 配信設定文言(同意文言)のバージョン。文言を変更したら必ず上げる */
  consentVersion: "2026-08-v1",

  sender: {
    /** メール配信者の表示名 */
    displayName: "前田",
    /** メール配信者の正式事業者名 */
    legalName: "【前田さん側の正式事業者名】",
    /** メール配信者の問い合わせ先 */
    contact: "【問い合わせ先】",
    /** サポートメールアドレス */
    supportEmail: process.env.SUPPORT_EMAIL ?? "【サポートメールアドレス】",
  },

  trick: {
    /** トリック運営の表示名 */
    displayName: "トリック運営",
    /** トリック運営の正式事業者名 */
    legalName: "【トリック運営の正式事業者名】",
  },

  urls: {
    /** アプリ自身のベースURL(メール内リンクの生成に使用) */
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
    /** iPhone転売商品販売LPのURL(トリック運営が管理する外部ページ) */
    iphoneSalesLp: "【iPhone販売LP URL】",
    /** アービトラージ商品販売LPのURL(前田が管理する外部ページ) */
    arbitrageSalesLp: "【アービトラージ販売LP URL】",
    /** プライバシーポリシーURL */
    privacyPolicy: "【プライバシーポリシーURL】",
    /** 特定商取引法に基づく表記URL */
    tokushoho: "【特商法表記URL】",
  },

  /** 各メールの送信予定日(表示・運用管理用。配信システム側のスケジュールと合わせる) */
  emailSchedule: {
    day0: "【Day0送信予定日 例: 2026-08-18】",
    day1: "【Day1送信予定日 例: 2026-08-19】",
    day2: "【Day2送信予定日 例: 2026-08-20】",
    day3: "【Day3送信予定日 例: 2026-08-21】",
  },

  /** 各コンテンツページの公開・非公開 */
  contentPages: {
    day1Published: true,
    day2Published: true,
    day3Published: true,
  },

  analytics: {
    /** Google Tag Manager ID(未設定なら分析タグを読み込まない) */
    gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  },

  /**
   * デモモード。ONの場合:
   * - メールプレビュー画面(/dev/emails)が有効になる
   * - メール配信プロバイダはMock(外部送信なし)に固定される
   */
  demoMode: process.env.DEMO_MODE !== "false",

  /** トークンの有効期間(日数)。発行スクリプトが使用する */
  tokenTtlDays: 30,
} as const;

/** 配信設定LPのURLを組み立てる(トークンはESPのマージタグのまま渡せる) */
export function preferencesUrl(token: string, preset?: LaunchTopic): string {
  const base = `${launchConfig.urls.appBaseUrl}/preferences?token=${token}`;
  return preset ? `${base}&preset=${preset}` : base;
}

/** 配信停止ページのURL(開いただけでは停止しない。確認画面からPOSTで確定) */
export function optOutUrl(token: string): string {
  return `${launchConfig.urls.appBaseUrl}/preferences?token=${token}&intent=opt-out`;
}

/** DayコンテンツページのURL */
export function launchDayUrl(day: 1 | 2 | 3, topic: LaunchTopic): string {
  return `${launchConfig.urls.appBaseUrl}/launch/day-${day}?topic=${topic}`;
}
