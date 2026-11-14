import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonBillingFaq, kabuSalonSharedFaq } from "@/content/kabuSalon";
import { kabuSalonV2Copy } from "@/content/kabuSalonV2";

/**
 * 株分析サロン 3つ目のLP(/kabu-salon/v3)の全文言。
 * (仮の文言。エージェントが作った最終版に差し替える)
 */

const { pricing, operator, name, zoom } = kabuSalonConfig;

const price = `月額 ${yen(pricing.regular)}(税込 ${yen(withTax(pricing.regular))})`;

type Item = { readonly title: string; readonly body: string };
type SectionBase = {
  readonly eyebrowEn: string;
  readonly eyebrowJp: string;
  /** 見出し(1行13文字以内で2行まで) */
  readonly heading: ReadonlyArray<string>;
  /** 見出しの中で金にする語(無ければ空文字) */
  readonly gold: string;
  readonly lead: string;
  /** 節の最後の注記(無ければ空文字) */
  readonly note: string;
};
/** 節の種類。並び順は sections の順番がそのままページの順番になる */
export type V3Section =
  | (SectionBase & { readonly id: "ratio"; readonly items: readonly [Item, Item, Item] })
  | (SectionBase & {
      readonly id: "problem";
      readonly feelings: ReadonlyArray<string>;
      readonly narrative: ReadonlyArray<string>;
    })
  | (SectionBase & {
      readonly id: "reframe" | "story";
      readonly quote: ReadonlyArray<string>;
      readonly paragraphs: ReadonlyArray<string>;
    })
  | (SectionBase & {
      readonly id: "switch" | "contents";
      readonly items: ReadonlyArray<Item>;
    });

const sections: ReadonlyArray<V3Section> = [
  {
    id: "ratio",
    eyebrowEn: "Balance",
    eyebrowJp: "目指す形",
    heading: ["収入の柱を、", "3本にする。"],
    gold: "3本",
    lead: "仮の文言です。",
    items: [
      { title: "いまの仕事は、そのまま", body: "仮の文言です。" },
      { title: "もうひとつの収入を育てる", body: "仮の文言です。" },
      { title: "探し方を、自分のものに", body: "仮の文言です。" },
    ],
    note: "1:1:1 は目指す形で、結果を約束するものではありません。",
  },
  {
    id: "problem",
    eyebrowEn: "For You",
    eyebrowJp: "こんな人のための部屋",
    heading: ["ひとつでも、", "当てはまるなら。"],
    gold: "",
    lead: "",
    feelings: ["仮1", "仮2", "仮3", "仮4"],
    narrative: ["仮の語り1", "仮の語り2", "仮の語り3", "仮の語り4", "仮の語り5"],
    note: "",
  },
  {
    id: "reframe",
    eyebrowEn: "Reframe",
    eyebrowJp: "見方を変える",
    heading: ["怠け者は、", "才能です。"],
    gold: "才能",
    lead: "",
    quote: ["仮の引用1", "仮の引用2", "仮の引用3"],
    paragraphs: ["仮の段落1。", "仮の段落2。"],
    note: "",
  },
  {
    id: "switch",
    eyebrowEn: "Switch",
    eyebrowJp: "スイッチの中身",
    heading: ["決めた一手を、", "その場で進める。"],
    gold: "その場で",
    lead: "仮の文言です。",
    items: [
      { title: "仮の手順1", body: "仮の文言です。" },
      { title: "仮の手順2", body: "仮の文言です。" },
      { title: "仮の手順3", body: "仮の文言です。" },
    ],
    note: "仮の注記です。",
  },
  {
    id: "contents",
    eyebrowEn: "Inside",
    eyebrowJp: "受け取れるもの",
    heading: ["毎週の配信と、", "個別の面談。"],
    gold: "面談",
    lead: "仮の文言です。",
    items: [
      { title: "仮の中身1", body: "仮の文言です。" },
      { title: "仮の中身2", body: "仮の文言です。" },
      { title: "仮の中身3", body: "仮の文言です。" },
      { title: "仮の中身4", body: "仮の文言です。" },
    ],
    note: "",
  },
  {
    id: "story",
    eyebrowEn: "Story",
    eyebrowJp: "タイちゃんのこと",
    heading: ["今も、", "究極の怠け者。"],
    gold: "怠け者",
    lead: "",
    quote: ["仮の引用1", "仮の引用2", "仮の引用3"],
    paragraphs: ["仮の段落1。", "仮の段落2。", "仮の段落3。"],
    note: "",
  },
];

