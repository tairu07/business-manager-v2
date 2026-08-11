import type { EmailBlock, EmailDefinition } from "@/emails/types";
import { emailUrls } from "@/emails/urls";

/**
 * Day 0: 配信希望確認メール。
 * 全受信者共通(topicによる出し分けなし)。
 */
export function day0Definition(token?: string): EmailDefinition {
  const urls = emailUrls(token);

  const blocks: EmailBlock[] = [
    { type: "paragraph", text: "こんにちは、前田です。" },
    {
      type: "paragraph",
      text: "以前、iPhone転売またはアービトラージに関連する企画へご登録・ご参加いただいた方へお送りしています。",
    },
    {
      type: "paragraph",
      text: "今後、次の2つのテーマについて、実務に使える無料コンテンツと、関連サービスのご案内を配信する予定です。",
    },
    { type: "heading", text: "【iPhone転売】" },
    {
      type: "paragraph",
      text: "利益計算、在庫回転、資金繰り、仕入れ判断など、iPhone転売を事業として管理するための情報",
    },
    { type: "heading", text: "【アービトラージ】" },
    {
      type: "paragraph",
      text: "価格差が生まれる仕組み、コスト計算、バックテスト、資金管理、運用リスクに関する情報",
    },
    {
      type: "paragraph",
      text: "不要な情報までお送りしないため、今後受け取りたいテーマだけを選択してください。",
    },
    {
      type: "paragraph",
      text: "メールアドレスの再入力は不要で、30秒ほどで完了します。",
    },
    { type: "cta", label: "受け取る情報を選ぶ", url: urls.preferences },
    {
      type: "link",
      label: "iPhone転売を選ぶ",
      url: urls.preferencesWithPreset("iphone"),
    },
    {
      type: "link",
      label: "アービトラージを選ぶ",
      url: urls.preferencesWithPreset("arbitrage"),
    },
    { type: "link", label: "両方を選ぶ", url: urls.preferencesWithPreset("both") },
    {
      type: "paragraph",
      text: "iPhone転売に関する有料サービスの販売者はトリック運営です。",
    },
    {
      type: "paragraph",
      text: "アービトラージエキスパートコースの販売者は前田です。",
    },
    {
      type: "paragraph",
      text: "メール配信と配信設定の管理は、すべて前田が行います。",
    },
    {
      type: "paragraph",
      text: "この設定段階で、トリック運営へメールアドレスを提供することはありません。",
    },
    {
      type: "paragraph",
      text: "選択後も、いつでも配信内容の変更または停止が可能です。",
    },
    { type: "paragraph", text: "前田" },
  ];

  return {
    subject: "【ご確認】今後、受け取りたい情報を選んでください",
    previewText: "iPhone転売/アービトラージ。必要なテーマだけ、前田からお送りします。",
    blocks,
  };
}
