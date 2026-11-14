import { siteUrl } from "@/config/site";

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
    /** 通り名。X の表示名と同じ表記にする(2026/11/01 に本人の X の画面で確認。中黒なし) */
    handle: "タイルドマンサックス",
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
    /**
     * 先行価格の受付中か。false にすると LP・特商法・規約が通常価格の表示に切り替わる。
     * 申込リンク(urls.apply)も通常価格のページに合わせること。
     * 2026/10/08 受付終了(先行価格で17名が入会)。
     */
    earlyBirdOpen: false,
    /** 消費税率 */
    taxRate: 0.1,
    /**
     * 目標人数。2026/10/19 方針転換: 当初は10〜20人でよいとしていたが、最初の募集で20人を超えた。
     * 「このサロンと投資だけで、今の仲間と生きていく」と決め、目標を200人にした(本人の言葉)。
     */
    goalMembers: 200,
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
   * 新規募集の受付中か(本線 /kabu-salon の申込ボタン)。false の間、申込ボタンは LINE 公式アカウント
   * (urls.waitlist)への待機ボタンに切り替わる。再開するときは true に戻すだけ(urls.apply は残してある)。
   * true の間、ボタンは urls.apply(通常価格の申込ページ)へ向く。
   * 2026/10/13 今期の募集終了。2026/11/12 募集期間が一旦終了し、両方のLPを LINE 待機に戻した(本人の指示)。
   * 2026/11/13 本線を新LPに差し替えた(本人の指示)。open は差し替えの前も後も「本線のボタン」を指す。
   */
  enrollment: {
    open: false,
    /**
     * 前のLP(/kabu-salon/v1)の申込ボタンを開くか。本線の open とは別に切り替える。
     * 比較用に残しているページなので、ふだんは false(LINE 待機)のままでよい。
     */
    v1Open: false,
    /**
     * 3つ目のLP(/kabu-salon/v3。「本業・副業・投資を 1:1:1 に」)の申込ボタンを開くか。
     * 本線の open とは別に切り替える。
     */
    v3Open: false,
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
    legalUpdatedAt: "2026/10/08",
  },

  urls: {
    /** 申込(決済)ページ。earlyBirdOpen に合わせる(受付終了後は通常価格のページ) */
    apply: "https://tairu-salonmac-mini.tailce0a64.ts.net:10000/join/kabu_ippan",
    /** 募集停止中のボタンの行き先(LINE公式アカウントの友だち追加) */
    waitlist: "https://lin.ee/OmdMRVP",
    /** X(旧Twitter)のプロフィール。スペースの実績に触れるため */
    x: "【X プロフィールURL】",
    /** プライバシーポリシー(サイト内ページ) */
    privacyPolicy: "/kabu-salon/privacy",
    /** 特定商取引法に基づく表記(運営者情報はここに記載。サイト内ページ) */
    tokushoho: "/kabu-salon/tokushoho",
    /** 利用規約(サイト内ページ) */
    terms: "/kabu-salon/terms",
    /**
     * LP本体(本線。X の告知で使っているURL)。
     * 2026/11/13 から新LP(「バリュー株を、自分で見つけたい人へ」。文言は content/kabuSalonV2.ts)。
     * それまで新LPを置いていた /kabu-salon/v2 は、ここへ転送する(config/site.ts の movedPaths)。
     */
    lp: "/kabu-salon",
    /**
     * 前のLP(「タイちゃんの思考を、そのまま聞ける部屋」。文言は content/kabuSalon.ts)。
     * 比較用に残す。検索には出さない。
     */
    lpV1: "/kabu-salon/v1",
    /**
     * 3つ目のLP(「本業・副業・投資を 1:1:1 に」。文言は content/kabuSalonV3.ts)。
     * 2026/11/14 の本人の録音(サロンをどういうサロンにしていきたいか)をもとに作った。検索には出さない。
     */
    lpV3: "/kabu-salon/v3",
    /**
     * LPを公開しているドメイン(X の告知で使っているもの)。
     * canonical と、シェア画像の絶対URLを組み立てるのに使う。環境変数 SITE_URL があればそちらが優先。
     */
    site: "https://tairusalon.com",
  },

  /**
   * X などにリンクを貼ったときに出る画像カード(1200×630)。
   * 画像は scripts/kabu-salon-og.mjs で作る。作り直したら version を上げる(X が古い画像を覚えているため)。
   */
  share: {
    version: 2,
    width: 1200,
    height: 630,
    images: {
      /** 本線(新LP)のカード。ファイル名はデザインの名前(v2)のまま */
      lp: "/kabu-salon/og/kabu-salon-v2.png",
      /** 前のLPのカード */
      lpV1: "/kabu-salon/og/kabu-salon.png",
      /** 3つ目のLPのカード */
      lpV3: "/kabu-salon/og/kabu-salon-v3.png",
    },
  },
} as const;

/** LPの公開URLの土台(SITE_URL が正しく設定されていればそれ、無ければ urls.site) */
export function kabuSalonBaseUrl(
  env: Record<string, string | undefined> = process.env
): URL {
  return siteUrl(env) ?? new URL(kabuSalonConfig.urls.site);
}

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
