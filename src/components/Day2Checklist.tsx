"use client";

import { useState } from "react";
import type { DayChecklist } from "@/content/launch/types";

/**
 * Day 2 の入力可能な簡易チェックリスト。
 * 入力データはサーバーへ送信せず、ブラウザ内(state)だけで完結する。
 */
export function Day2Checklist({ checklist }: { checklist: DayChecklist }) {
  const [checked, setChecked] = useState<boolean[]>(() =>
    checklist.items.map(() => false)
  );

  const doneCount = checked.filter(Boolean).length;

  return (
    <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-bold text-ink">{checklist.title}</h2>
      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {doneCount} / {checklist.items.length} 項目を満たしています
      </p>
      <ul className="mt-4 space-y-3">
        {checklist.items.map((item, i) => (
          <li key={item}>
            <label
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-line
              p-3 hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => {
                  const next = [...checked];
                  next[i] = e.target.checked;
                  setChecked(next);
                }}
                className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
              />
              <span className="text-[15px] leading-relaxed text-body">{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
