import { NextResponse } from "next/server";
import { z } from "zod";
import { consentTextHash } from "@/lib/consent/consentText";
import {
  recordConsent,
  resolveSubscriberByToken,
} from "@/lib/repositories/subscriberRepository";
import {
  createEmailPreferenceProvider,
  TAGS,
} from "@/lib/integrations/emailPreferenceProvider";
import {
  csrfErrorResponse,
  guardRateLimit,
  invalidTokenResponse,
  isSameOriginRequest,
} from "@/lib/apiGuards";
import { copy } from "@/content/copy";

/**
 * POST /api/preferences/opt-out
 *
 * 全カテゴリー停止。確認画面を経たPOSTでのみ実行される。
 * GET(リンクを開いただけ)では停止しない。
 */

const bodySchema = z.object({
  token: z.string().min(32).max(128),
  consentVersion: z.string().min(1),
  campaignId: z.string().min(1),
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  const limited = guardRateLimit(request, "opt-out", 10);
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

  const result = await recordConsent({
    subscriberId: subscriber.id,
    categories: [],
    action: "all_marketing_opted_out",
    consentVersion: parsed.consentVersion,
    consentTextHash: consentTextHash(),
    campaignId: parsed.campaignId,
    requestId: parsed.requestId,
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.duplicate) {
    try {
      const provider = createEmailPreferenceProvider();
      await provider.unsubscribeFromMarketing(subscriber.id);
      await provider.addTag(subscriber.id, TAGS.optedOut);
    } catch (e) {
      console.error("email provider opt-out sync failed", {
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({ ok: true, duplicate: result.duplicate });
}
