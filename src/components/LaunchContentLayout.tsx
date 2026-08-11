import type { ReactNode } from "react";
import type { LaunchTopic } from "@/config/launch";
import type { DayContent, DaySection } from "@/content/launch/types";
import { SiteFooter } from "@/components/SiteFooter";
import { LaunchContentTracker } from "@/components/LaunchContentTracker";

/** セクション(見出し+段落+リスト)の表示 */
function SectionView({ section }: { section: DaySection }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold leading-snug text-ink">{section.heading}</h2>
      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 20)} className="mt-4 text-[15px] leading-loose text-body">
          {p}
        </p>
      ))}
      {section.list ? (
        <ul className="mt-4 space-y-2">
          {section.list.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-body">
              <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-accent">
                ・
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/**
 * Dayコンテンツページの共通レイアウト。
 * topicに応じて iphone / arbitrage のセクションを出し分ける。
 */
export function LaunchContentLayout({
  content,
  topic,
  children,
}: {
  content: DayContent;
  topic: LaunchTopic;
  children?: ReactNode;
}) {
  const showIphone = topic === "iphone" || topic === "both";
  const showArbitrage = topic === "arbitrage" || topic === "both";

  return (
    <div className="flex min-h-dvh flex-col">
      <LaunchContentTracker dayNumber={content.day} topic={topic} />
      <header className="bg-navy-900 px-4 py-4">
        <div className="mx-auto max-w-xl">
          <p className="text-sm text-white/70">3日間コンテンツ Day {content.day} / 3</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:py-12">
        <article>
          <h1 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {content.title}
          </h1>
          <p className="mt-4 text-[15px] leading-loose text-body">{content.lead}</p>

          {content.commonSections.map((s) => (
            <SectionView key={s.heading} section={s} />
          ))}
          {showIphone &&
            content.iphoneSections.map((s) => (
              <SectionView key={s.heading} section={s} />
            ))}
          {showArbitrage &&
            content.arbitrageSections.map((s) => (
              <SectionView key={s.heading} section={s} />
            ))}

          {content.checklist ? (
            <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-bold text-ink">{content.checklist.title}</h2>
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] text-body">
                {content.checklist.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          ) : null}

          {children}

          {content.closingSections.map((s) => (
            <SectionView key={s.heading} section={s} />
          ))}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
