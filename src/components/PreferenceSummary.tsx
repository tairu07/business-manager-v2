import { copy } from "@/content/copy";
import type { Category } from "@/config/launch";

/** 選択内容の短いサマリー表示(確認ボタンの直上に置く) */
export function PreferenceSummary({ categories }: { categories: Category[] }) {
  const labels = categories.map((c) => copy.categoryLabels[c]);
  return (
    <p aria-live="polite" className="text-sm text-body">
      {labels.length > 0 ? (
        <>
          <span className="font-medium text-ink">{copy.preferences.summaryLabel}:</span>
          {labels.join("、")}
        </>
      ) : (
        <span className="text-muted">{copy.preferences.summaryEmpty}</span>
      )}
    </p>
  );
}
