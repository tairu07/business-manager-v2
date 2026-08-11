import { prisma } from "@/lib/db";
import { hashToken, isPlausibleToken } from "@/lib/tokens/token";
import type { Category } from "@/config/launch";
import type { Subscriber } from "@prisma/client";

/**
 * 購読者リポジトリ。
 * トークン検証を含むDBアクセスをここに集約する。
 */

export type TokenResolution =
  { ok: true; subscriber: Subscriber } | { ok: false; reason: "invalid" | "expired" };

/**
 * トークンから購読者を引く。
 * 無効・期限切れ・失効済みのいずれでも、呼び出し側には
 * 個人情報の有無を推測できない共通のエラー表示をさせること。
 */
export async function resolveSubscriberByToken(token: unknown): Promise<TokenResolution> {
  if (!isPlausibleToken(token)) {
    return { ok: false, reason: "invalid" };
  }
  const subscriber = await prisma.subscriber.findUnique({
    where: { preferenceTokenHash: hashToken(token) },
  });
  if (!subscriber) {
    return { ok: false, reason: "invalid" };
  }
  if (subscriber.tokenExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, subscriber };
}

/** JSON文字列で保存されたカテゴリー配列を安全に読み出す */
export function parseCategories(raw: string | null): Category[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is Category => c === "iphone" || c === "arbitrage");
  } catch {
    return [];
  }
}

export interface RecordConsentInput {
  subscriberId: string;
  categories: Category[];
  action: "consent_confirmed" | "preferences_updated" | "all_marketing_opted_out";
  consentVersion: string;
  consentTextHash: string;
  campaignId: string;
  requestId: string;
  userAgent?: string | null;
}

export interface RecordConsentResult {
  /** 同一requestIdの再送(二重POST)だった場合 true */
  duplicate: boolean;
}

/**
 * 選択内容の保存と ConsentEvent の記録をトランザクションで行う。
 *
 * requestId のユニーク制約により冪等:
 * 同じ requestId で二重POSTされても ConsentEvent は1件しか記録されず、
 * 購読者の状態も不整合にならない。
 */
export async function recordConsent(
  input: RecordConsentInput
): Promise<RecordConsentResult> {
  const status = input.action === "all_marketing_opted_out" ? "opted_out" : "active";
  const categoriesJson = JSON.stringify(input.categories);

  try {
    await prisma.$transaction([
      prisma.consentEvent.create({
        data: {
          subscriberId: input.subscriberId,
          categories: categoriesJson,
          action: input.action,
          consentVersion: input.consentVersion,
          consentTextHash: input.consentTextHash,
          campaignId: input.campaignId,
          requestId: input.requestId,
          userAgent: input.userAgent ?? null,
        },
      }),
      prisma.subscriber.update({
        where: { id: input.subscriberId },
        data: { categories: categoriesJson, status },
      }),
    ]);
    return { duplicate: false };
  } catch (e: unknown) {
    // P2002 = unique制約違反(requestId重複) → 二重POST。状態は初回POSTで確定済み
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return { duplicate: true };
    }
    throw e;
  }
}
