import { NextResponse } from "next/server";
import {
  resolveSubscriberByToken,
  parseCategories,
} from "@/lib/repositories/subscriberRepository";
import { guardRateLimit, invalidTokenResponse } from "@/lib/apiGuards";

/**
 * GET /api/preferences/resolve?token=...
 *
 * - トークン検証
 * - マスキング済みメールアドレスと現在の選択状態を返す
 * - GETでは一切データを更新しない(メールスキャナーがリンクを開いても安全)
 */
export async function GET(request: Request) {
  const limited = guardRateLimit(request, "resolve", 30);
  if (limited) return limited;

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  const resolution = await resolveSubscriberByToken(token);
  if (!resolution.ok) {
    // 無効・期限切れを区別せず共通エラー(登録状態を推測させない)
    return invalidTokenResponse();
  }

  const { subscriber } = resolution;
  return NextResponse.json({
    maskedEmail: subscriber.maskedEmail,
    status: subscriber.status,
    categories: parseCategories(subscriber.categories),
    hasSaved: subscriber.categories !== null,
  });
}
