import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { launchConfig, type LaunchTopic } from "@/config/launch";
import { emailRegistry, type EmailKey } from "@/emails";
import { parseTopic } from "@/lib/launchTopic";

export const metadata: Metadata = {
  title: "メールプレビュー(開発用)",
};

export const dynamic = "force-dynamic";

const TOPICS: LaunchTopic[] = ["iphone", "arbitrage", "both"];

/**
 * ローカル確認用メールプレビュー画面。
 * デモモード(DEMO_MODE != "false")のときだけ表示される。
 * HTML版とプレーンテキスト版を切り替えて確認できる。
 */
export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!launchConfig.demoMode) notFound();

  const params = await searchParams;
  const emailKey = (
    typeof params.email === "string" && params.email in emailRegistry
      ? params.email
      : "day0"
  ) as EmailKey;
  const topic = parseTopic(params.topic);
  const format = params.format === "text" ? "text" : "html";

  const entry = emailRegistry[emailKey];
  const rendered = entry.render(topic);

  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="bg-navy-900 px-4 py-3">
        <p className="mx-auto max-w-5xl text-sm text-white/85">
          メールプレビュー(開発用・デモモード時のみ表示)
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <nav aria-label="メール選択" className="flex flex-wrap gap-2">
          {(Object.keys(emailRegistry) as EmailKey[]).map((key) => (
            <Link
              key={key}
              href={`/dev/emails?email=${key}&topic=${topic}&format=${format}`}
              aria-current={key === emailKey ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                key === emailKey
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface text-ink hover:bg-accent-soft"
              }`}
            >
              {emailRegistry[key].label}
            </Link>
          ))}
        </nav>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {entry.topicAware ? (
            <div className="flex gap-2" role="group" aria-label="topic切り替え">
              {TOPICS.map((t) => (
                <Link
                  key={t}
                  href={`/dev/emails?email=${emailKey}&topic=${t}&format=${format}`}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    t === topic
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-line bg-surface text-ink"
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">このメールはtopic共通です</p>
          )}
          <div className="flex gap-2" role="group" aria-label="表示形式">
            {(["html", "text"] as const).map((f) => (
              <Link
                key={f}
                href={`/dev/emails?email=${emailKey}&topic=${topic}&format=${f}`}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  f === format
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-line bg-surface text-ink"
                }`}
              >
                {f === "html" ? "HTML版" : "テキスト版"}
              </Link>
            ))}
          </div>
        </div>

        <dl className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
          <div className="flex gap-2">
            <dt className="shrink-0 font-bold text-ink">件名:</dt>
            <dd className="text-body">{rendered.subject}</dd>
          </div>
          <div className="mt-1 flex gap-2">
            <dt className="shrink-0 font-bold text-ink">プレビュー:</dt>
            <dd className="text-body">{rendered.previewText}</dd>
          </div>
        </dl>

        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
          {format === "html" ? (
            <iframe
              title="メールHTMLプレビュー"
              srcDoc={rendered.html}
              className="h-[75vh] w-full"
              sandbox=""
            />
          ) : (
            <pre className="h-[75vh] overflow-auto whitespace-pre-wrap p-5 text-sm leading-relaxed text-body">
              {rendered.text}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
