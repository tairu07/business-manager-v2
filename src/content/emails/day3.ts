import { launchConfig, type LaunchTopic } from "@/config/launch";
import type { EmailBlock, EmailDefinition } from "@/emails/types";
import { emailUrls } from "@/emails/urls";

/** Day 3: コース案内メール(topicで件名・商品ブロックを切り替える) */
export function day3Definition(topic: LaunchTopic, token?: string): EmailDefinition {
  const urls = emailUrls(token);

  const subjects: Record<LaunchTopic, string> = {
    iphone: "【3/3】iPhone転売を、感覚ではなく仕組みで管理する",
    arbitrage: "【3/3】アービトラージを、感覚ではなく仕組みで検証する",
    both: "【3/3】実践を「再現できる仕組み」に変える",
  };

  const intro: EmailBlock[] = [
    { type: "paragraph", text: "こんにちは、前田です。" },
    {
      type: "paragraph",
      text: "この3日間でお伝えしたかったのは、利益が出そうな案件を見つけること以上に、「判断基準を持つこと」「数字を記録すること」「撤退条件を先に決めること」が重要だということです。",
    },
    {
      type: "paragraph",
      text: "エキスパートとは、未来を完璧に予測できる人ではありません。同じ条件なら、同じ基準で判断できる人です。",
    },
  ];

  const iphoneBlock: EmailBlock[] = [
    { type: "heading", text: "iPhone転売:実務を仕組み化するサービスのご案内" },
    {
      type: "paragraph",
      text: "iPhone転売については、トリック運営から、実務を仕組み化するためのサービスをご案内します。",
    },
    { type: "paragraph", text: "扱う予定のテーマ:" },
    {
      type: "list",
      items: [
        "仕入れ判断の基準",
        "利益計算",
        "在庫回転",
        "販売先と出口戦略",
        "決済枠と資金繰り",
        "発注・在庫管理",
        "失敗事例とリスク管理",
      ],
    },
    { type: "paragraph", text: `販売者:${launchConfig.trick.legalName}` },
    { type: "cta", label: "iPhone転売サービスの詳細を見る", url: urls.iphoneSalesLp },
    { type: "note", text: "この先は、トリック運営が管理する販売ページです。" },
    {
      type: "note",
      text: "購入を希望する場合は、購入者本人がトリック運営の申込みページへ情報を入力します。",
    },
    {
      type: "note",
      text: "配信設定段階で、前田からトリック運営へメールアドレスを提供することはありません。",
    },
  ];

  const arbitrageBlock: EmailBlock[] = [
    { type: "heading", text: "アービトラージ:エキスパートコースのご案内" },
    {
      type: "paragraph",
      text: "アービトラージについては、前田から、一般的な仕組み、検証方法、コスト管理、資金管理を体系化したエキスパートコースをご案内します。",
    },
    { type: "paragraph", text: "扱う予定のテーマ:" },
    {
      type: "list",
      items: [
        "価格差が生まれる構造",
        "手数料を含めたコスト計算",
        "バックテストの読み方",
        "資金管理",
        "証拠金と最大損失",
        "撤退条件",
        "運用記録と検証方法",
        "業者・約定・出金等のリスク",
      ],
    },
    { type: "paragraph", text: `販売者:${launchConfig.sender.legalName}` },
    {
      type: "cta",
      label: "アービトラージエキスパートコースの詳細を見る",
      url: urls.arbitrageSalesLp,
    },
    {
      type: "note",
      text: "本コースは、一般的な仕組み、検証方法、資金管理、リスク管理に関する教育を目的としています。",
    },
    {
      type: "note",
      text: "特定の金融商品、通貨、価格、取引時期または数量について、個別の売買判断を推奨するものではありません。",
    },
  ];

  const closing: EmailBlock[] = [
    {
      type: "paragraph",
      text: "どちらの手法も、魔法のように利益が生まれるものではありません。",
    },
    {
      type: "paragraph",
      text: "だからこそ、判断基準と管理方法を先に整える。そのうえで、ご自身に必要なテーマだけをご確認ください。",
    },
    { type: "paragraph", text: "前田" },
  ];

  return {
    subject: subjects[topic],
    previewText: "判断基準、管理方法、撤退条件を一つの流れにまとめます。",
    blocks: [
      ...intro,
      ...(topic === "iphone" || topic === "both" ? iphoneBlock : []),
      ...(topic === "arbitrage" || topic === "both" ? arbitrageBlock : []),
      ...closing,
    ],
  };
}
