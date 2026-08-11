"use client";

/**
 * 選択カード。カード全体がクリック可能で、キーボード(Tab + Space)でも操作できる。
 * input はネイティブの checkbox を使い、スクリーンリーダーに正しく伝わるようにする。
 */
export interface PreferenceCardProps {
  id: string;
  title: string;
  description: string;
  note: string;
  checkboxLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function PreferenceCard({
  id,
  title,
  description,
  note,
  checkboxLabel,
  checked,
  onChange,
}: PreferenceCardProps) {
  return (
    <label
      htmlFor={id}
      data-checked={checked}
      className="block cursor-pointer rounded-2xl border-2 bg-surface p-5 sm:p-6 transition-colors
        border-line hover:border-accent/60
        data-[checked=true]:border-accent data-[checked=true]:bg-accent-soft
        has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2"
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1.5 size-5 shrink-0 accent-[var(--accent)]"
          aria-describedby={`${id}-desc`}
        />
        <div>
          <span className="block text-lg font-bold text-ink">{title}</span>
          <span id={`${id}-desc`} className="mt-2 block text-[15px] leading-relaxed">
            {description}
          </span>
          <span className="mt-3 block text-sm text-muted">{note}</span>
          <span className="mt-3 block border-t border-line pt-3 text-sm font-medium text-ink">
            {checkboxLabel}
          </span>
        </div>
      </div>
    </label>
  );
}
