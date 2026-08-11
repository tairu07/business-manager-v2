import type { LaunchTopic } from "@/config/launch";
import type { EmailBlock, EmailDefinition } from "@/emails/types";
import { emailUrls } from "@/emails/urls";

/** Day 2: 教育メール(件名は全topic共通、本文ブロックをtopicで切り替える) */
export function day2Definition(topic: LaunchTopic, token?: string): EmailDefinition {
  const urls = emailUrls(token);

  const intro: EmailBlock[] = [
    { type: "paragraph", text: "こんにちは、前田です。" },
    {
      type: "paragraph",
      text: "昨日は、表面上の利益率や価格差だけでなく、「資金がどこに、どれくらいの期間拘束されるか」を見る重要性についてお伝えしました。",
    },
    {
      type: "paragraph",
      text: "今日は、「利益計算上はプラスなのに、なぜか手元資金が減る」という状態が起きる3つの理由を整理します。",
    },
    { type: "heading", text: "1つ目:費用を後から計算していること" },
    {
      type: "paragraph",
      text: "利益を確認してから手数料や送料を引くのではなく、判断する最初の段階で、すべての費用を織り込む必要があります。",
    },
    { type: "heading", text: "2つ目:資金拘束を利益計算に入れていないこと" },
    {
      type: "paragraph",
      text: "同じ1万円の利益でも、10日で回収できる取引と、90日間資金が止まる取引では、資金効率がまったく異なります。",
    },
    { type: "heading", text: "3つ目:出口が確定していないこと" },
    {
      type: "paragraph",
      text: "仕入れやエントリーの条件だけを決めても、次のことが決まっていなければ、利益は確定しません。",
    },
    {
      type: "list",
      items: [
        "どこで売るのか",
        "どの条件で撤退するのか",
        "どれだけ損失を許容するのか",
        "資金をどう回収するのか",
      ],
    },
  ];

  const iphoneBlock: EmailBlock[] = [
    { type: "heading", text: "iPhone転売の場合" },
    {
      type: "paragraph",
      text: "iPhone転売では、「仕入れられるか」より先に、「いつ、どこで、いくらで現金化できるか」を決めておくことが重要です。",
    },
    {
      type: "paragraph",
      text: "仕入れ判断、販売先、入金日、返品リスクまでを一つの管理表で確認できる状態が理想です。",
    },
  ];

  const arbitrageBlock: EmailBlock[] = [
    { type: "heading", text: "アービトラージの場合" },
    {
      type: "paragraph",
      text: "アービトラージでは、「価格差が発生したか」より先に、「費用を差し引いても残るか」「決済可能か」「資金を回収できるか」を確認する必要があります。",
    },
    {
      type: "paragraph",
      text: "エントリー条件だけでなく、撤退条件、最大損失、証拠金余力を事前に決めておくことが重要です。",
    },
  ];

  const closing: EmailBlock[] = [
    {
      type: "paragraph",
      text: "利益を大きく見せることよりも、「失敗したとき、どこまでの損失で止められるか」を決める。",
    },
    { type: "paragraph", text: "これが、長く継続するための土台になります。" },
    {
      type: "paragraph",
      text: "明日は、これらの判断を属人的な感覚ではなく、「再現できる仕組み」に変えるための全体像をお送りします。",
    },
    { type: "cta", label: "Day 2の内容を詳しく見る", url: urls.day(2, topic) },
    { type: "paragraph", text: "前田" },
  ];

  return {
    subject: "【2/3】利益が出ているのに、資金が減る理由",
    previewText: "見落としやすいのは、費用、資金拘束、出口の3つです。",
    blocks: [
      ...intro,
      ...(topic === "iphone" || topic === "both" ? iphoneBlock : []),
      ...(topic === "arbitrage" || topic === "both" ? arbitrageBlock : []),
      ...closing,
    ],
  };
}
