import type { Metadata } from "next";
import { copy } from "@/content/copy";
import type { Category } from "@/config/launch";
import { SiteFooter } from "@/components/SiteFooter";
import { TokenLinkButton } from "@/components/TokenLinkButton";

export const metadata: Metadata = {
  title: "配信設定を登録しました",
};

export const dynamic = "force-dynamic";

/** クエリ ?c=iphone,arbitrage から選択カテゴリーを読む(個人情報は含まない) */
function categoriesFromQuery(c: string | undefined): Category[] {
  if (!c) return [];
  return c.split(",").filter((v): v is Category => v === "iphone" || v === "arbitrage");
}

export default async function PreferencesCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const categories = categoriesFromQuery(
    typeof params.c === "string" ? params.c : undefined
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-navy-900 px-4 py-3">
        <p className="mx-auto max-w-xl text-sm text-white/85">
          {copy.preferences.headerLabel}
        </p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink">{copy.complete.heading}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-body">
            {copy.complete.body}
          </p>

          {categories.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="登録した配信内容">
              {categories.map((category) => (
                <li
                  key={category}
                  className="rounded-full bg-accent-soft border border-accent/30 px-4 py-1.5
                    text-sm font-medium text-accent-strong"
                >
                  {copy.categoryLabels[category]}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-6 text-sm text-muted">{copy.complete.note}</p>

          <div className="mt-8">
            <TokenLinkButton
              label={copy.complete.changeButton}
              fallback={copy.complete.changeFallback}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
