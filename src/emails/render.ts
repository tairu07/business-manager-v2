import { launchConfig } from "@/config/launch";
import type { EmailBlock, EmailDefinition, RenderedEmail } from "./types";
import { emailUrls } from "./urls";

/**
 * EmailDefinition から HTML版とプレーンテキスト版を生成する。
 *
 * - スマートフォンで読みやすい1カラム(最大600px)
 * - 画像を使わず、画像非表示でも内容が伝わる
 * - 全メール共通フッター: 配信者 / 問い合わせ先 / 設定変更 / 配信停止
 */

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** URL内の {{TOKEN}} 等のマージタグはエスケープ対象外の文字のみで構成される前提 */
function blockToHtml(block: EmailBlock): string {
  switch (block.type) {
    case "paragraph":
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.9;color:#2b3a52;">${escapeHtml(block.text)}</p>`;
    case "heading":
      return `<p style="margin:24px 0 12px;font-size:16px;line-height:1.6;font-weight:bold;color:#0b1f3a;">${escapeHtml(block.text)}</p>`;
    case "list":
      return `<ul style="margin:0 0 16px;padding-left:20px;">${block.items
        .map(
          (item) =>
            `<li style="margin:0 0 6px;font-size:15px;line-height:1.8;color:#2b3a52;">${escapeHtml(item)}</li>`
        )
        .join("")}</ul>`;
    case "cta":
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;"><tr><td style="border-radius:10px;background:#1d4ed8;">
<a href="${block.url}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(block.label)}</a>
</td></tr></table>`;
    case "link":
      return `<p style="margin:0 0 10px;font-size:15px;line-height:1.8;"><a href="${block.url}" style="color:#1d4ed8;text-decoration:underline;">${escapeHtml(block.label)}</a></p>`;
    case "note":
      return `<p style="margin:0 0 16px;font-size:13px;line-height:1.8;color:#5b6b82;">${escapeHtml(block.text)}</p>`;
  }
}

function blockToText(block: EmailBlock): string {
  switch (block.type) {
    case "paragraph":
      return `${block.text}\n`;
    case "heading":
      return `■ ${block.text}\n`;
    case "list":
      return block.items.map((item) => `・${item}`).join("\n") + "\n";
    case "cta":
      return `▼${block.label}\n${block.url}\n`;
    case "link":
      return `${block.label}\n${block.url}\n`;
    case "note":
      return `※${block.text}\n`;
  }
}

function footerBlocks(token?: string): { html: string; text: string } {
  const urls = emailUrls(token);
  const sender = launchConfig.sender;
  const html = `
<tr><td style="padding:24px 24px 32px;border-top:1px solid #dde3ec;">
<p style="margin:0 0 8px;font-size:12px;line-height:1.8;color:#5b6b82;">このメールは、過去に関連企画へご登録・ご参加いただいた方へ、${escapeHtml(sender.displayName)}からお送りしています。</p>
<p style="margin:0 0 8px;font-size:12px;line-height:1.8;color:#5b6b82;">配信者:${escapeHtml(sender.legalName)}<br>お問い合わせ:${escapeHtml(sender.contact)}</p>
<p style="margin:0;font-size:12px;line-height:2;">
<a href="${urls.preferences}" style="color:#5b6b82;text-decoration:underline;">配信設定を変更する</a><br>
<a href="${urls.optOut}" style="color:#5b6b82;text-decoration:underline;">配信を停止する</a>
</p>
</td></tr>`;
  const text = [
    "------------------------------------------",
    `このメールは、過去に関連企画へご登録・ご参加いただいた方へ、${sender.displayName}からお送りしています。`,
    `配信者:${sender.legalName}`,
    `お問い合わせ:${sender.contact}`,
    "",
    "配信設定を変更する:",
    urls.preferences,
    "",
    "配信を停止する:",
    urls.optOut,
  ].join("\n");
  return { html, text };
}

export function renderEmail(definition: EmailDefinition, token?: string): RenderedEmail {
  const footer = footerBlocks(token);
  const bodyHtml = definition.blocks.map(blockToHtml).join("\n");

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(definition.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;">
<!-- プレビューテキスト(受信トレイの抜粋表示用・本文には表示されない) -->
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(definition.previewText)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#0b1f3a;padding:16px 24px;">
<p style="margin:0;font-size:13px;color:#ffffffd9;">${escapeHtml(launchConfig.sender.displayName)}からのお知らせ</p>
</td></tr>
<tr><td style="padding:28px 24px;">
${bodyHtml}
</td></tr>
${footer.html}
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [definition.blocks.map(blockToText).join("\n"), "", footer.text].join(
    "\n"
  );

  return {
    subject: definition.subject,
    previewText: definition.previewText,
    html,
    text,
  };
}
