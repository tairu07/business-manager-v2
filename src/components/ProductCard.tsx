"use client";

import { launchConfig, type LaunchTopic } from "@/config/launch";
import type { ProductCardContent } from "@/content/launch/day3";
import { track } from "@/lib/analytics/track";

/**
 * Day 3 の商品カード。
 * 販売者(トリック運営/前田)を明示し、CTAは設定ファイルの外部販売LPへ遷移する。
 * 両方選択時も申込み・決済は商品ごとに分かれたまま(1つにまとめない)。
 */
export function ProductCard({
  product,
  topic,
}: {
  product: ProductCardContent;
  topic: LaunchTopic;
}) {
  const href =
    product.category === "iphone"
      ? launchConfig.urls.iphoneSalesLp
      : launchConfig.urls.arbitrageSalesLp;

  return (
    <section
      aria-labelledby={`product-${product.category}`}
      className="mt-10 rounded-2xl border-2 border-line bg-surface p-6 sm:p-7"
    >
      <p className="text-sm font-medium text-muted">{product.sellerLabel}</p>
      <h2
        id={`product-${product.category}`}
        className="mt-2 text-xl font-bold leading-snug text-ink"
      >
        {product.productName}
      </h2>
      {product.description.map((p) => (
        <p key={p.slice(0, 20)} className="mt-3 text-[15px] leading-relaxed text-body">
          {p}
        </p>
      ))}

      <h3 className="mt-5 text-sm font-bold text-ink">扱う予定のテーマ</h3>
      <ul className="mt-2 space-y-1.5">
        {product.topics.map((t) => (
          <li key={t} className="flex gap-3 text-[15px] text-body">
            <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-accent">
              ・
            </span>
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-surface-muted p-4 text-sm leading-relaxed text-muted">
        {product.cautions.map((c) => (
          <p key={c.slice(0, 20)} className="not-first:mt-2">
            {c}
          </p>
        ))}
      </div>

      <a
        href={href}
        onClick={() =>
          track("sales_lp_clicked", {
            campaign_id: launchConfig.campaignId,
            topic,
            category: product.category,
          })
        }
        className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl
          bg-accent px-6 text-center font-bold text-white hover:bg-accent-strong"
      >
        {product.ctaLabel}
      </a>
    </section>
  );
}
