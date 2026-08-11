import { NextResponse } from "next/server";
import { z } from "zod";
import { consentTextHash } from "@/lib/consent/consentText";
import {
  recordConsent,
  resolveSubscriberByToken,
} from "@/lib/repositories/subscriberRepository";
import { createEmailPreferenceProvider } from "@/lib/integrations/emailPreferenceProvider";
import {
  csrfErrorResponse,
  guardRateLimit,
  invalidTokenResponse,
  isSameOriginRequest,
} from "@/lib/apiGuards";
import { copy } from "@/content/copy";

/**
 * POST /api/preferences/confirm
 *
 * 配信設定の確定。GETでは確定しない(必ずLP上のボタンからのPOST)。
 * requestId により冪等(二重クリック・再送でも重複記録しない)。
 */

const bodySchema = z.object({
  token: z.string().min(32).max(128),
  categories: z
    .array(z.enum(["iphone", "arbitrage"]))
    .min(1, "カテゴリーを1つ以上選択してください")
    .max(2),
  consentVersion: z.string().min(1),
  campaignId: z.string().min(1),
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  const limited = guardRateLimit(request, "confirm", 10);
  if (limited) return limited;

  if (!isSameOriginRequest(request)) {
    return csrfErrorResponse();
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: copy.networkError },
      { status: 400 }
    );
  }

  const resolution = await resolveSubscriberByToken(parsed.token);
  if (!resolution.ok) {
    return invalidTokenResponse();
  }
  const { subscriber } = resolution;

  // 重複配列を正規化(両方選択時は iphone / arbitrage を個別に保存)
  const categories = [...new Set(parsed.categories)];

  const hadPreviousSelection = subscriber.categories !== null;
  const result = await recordConsent({
    subscriberId: subscriber.id,
    categories,
    action: hadPreviousSelection ? "preferences_updated" : "consent_confirmed",
    consentVersion: parsed.consentVersion,
    consentTextHash: consentTextHash(),
    campaignId: parsed.campaignId,
    requestId: parsed.requestId,
    userAgent: request.headers.get("user-agent"),
  });

  // メール配信システムへのタグ連携(デモ環境ではMock、外部送信なし)
  if (!result.duplicate) {
    try {
      await createEmailPreferenceProvider().updatePreferences(subscriber.id, categories);
    } catch (e) {
      // 連携失敗は同意記録を巻き戻さない。個人情報を含めずログのみ
      console.error("email provider sync failed", {
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({ ok: true, categories, duplicate: result.duplicate });
}
