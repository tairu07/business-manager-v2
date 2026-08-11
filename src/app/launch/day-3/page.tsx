import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { launchConfig } from "@/config/launch";
import { day3Content, day3Products } from "@/content/launch/day3";
import { parseTopic } from "@/lib/launchTopic";
import { LaunchContentLayout } from "@/components/LaunchContentLayout";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: day3Content.title,
};

export default async function Day3Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!launchConfig.contentPages.day3Published) notFound();
  const topic = parseTopic((await searchParams).topic);

  const showIphone = topic === "iphone" || topic === "both";
  const showArbitrage = topic === "arbitrage" || topic === "both";

  return (
    <LaunchContentLayout content={day3Content} topic={topic}>
      {/* 両方選択時も、申込み・決済は商品ごとに分ける(1つにまとめない) */}
      {showIphone ? <ProductCard product={day3Products.iphone} topic={topic} /> : null}
      {showArbitrage ? (
        <ProductCard product={day3Products.arbitrage} topic={topic} />
      ) : null}
    </LaunchContentLayout>
  );
}
