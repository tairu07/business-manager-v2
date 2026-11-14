import type { Metadata } from "next";
import { kabuSalonBaseUrl, kabuSalonConfig } from "@/config/kabuSalon";

const { name, share } = kabuSalonConfig;

/**
 * X・LINE などにリンクを貼ったときのカード用のメタ情報(Open Graph / Twitter Card)。
 * これが無いと、リンクは文字だけで表示されて画像カードが出ない。
 */
export function shareMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  /** サイト内パス(例: /kabu-salon) */
  path: string;
  /** public 配下の画像パス(例: /kabu-salon/og/kabu-salon.png) */
  image: string;
}): Pick<Metadata, "metadataBase" | "alternates" | "openGraph" | "twitter"> {
  const images = [
    {
      url: `${image}?v=${share.version}`,
      width: share.width,
      height: share.height,
      alt: title,
    },
  ];
  return {
    metadataBase: kabuSalonBaseUrl(),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: name,
      url: path,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
