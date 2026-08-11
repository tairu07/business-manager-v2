"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/content/copy";

/**
 * 配信停止の確認ダイアログ。
 * ネイティブ <dialog> を使い、フォーカストラップ・Escで閉じる・
 * スクリーンリーダー対応(aria-modal)をブラウザ標準機能に任せる。
 * 「配信を停止する」を押したときだけ onConfirm(POST)が実行される。
 */
export interface OptOutDialogProps {
  open: boolean;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function OptOutDialog({ open, busy, onConfirm, onCancel }: OptOutDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onCancel={onCancel}
      aria-labelledby="opt-out-dialog-title"
      className="m-auto w-[calc(100vw-2rem)] max-w-md rounded-2xl bg-surface p-6 shadow-xl
        backdrop:bg-navy-900/60"
    >
      <h2 id="opt-out-dialog-title" className="text-lg font-bold text-ink">
        {copy.preferences.optOutDialog.title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-body">
        {copy.preferences.optOutDialog.message}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="min-h-12 rounded-xl bg-danger px-5 font-bold text-white
            hover:bg-danger-strong disabled:opacity-50 sm:flex-1"
        >
          {busy ? "処理中…" : copy.preferences.optOutDialog.confirmButton}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="min-h-12 rounded-xl border border-line bg-surface px-5 font-medium
            text-ink hover:bg-surface-muted disabled:opacity-50 sm:flex-1"
        >
          {copy.preferences.optOutDialog.cancelButton}
        </button>
      </div>
    </dialog>
  );
}
