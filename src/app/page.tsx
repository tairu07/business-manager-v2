import Link from "next/link";
import { launchConfig } from "@/config/launch";
import { demoTokens } from "@/lib/demo/demoTokens";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

/**
 * トップページ。
 * デモモード時はローカル確認用のリンク一覧を表示する。
 * 本番(デモモードOFF)では案内文のみ表示する。
 */
export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-navy-900 px-4 py-4">
        <p className="mx-auto max-w-xl text-sm text-white/85">
          {launchConfig.campaignName}
        </p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
        {launchConfig.demoMode ? (
          <>
            <h1 className="text-xl font-bold text-ink">
              ローカル確認用リンク(デモモード)
            </h1>
            <p className="mt-2 text-sm text-muted">
              シード実行後に利用できます:npm run db:seed
            </p>
            <ul className="mt-6 space-y-2 text-[15px]">
              {[
                {
                  label: "配信設定LP(未選択ユーザー)",
                  href: `/preferences?token=${demoTokens.fresh}`,
                },
                {
                  label: "配信設定LP(iPhone事前選択)",
                  href: `/preferences?token=${demoTokens.fresh}&preset=iphone`,
                },
                {
                  label: "配信設定LP(アービトラージ事前選択)",
                  href: `/preferences?token=${demoTokens.fresh}&preset=arbitrage`,
                },
                {
                  label: "配信設定LP(両方事前選択)",
                  href: `/preferences?token=${demoTokens.fresh}&preset=both`,
                },
                {
                  label: "配信設定LP(選択済み: 両方)",
                  href: `/preferences?token=${demoTokens.bothSelected}`,
                },
                {
                  label: "配信設定LP(配信停止済みユーザー)",
                  href: `/preferences?token=${demoTokens.optedOut}`,
                },
                {
                  label: "配信設定LP(期限切れトークン)",
                  href: `/preferences?token=${demoTokens.expired}`,
                },
                {
                  label: "配信設定LP(無効トークン)",
                  href: `/preferences?token=${demoTokens.invalid}`,
                },
                { label: "Day 1 コンテンツ(both)", href: "/launch/day-1?topic=both" },
                { label: "Day 2 コンテンツ(iphone)", href: "/launch/day-2?topic=iphone" },
                {
                  label: "Day 3 コンテンツ(arbitrage)",
                  href: "/launch/day-3?topic=arbitrage",
                },
                { label: "メールプレビュー", href: "/dev/emails" },
                { label: "株分析サロンLP", href: "/kabu-salon" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-accent underline underline-offset-4 hover:text-accent-strong"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h1 className="text-xl font-bold text-ink">{launchConfig.campaignName}</h1>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
