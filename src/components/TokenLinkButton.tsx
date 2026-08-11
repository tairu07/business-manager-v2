"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

function readToken(): string | null {
  try {
    return sessionStorage.getItem("pref_token");
  } catch {
    return null;
  }
}

/**
 * sessionStorage に保持したトークンで配信設定LPへ戻るボタン。
 * URLへトークンを再掲する画面を増やさないため、完了画面には
 * クエリでトークンを渡さず、この方法でリンクを組み立てる。
 * トークンが取得できない場合はフォールバック文言を表示する。
 */
export function TokenLinkButton({
  label,
  fallback,
}: {
  label: string;
  fallback: string;
}) {
  // SSRではnull(フォールバック表示)、クライアントでsessionStorageから読む
  const token = useSyncExternalStore(subscribeNoop, readToken, () => null);

  if (!token) {
    return <p className="text-sm text-muted">{fallback}</p>;
  }

  return (
    <a
      href={`/preferences?token=${encodeURIComponent(token)}`}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl
        border-2 border-accent px-6 font-bold text-accent hover:bg-accent-soft sm:w-auto"
    >
      {label}
    </a>
  );
}
