import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { SiteFooter } from "@/components/SiteFooter";
import { TokenLinkButton } from "@/components/TokenLinkButton";

export const metadata: Metadata = {
  title: "配信を停止しました",
};

export default function OptOutCompletePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-navy-900 px-4 py-3">
        <p className="mx-auto max-w-xl text-sm text-white/85">
          {copy.preferences.headerLabel}
        </p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink">{copy.optOutComplete.heading}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-body">
            {copy.optOutComplete.body}
          </p>
          <p className="mt-4 text-sm text-muted">{copy.optOutComplete.note}</p>

          <div className="mt-8">
            <TokenLinkButton
              label={copy.optOutComplete.resubscribeButton}
              fallback={copy.optOutComplete.resubscribeFallback}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
