/**
 * 株分析サロンLPの写真マニフェスト。
 * 画像ファイルは public/kabu-salon/img/<file> に置く(1600px幅・JPEG品質78程度・1枚300KB以下目安)。
 * ファイルが無いスロットは描画しない(写真なしレイアウトへフォールバック)。
 * 仮画像は <slot>.placeholder.jpg(.gitignore 済み)。本物の <slot>.jpg が置かれるとそちらを優先する。
 * credit があればフッターの免責の下に「Photo: 作者 / 出典」を出す(仮画像には付けない)。
 */
export type KabuSalonImageSlot =
  "okami" | "quote1" | "desk" | "quote2" | "final" | "founder";

export type KabuSalonImageCredit = {
  readonly author: string;
  readonly source: string;
  readonly url: string;
};

export type KabuSalonImage = {
  readonly slot: KabuSalonImageSlot;
  /** public/kabu-salon/img/ からの相対ファイル名。英数字・.・-・_ のみ(export.mjs の data URI 置換が拾える範囲。空白・@・日本語は不可) */
  readonly file: string;
  /** 代替テキスト(装飾写真でも空にしない。背景写真は aria 用途では使わないが記録として持つ) */
  readonly alt: string;
  /** 元画像の想定寸法(<img> の width/height 属性・仮画像の生成サイズ) */
  readonly width: number;
  readonly height: number;
  readonly credit?: KabuSalonImageCredit;
};

/** 公開パス(public 配下)。export.mjs はこのプレフィックスで参照を拾い data URI に置換する */
export const KABU_SALON_IMAGE_DIR = "/kabu-salon/img";

export const kabuSalonImages: ReadonlyArray<KabuSalonImage> = [
  {
    slot: "okami",
    file: "okami.jpg",
    alt: "老舗旅館の廊下に灯る行灯",
    width: 1280,
    height: 1600,
  },
  {
    slot: "quote1",
    file: "quote1.jpg",
    alt: "夕暮れの城と石垣",
    width: 1600,
    height: 900,
  },
  {
    slot: "desk",
    file: "desk.jpg",
    alt: "決算資料と万年筆、ノートと電卓の置かれた机",
    width: 1600,
    height: 900,
  },
  {
    slot: "quote2",
    file: "quote2.jpg",
    alt: "丸の内・大手町のオフィス街の夜景",
    width: 1600,
    height: 900,
  },
  {
    slot: "final",
    file: "final.jpg",
    alt: "夜明け前の都市",
    width: 1600,
    height: 900,
  },
  {
    slot: "founder",
    file: "founder.jpg",
    alt: "主宰 加藤大成",
    width: 1200,
    height: 1600,
  },
];
