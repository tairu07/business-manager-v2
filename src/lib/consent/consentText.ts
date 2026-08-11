import { createHash } from "node:crypto";
import { copy } from "@/content/copy";

/**
 * 同意文言の全文とハッシュを管理する。
 *
 * ConsentEvent には consentVersion(設定ファイル)と consentTextHash を保存し、
 * 「どのバージョンの、どの文言に同意したか」を後から追跡できるようにする。
 * 文言を変更したら src/config/launch.ts の consentVersion を必ず上げること。
 */

/** 同意対象となる文言の全文(チェックボックス文言+説明文) */
export function consentFullText(): string {
  return [
    copy.preferences.cards.iphone.checkboxLabel,
    copy.preferences.cards.arbitrage.checkboxLabel,
    ...copy.preferences.notice,
  ].join("\n");
}

/** 同意文言全文の SHA-256 ハッシュ */
export function consentTextHash(): string {
  return createHash("sha256").update(consentFullText(), "utf8").digest("hex");
}
