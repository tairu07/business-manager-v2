import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { launchConfig } from "@/config/launch";
import {
  parseCategories,
  resolveSubscriberByToken,
} from "@/lib/repositories/subscriberRepository";
import { presetToCategories } from "@/lib/preset";
import { PreferenceForm } from "@/components/PreferenceForm";
import { SiteFooter } from "@/components/SiteFooter";
import { InvalidLinkNotice } from "@/components/InvalidLinkNotice";

export const metadata: Metadata = {
  title: "受け取りたい情報を選ぶ",
};

// トークンごとに内容が変わるため常に動的レンダリング
export const dynamic = "force-dynamic";

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const preset = typeof params.preset === "string" ? params.preset : undefined;
  const intent = typeof params.intent === "string" ? params.intent : undefined;

  // GETアクセスでは検証・表示のみ。DBの状態は一切変更しない
  const resolution = await resolveSubscriberByToken(token);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-navy-900 px-4 py-3">
        <p className="mx-auto max-w-xl text-sm text-white/85">
          {copy.preferences.headerLabel}
        </p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:py-12">
        {resolution.ok ? (
          <>
            <h1 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
              {copy.preferences.heading}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-body">
              {copy.preferences.subheading}
            </p>
            <div className="mt-8">
              <PreferenceForm
                token={token!}
                maskedEmail={resolution.subscriber.maskedEmail}
                initialCategories={
                  // 保存済みの選択があればそれを表示し、なければ preset を事前選択
                  resolution.subscriber.categories !== null
                    ? parseCategories(resolution.subscriber.categories)
                    : (presetToCategories(preset) ?? [])
                }
                startWithOptOutDialog={intent === "opt-out"}
              />
            </div>
          </>
        ) : (
          <InvalidLinkNotice supportEmail={launchConfig.sender.supportEmail} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
