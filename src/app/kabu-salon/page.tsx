import type { Metadata } from "next";
import { kabuSalonConfig } from "@/config/kabuSalon";
import { kabuSalonCopy as copy } from "@/content/kabuSalon";

export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  robots: { index: true, follow: true },
};

/** 申込ボタン(ページ内で3回使う) */
function ApplyButton({ label, id }: { label: string; id: string }) {
  return (
    <a
      id={id}
      href={kabuSalonConfig.urls.apply}
      className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-4 text-center text-base font-bold text-white shadow-sm transition-colors hover:bg-accent-strong sm:w-auto"
    >
      {label}
    </a>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{children}</h2>
  );
}

/**
 * 株分析サロンのランディングページ。
 * 文言は src/content/kabuSalon.ts、価格・URLは src/config/kabuSalon.ts に集約。
 */
export default function KabuSalonPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ヒーロー */}
      <header className="bg-navy-900 px-4 pb-12 pt-6 text-white">
        <div className="mx-auto max-w-xl">
          <p className="text-sm font-semibold tracking-wide text-white/70">
            {copy.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            {copy.hero.heading}
          </h1>
          {copy.hero.lead.map((p) => (
            <p key={p} className="mt-4 text-[15px] leading-loose text-white/90">
              {p}
            </p>
          ))}
          <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm leading-relaxed text-white">
            {copy.hero.priceLine}
          </p>
          <div className="mt-6">
            <ApplyButton label={copy.hero.cta} id="cta-hero" />
            <p className="mt-3 text-xs leading-relaxed text-white/70">
              {copy.hero.ctaNote}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16">
        {/* こんな人へ */}
        <section className="mt-12">
          <SectionHeading>{copy.forWhom.heading}</SectionHeading>
          <ul className="mt-5 space-y-3">
            {copy.forWhom.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-body"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 font-bold text-accent"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 分析の軸 */}
        <section className="mt-14">
          <SectionHeading>{copy.philosophy.heading}</SectionHeading>
          <p className="mt-3 text-[15px] leading-loose text-body">
            {copy.philosophy.lead}
          </p>
          <div className="mt-5 space-y-3">
            {copy.philosophy.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-navy-900 p-5 text-white">
            <h3 className="text-base font-bold">{copy.philosophy.dont.title}</h3>
            <ul className="mt-3 space-y-2">
              {copy.philosophy.dont.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15px] leading-relaxed text-white/90"
                >
                  <span aria-hidden="true" className="shrink-0 font-bold">
                    ×
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 提供内容 */}
        <section className="mt-14">
          <SectionHeading>{copy.offer.heading}</SectionHeading>
          <dl className="mt-5 space-y-4">
            {copy.offer.items.map((item) => (
              <div key={item.title} className="border-l-4 border-accent pl-4">
                <dt className="text-base font-bold text-ink">{item.title}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-body">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 分析の中身 */}
        <section className="mt-14">
          <SectionHeading>{copy.method.heading}</SectionHeading>
          <p className="mt-3 text-[15px] leading-loose text-body">{copy.method.lead}</p>
          <ol className="mt-5 space-y-3">
            {copy.method.items.map((item, i) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl border border-line bg-surface p-5"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-body">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 3段階ラインナップ */}
        <section className="mt-14">
          <SectionHeading>{copy.ladder.heading}</SectionHeading>
          <p className="mt-3 text-[15px] leading-loose text-body">{copy.ladder.lead}</p>
          <div className="mt-5 space-y-3">
            {copy.ladder.tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  tier.highlight
                    ? "rounded-2xl border-2 border-accent bg-accent-soft p-5"
                    : "rounded-2xl border border-line bg-surface p-5"
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-bold text-ink">{tier.name}</h3>
                  <p className="text-sm font-semibold text-ink">{tier.price}</p>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{tier.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 料金 */}
        <section className="mt-14 rounded-2xl border border-line bg-surface p-6">
          <SectionHeading>{copy.pricing.heading}</SectionHeading>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-sm text-muted">{copy.pricing.regularLabel}</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{copy.pricing.regular}</dd>
            </div>
            <div className="rounded-xl bg-accent-soft p-4">
              <dt className="text-sm font-semibold text-accent">
                {copy.pricing.earlyLabel}
              </dt>
              <dd className="mt-1 text-2xl font-bold text-ink">{copy.pricing.early}</dd>
            </div>
          </dl>
          <ul className="mt-5 space-y-2">
            {copy.pricing.notes.map((note) => (
              <li key={note} className="flex gap-3 text-sm leading-relaxed text-body">
                <span aria-hidden="true" className="shrink-0 text-accent">
                  ・
                </span>
                {note}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <ApplyButton label={copy.pricing.cta} id="cta-pricing" />
          </div>
        </section>

        {/* 運営者 */}
        <section className="mt-14">
          <SectionHeading>{copy.operator.heading}</SectionHeading>
          <p className="mt-4 text-base font-bold text-ink">{copy.operator.name}</p>
          {copy.operator.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="mt-3 text-[15px] leading-loose text-body">
              {p}
            </p>
          ))}
        </section>

        {/* 参加の流れ */}
        <section className="mt-14">
          <SectionHeading>{copy.flow.heading}</SectionHeading>
          <ol className="mt-5 list-decimal space-y-3 pl-6 text-[15px] leading-relaxed text-body">
            {copy.flow.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <SectionHeading>{copy.faq.heading}</SectionHeading>
          <div className="mt-5 space-y-3">
            {copy.faq.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-line bg-surface"
              >
                <summary className="cursor-pointer list-none px-5 py-4 text-base font-bold text-ink">
                  <span className="mr-2 text-accent" aria-hidden="true">
                    Q.
                  </span>
                  {item.q}
                </summary>
                <p className="border-t border-line px-5 py-4 text-[15px] leading-relaxed text-body">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 最終CTA */}
        <section className="mt-14 rounded-2xl bg-navy-900 p-6 text-white">
          <p className="text-xl font-bold leading-snug">{copy.hero.heading}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            {copy.hero.priceLine}
          </p>
          <div className="mt-5">
            <ApplyButton label={copy.pricing.cta} id="cta-final" />
          </div>
        </section>

        {/* 免責 */}
        <section className="mt-12">
          <h2 className="text-base font-bold text-ink">{copy.disclaimer.heading}</h2>
          <ul className="mt-3 space-y-2">
            {copy.disclaimer.items.map((item) => (
              <li key={item} className="text-xs leading-relaxed text-muted">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mt-auto bg-navy-900 px-4 py-8 text-sm text-white/85">
        <div className="mx-auto max-w-xl space-y-4">
          <nav aria-label="フッターリンク">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <a
                  href={kabuSalonConfig.urls.privacyPolicy}
                  className="underline underline-offset-4 hover:text-white"
                >
                  {copy.footer.privacyPolicy}
                </a>
              </li>
              <li>
                <a
                  href={kabuSalonConfig.urls.tokushoho}
                  className="underline underline-offset-4 hover:text-white"
                >
                  {copy.footer.tokushoho}
                </a>
              </li>
            </ul>
          </nav>
          <p>
            {copy.footer.contact}:{kabuSalonConfig.operator.contact}
          </p>
          <p className="text-white/70">
            {copy.footer.operatorLabel}:{kabuSalonConfig.operator.legalName}
          </p>
        </div>
      </footer>
    </div>
  );
}
