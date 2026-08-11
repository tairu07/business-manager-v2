import type { DayContent } from "./types";

/** Day 3 コンテンツページ本文(商品カードは day3Products で別管理) */
export const day3Content: DayContent = {
  day: 3,
  title: "実践を、感覚から再現できる仕組みへ",
  lead: "3日間の最後は、判断を「人の感覚」から「再現できる仕組み」へ移すための全体像です。エキスパートとは、未来を完璧に予測できる人ではなく、同じ条件なら同じ基準で判断できる人です。",
  commonSections: [
    {
      heading: "仕組み化の6要素",
      paragraphs: ["手法を問わず、継続できている実践者は次の6つを揃えています。"],
      list: [
        "判断基準:何を、どの条件で対象にするか",
        "実行基準:いくらで、どれだけ、いつ実行するか",
        "記録:判断・実行・結果を残す",
        "検証:記録を見返し、基準を修正する",
        "撤退基準:どこで止めるかを事前に決める",
        "改善:検証結果を次の判断基準に反映する",
      ],
    },
    {
      heading: "記録がないものは検証できない",
      paragraphs: [
        "うまくいった理由も、失敗した理由も、記録がなければ次に活かせません。感覚で続けている限り、成果は運に左右され続けます。",
        "逆に、記録と検証があれば、失敗も「基準を修正するための材料」になります。",
      ],
    },
  ],
  iphoneSections: [],
  arbitrageSections: [],
  closingSections: [
    {
      heading: "最後に",
      paragraphs: [
        "どちらの手法も、魔法のように利益が生まれるものではありません。だからこそ、判断基準と管理方法を先に整える。そのうえで、ご自身に必要なテーマだけをご確認ください。",
      ],
    },
  ],
};

/** Day 3 の商品カード(topicに応じて表示を切り替える) */
export interface ProductCardContent {
  category: "iphone" | "arbitrage";
  productName: string;
  sellerLabel: string;
  description: string[];
  topics: string[];
  cautions: string[];
  ctaLabel: string;
}

export const day3Products: { iphone: ProductCardContent; arbitrage: ProductCardContent } =
  {
    iphone: {
      category: "iphone",
      productName: "【iPhone転売サービス正式名称】",
      sellerLabel: "販売者:トリック運営",
      description: [
        "iPhone転売の実務を仕組み化するためのサービスを、トリック運営がご案内します。",
      ],
      topics: [
        "仕入れ判断の基準",
        "利益計算",
        "在庫回転",
        "販売先と出口戦略",
        "決済枠と資金繰り",
        "発注・在庫管理",
        "失敗事例とリスク管理",
      ],
      cautions: [
        "この先は、トリック運営が管理する販売ページです。",
        "購入を希望する場合は、購入者本人がトリック運営の申込みページへ情報を入力します。",
        "配信設定段階で、前田からトリック運営へメールアドレスを提供することはありません。",
      ],
      ctaLabel: "iPhone転売サービスの詳細を見る",
    },
    arbitrage: {
      category: "arbitrage",
      productName: "アービトラージエキスパートコース",
      sellerLabel: "販売者:前田",
      description: [
        "一般的な仕組み、検証方法、コスト管理、資金管理を体系化したエキスパートコースを、前田がご案内します。",
      ],
      topics: [
        "価格差が生まれる構造",
        "手数料を含めたコスト計算",
        "バックテストの読み方",
        "資金管理",
        "証拠金と最大損失",
        "撤退条件",
        "運用記録と検証方法",
        "業者・約定・出金等のリスク",
      ],
      cautions: [
        "本コースは、一般的な仕組み、検証方法、資金管理、リスク管理に関する教育を目的としています。",
        "特定の金融商品、通貨、価格、取引時期または数量について、個別の売買判断を推奨するものではありません。",
      ],
      ctaLabel: "アービトラージエキスパートコースの詳細を見る",
    },
  };
