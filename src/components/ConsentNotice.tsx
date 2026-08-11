import { copy } from "@/content/copy";

/** 選択肢の下に表示する、配信者・販売者の関係とデータ取り扱いの説明 */
export function ConsentNotice() {
  return (
    <div className="rounded-xl bg-surface-muted border border-line p-5 text-sm leading-relaxed text-body">
      {copy.preferences.notice.map((paragraph) => (
        <p key={paragraph.slice(0, 16)} className="not-first:mt-3">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
