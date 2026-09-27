/**
 * 株分析サロンLPの設定。
 *
 * 【 】付きはプレースホルダー。公開前に必ず正式情報へ置換すること。
 * 2026/09/17 方針転換: 教育サロンではなく「タイちゃんの思考を聞くファンクラブ」として運営する。
 * 本名・社名・主宰写真はLPに出さない(運営者情報は特商法ページ側に置く)。
 */
export const kabuSalonConfig = {
  /** サロン名(仮称。正式名称が決まったら差し替え) */
  name: "タイちゃんの株分析サロン",

  operator: {
    /** LP上の呼び名(一人称・愛称) */
    displayName: "タイちゃん",
    /** 通り名(要確認: 音声の聞き取りから「タイルドマン・サックス」と推定) */
    handle: "タイルドマン・サックス",
    /** 問い合わせ先(未設定なら描画しない) */
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
    /** 想定人数(10〜20人でよい、という本人の言葉) */
    targetMembers: "10〜20人",
    /** 課金サイクル(決済システム側の仕様に合わせる。2026/09/27 時点) */
    billing: {
      /** 毎月の課金日 */
      dayOfMonth: 1,
      /** この日(日本時間の終わり)までの申込は初回0円。以降は「申込時に課金→翌月から毎月1日」 */
      launchFreeUntil: "2026-09-30",
      launchFreeUntilLabel: "2026年9月30日",
      /** 初回0円で申し込んだ人の初回課金日(表示用) */
      firstChargeDate: "2026年10月1日",
    },
  },

  /** Zoomリアルタイム配信(サロン生限定) */
  zoom: {
    perWeek: 1,
    goalPerWeek: 2,
  },

  /**
   * 運営会社(特定商取引法に基づく表記・プライバシーポリシー・利用規約にのみ表示する)。
   * LP本文には出さない(本名・社名を出さない方針)。
   */
  company: {
    legalName: "株式会社SENRITSU",
    representative: "代表取締役 加藤大成",
    postalCode: "579-8036",
    address: "大阪府東大阪市鷹殿町11-2 カワショウビル2・3階",
    tel: "090-8791-8955",
    telNote: "受付時間 平日 10:00〜18:00(お問い合わせはメールを優先してください)",
    email: "senritsu@senritsu.site",
    /** 決済代行会社 */
    paymentProvider: "UnivaPay(ユニヴァ・ペイキャスト)",
    /** 法務文書の最終更新日(YYYY/MM/DD) */
    legalUpdatedAt: "2026/09/19",
  },

  urls: {
    /** 申込(決済)ページ。UnivaPayの決済リンクを設定する */
    apply: "【申込・決済ページURL】",
    /** X(旧Twitter)のプロフィール。スペースの実績に触れるため */
    x: "【X プロフィールURL】",
    /** プライバシーポリシー(サイト内ページ) */
    privacyPolicy: "/kabu-salon/privacy",
    /** 特定商取引法に基づく表記(運営者情報はここに記載。サイト内ページ) */
    tokushoho: "/kabu-salon/tokushoho",
    /** 利用規約(サイト内ページ) */
    terms: "/kabu-salon/terms",
    /** LP本体 */
    lp: "/kabu-salon",
  },
} as const;

/**
 * 初回0円のローンチ期間内か(日本時間で launchFreeUntil の 23:59:59 まで)。
 * ページは1時間ごとに再生成されるので、期日を過ぎれば案内文は自動で消える。
 */
export function isLaunchFreePeriod(now: Date = new Date()): boolean {
  const end = Date.parse(
    `${kabuSalonConfig.pricing.billing.launchFreeUntil}T23:59:59+09:00`
  );
  return now.getTime() <= end;
}

/** 税込価格(円・整数) */
export function withTax(price: number): number {
  return Math.round(price * (1 + kabuSalonConfig.pricing.taxRate));
}

/** ¥表記+3桁カンマ */
export function yen(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}
