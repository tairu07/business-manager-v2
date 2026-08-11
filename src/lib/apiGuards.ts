import { NextResponse } from "next/server";
import { copy } from "@/content/copy";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rateLimit";

/**
 * APIルート共通のガード処理。
 */

/**
 * CSRF対策: POSTは同一オリジンからのみ受け付ける。
 *
 * 認証にCookieを使わない設計のためCSRF耐性は元々高いが、
 * 多層防御として Origin / Sec-Fetch-Site ヘッダを検証する。
 */
export function isSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return false;
  }
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    try {
      if (new URL(origin).host !== host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

/** 無効・期限切れ・失効済みトークン共通のエラーレスポンス(情報を出し分けない) */
export function invalidTokenResponse(): NextResponse {
  return NextResponse.json(
    {
      error: "invalid_link",
      message: copy.invalidToken.body,
    },
    { status: 404 }
  );
}

export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: "forbidden", message: copy.networkError },
    { status: 403 }
  );
}

export function rateLimitedResponse(): NextResponse {
  return NextResponse.json(
    { error: "rate_limited", message: copy.networkError },
    { status: 429 }
  );
}

/** レート制限チェック。超過時はエラーレスポンスを返し、通過時は null を返す */
export function guardRateLimit(
  request: Request,
  route: string,
  max: number
): NextResponse | null {
  const key = rateLimitKeyFromRequest(request, route);
  if (!checkRateLimit(key, { windowMs: 60_000, max })) {
    return rateLimitedResponse();
  }
  return null;
}
