import type { LaunchTopic } from "@/config/launch";
import type { EmailBlock, EmailDefinition } from "@/emails/types";
import { emailUrls } from "@/emails/urls";

/** Day 1: 教育メール(topicで件名と本文ブロックを切り替える) */
export function day1Definition(topic: LaunchTopic, token?: string): EmailDefinition {
  const urls = emailUrls(token);

  const subjects: Record<LaunchTopic, string> = {
    iphone: "【1/3】iPhone転売で、利益率より先に見る数字",
    arbitrage: "【1/3】アービトラージで、価格差より先に見る数字",
    both: "【1/3】利益率・価格差より先に見る数字",
  };

  const intro: EmailBlock[] = [
    { type: "paragraph", text: "こんにちは、前田です。" },
    {
      type: "paragraph",
      text: "今日から3日間、選んでいただいたテーマについて、実践前に押さえておくべき判断基準をお送りします。",
    },
    {
      type: "paragraph",
      text: "数字を見るとき、多くの人が最初に確認するのは、「いくら利益が出るか」です。",
    },
    {
      type: "paragraph",
      text: "ただ、継続できるかどうかを決めるのは、表面上の利益率だけではありません。",
    },
    {
      type: "paragraph",
      text: "重要なのは、「資金が、どこに、どれくらいの期間拘束されるか」です。",
    },
  ];

  const iphoneBlock: EmailBlock[] = [
    { type: "heading", text: "iPhone転売の場合" },
    {
      type: "paragraph",
      text: "例えば、1台あたりの粗利益が高く見えても、次の要素まで考えると、実際の資金効率は大きく変わります。",
    },
    {
      type: "list",
      items: [
        "販売手数料",
        "送料",
        "決済費用",
        "値下がり",
        "不良や返品",
        "入金までの日数",
        "決済枠の回復時期",
      ],
    },
    {
      type: "paragraph",
      text: "見るべきなのは、単純な1台あたり利益だけではありません。次の4つをセットで見る必要があります。",
    },
    {
      type: "list",
      items: [
        "1. すべての費用を引いた後の利益",
        "2. 仕入れから入金までの日数",
        "3. 在庫回転",
        "4. 決済枠と手元資金の余力",
      ],
    },
  ];

  const arbitrageBlock: EmailBlock[] = [
    { type: "heading", text: "アービトラージの場合" },
    {
      type: "paragraph",
      text: "画面上では価格差が出ていても、次の要素を差し引くと、想定していた利益が残らないことがあります。",
    },
    {
      type: "list",
      items: [
        "売買手数料",
        "スプレッド",
        "約定のずれ",
        "資金移動時間",
        "証拠金維持率",
        "出金条件",
        "業者リスク",
      ],
    },
    {
      type: "paragraph",
      text: "見るべきなのは、単純な価格差だけではありません。次の4つをセットで確認する必要があります。",
    },
    {
      type: "list",
      items: [
        "1. すべての費用を差し引いた後の価格差",
        "2. 必要な証拠金と余剰資金",
        "3. 約定・決済までの時間",
        "4. 資金回収と出金の確実性",
      ],
    },
  ];

  const closing: EmailBlock[] = [
    {
      type: "paragraph",
      text: "表面上の利益率ではなく、「手元資金が、どの速度で、いくら増える設計なのか」を見る。",
    },
    {
      type: "paragraph",
      text: "ここが、単発で終わる人と、継続できる人の大きな違いです。",
    },
    {
      type: "paragraph",
      text: "明日は、「計算上は利益が出ているのに、手元資金が減る理由」を整理します。",
    },
    { type: "cta", label: "Day 1の内容を詳しく見る", url: urls.day(1, topic) },
    { type: "paragraph", text: "前田" },
  ];

  return {
    subject: subjects[topic],
    previewText: "売上や価格差の前に、資金がどこで、どれだけ止まるかを見る。",
    blocks: [
      ...intro,
      ...(topic === "iphone" || topic === "both" ? iphoneBlock : []),
      ...(topic === "arbitrage" || topic === "both" ? arbitrageBlock : []),
      ...closing,
    ],
  };
}