export const kabuSalonV3Copy = {
  meta: {
    title: `${name} | 本業・副業・投資を、1:1:1に`,
    description: "仮の説明文です。",
  },

  hero: {
    badge: "MEMBERSHIP — 毎週のZoomと、個別面談",
    heading: ["本業・副業・投資を、", "1:1:1に。"],
    gold: "1:1:1",
    lead: ["仮のリード1。", "仮のリード2。"],
    priceLine: `${price}。いつでも解約できます。`,
    /** 募集停止中は解約の話を出さず、価格だけにする */
    priceOnly: `${price}。`,
    cta: "申し込む",
    ctaSecondary: "1:1:1とは",
    secondaryTarget: "ratio",
    ctaNote: "Discordでログインして決済すると、1分ほどで会員の部屋が開きます。",
  },

  /** 1:1:1 の3本の柱の名前(ヒーローの帯と、ratio の節で使う) */
  pillars: ["本業", "副業", "投資"],

  sections,

  pricing: {
    en: "Membership",
    jp: "参加の条件",
    heading: ["毎週の配信と、", "個別の面談。"],
    lead: ["仮の料金リード1。", "仮の料金リード2。"],
    tag: "月額会員",
    limit: kabuSalonV2Copy.pricing.limit,
    includes: [
      `週${zoom.perWeek}回のZoom配信(録画あり)`,
      "個別面談",
      "Discordの部屋(質問できます)",
    ],
    /** 面談の頻度など、このLPだけの注記 */
    ownNotes: ["仮の注記です。"],
    notes: kabuSalonV2Copy.pricing.notes,
    cta: "申し込む",
  },

  fit: {
    yesHeading: "こんな人に来てほしい",
    yes: ["仮1", "仮2", "仮3", "仮4"],
    noHeading: "こんな人には向いていません",
    no: ["仮1", "仮2", "仮3", "仮4"],
  },

  faq: {
    heading: "よくある質問",
    lead: "申し込む前に、よく聞かれること。",
    items: [
      { q: "面談で、買う銘柄は教えてもらえますか?", a: "教えません。仮の文言です。" },
      ...kabuSalonSharedFaq,
      ...kabuSalonBillingFaq,
      {
        q: "投資助言サービスですか?",
        a: "いいえ。投資の考え方と分析の過程を共有する会員制コミュニティであり、金融商品取引法上の投資助言・代理業ではありません。",
      },
    ],
  },

  final: {
    heading: ["スイッチは、", "一緒に押す。"],
    gold: "一緒に",
    sub: "仮の文言です。",
  },

  /** 募集停止中(config の enrollment.v3Open が false)の表示。本線のLPと同じ文言を使う */
  closed: kabuSalonV2Copy.closed,

  postscript: {
    label: "追伸",
    paragraphs: ["仮の追伸1。", "仮の追伸2。"],
  },

  /**
   * シェア用の画像(X などのカード)に描く文字。scripts/kabu-salon-og.mjs の CARDS と同じにする
   * (tests/kabu-salon-share.test.ts が一致を見ている)。
   */
  shareCard: {
    lines: ["本業・副業・投資を、", "1:1:1に。"],
    gold: "1:1:1",
    sub: "毎週のZoom配信と、個別の面談。",
  },

  handle: operator.handle,
} as const;
