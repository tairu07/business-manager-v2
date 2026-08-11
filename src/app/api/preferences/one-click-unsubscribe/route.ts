import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { consentTextHash } from "@/lib/consent/consentText";
import { launchConfig } from "@/config/launch";
import {
  recordConsent,
  resolveSubscriberByToken,
} from "@/lib/repositories/subscriberRepository";
import {
  createEmailPreferenceProvider,
  TAGS,
} from "@/lib/integrations/emailPreferenceProvider";
import { guardRateLimit, invalidTokenResponse } from "@/lib/apiGuards";

/**
 * RFC 8058 ワンクリック解除エンドポイント。
 *
 * メールヘッダー List-Unsubscribe / List-Unsubscribe-Post に対応するもので、
 * メールクライアント(Gmail等)の「配信停止」ボタンからPOSTされる。
 * - POSTのみ(GETでは何も変更しない)
 * - メールプロバイダーのサーバーから届くため、同一オリジン検証は行わない
 * - ユーザーがメールクライアント上で明示的に解除操作をした場合のみ送信される
 */
export async function POST(request: Request) {
  const limited = guardRateLimit(request, "one-click-unsubscribe", 10);
  if (limited) return limited;

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  const resolution = await resolveSubscriberByToken(token);
  if (!resolution.ok) {
    return invalidTokenResponse();
  }
  const { subscriber } = resolution;

  // すでに停止済みなら冪等に成功を返す(イベントを重複記録しない)
  if (subscriber.status === "opted_out") {
    return NextResponse.json({ ok: true });
  }

  await recordConsent({
    subscriberId: subscriber.id,
    categories: [],
    action: "all_marketing_opted_out",
    consentVersion: launchConfig.consentVersion,
    consentTextHash: consentTextHash(),
    campaignId: launchConfig.campaignId,
    requestId: randomUUID(),
    userAgent: request.headers.get("user-agent"),
  });

  try {
    const provider = createEmailPreferenceProvider();
    await provider.unsubscribeFromMarketing(subscriber.id);
    await provider.addTag(subscriber.id, TAGS.optedOut);
  } catch (e) {
    console.error("one-click unsubscribe provider sync failed", {
      error: e instanceof Error ? e.message : "unknown",
    });
  }

  return NextResponse.json({ ok: true });
}
