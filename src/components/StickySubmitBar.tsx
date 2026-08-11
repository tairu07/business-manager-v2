"use client";

import type { ReactNode } from "react";

/**
 * 確認ボタンのバー。
 * スマートフォンでは画面下部に固定し、md以上では通常フローに戻す。
 */
export function StickySubmitBar({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 固定バーの高さぶんの余白(モバイルのみ) */}
      <div aria-hidden="true" className="h-36 md:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur
          px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]
          md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
      >
        <div className="mx-auto w-full max-w-xl space-y-3">{children}</div>
      </div>
    </>
  );
}
