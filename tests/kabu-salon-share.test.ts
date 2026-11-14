import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { metadata as lpMetadata } from "@/app/kabu-salon/page";
import { metadata as lpV1Metadata } from "@/app/kabu-salon/v1/page";
import { metadata as lpV3Metadata } from "@/app/kabu-salon/_v3/page";
import { kabuSalonBaseUrl, kabuSalonConfig } from "@/config/kabuSalon";
import { kabuSalonCopy } from "@/content/kabuSalon";
import { kabuSalonV2Copy } from "@/content/kabuSalonV2";
import { kabuSalonV3Copy } from "@/content/kabuSalonV3";

const ROOT = path.resolve(__dirname, "..");
const { share, urls } = kabuSalonConfig;

/** PNG の IHDR から幅と高さを読む */
function pngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  expect(buf.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("株分析サロンLP シェア時のカード(X など)", () => {
  it("公開URLの土台は、SITE_URL が無ければ告知で使っているドメインになる", () => {
    expect(kabuSalonBaseUrl({}).origin).toBe(urls.site);
    expect(kabuSalonBaseUrl({ SITE_URL: "https://kabu.example.jp" }).origin).toBe(
      "https://kabu.example.jp"
    );
    // 不正な SITE_URL は無視して既定へ戻す
    expect(kabuSalonBaseUrl({ SITE_URL: "http://kabu.example.jp" }).origin).toBe(
      urls.site
    );
    expect(urls.site).toMatch(/^https:\/\/[a-z0-9.-]+$/);
  });

  it.each([
    ["本線(新LP)", lpMetadata, urls.lp, share.images.lp, kabuSalonV2Copy.meta],
    ["前のLP", lpV1Metadata, urls.lpV1, share.images.lpV1, kabuSalonCopy.meta],
    ["3つ目のLP", lpV3Metadata, urls.lpV3, share.images.lpV3, kabuSalonV3Copy.meta],
  ] as const)(
    "%s: 大きい画像カードの情報が揃っている",
    (_name, meta, lpPath, image, copy) => {
      expect(meta.metadataBase).toBeInstanceOf(URL);
      expect(meta.alternates?.canonical).toBe(lpPath);

      const og = meta.openGraph as {
        title: string;
        description: string;
        url: string;
        images: { url: string; width: number; height: number; alt: string }[];
      };
      expect(og.title).toBe(copy.title);
      expect(og.description).toBe(copy.description);
      expect(og.url).toBe(lpPath);
      expect(og.images).toHaveLength(1);
      expect(og.images[0].url).toBe(`${image}?v=${share.version}`);
      expect(og.images[0].alt).not.toBe("");

      const tw = meta.twitter as { card: string; images: { url: string }[] };
      expect(tw.card).toBe("summary_large_image");
      expect(tw.images[0].url).toBe(og.images[0].url);

      // 画像の実体がある・寸法が設定どおり・X の上限(5MB)より十分小さい
      const file = path.join(ROOT, "public", image);
      expect(pngSize(file)).toEqual({ width: share.width, height: share.height });
      expect(og.images[0]).toMatchObject({ width: share.width, height: share.height });
      expect(statSync(file).size).toBeLessThan(1024 * 1024);
    }
  );

  it("カードの文言は、LPの見出しと同じ(見出しを変えたら画像も作り直す)", () => {
    const script = readFileSync(path.join(ROOT, "scripts", "kabu-salon-og.mjs"), "utf8");
    for (const line of [...kabuSalonCopy.hero.heading, ...kabuSalonV2Copy.hero.heading]) {
      expect(script).toContain(`"${line}"`);
    }
    expect(script).toContain(`"${kabuSalonConfig.name}"`);
  });

  it("本線には新LPの見出しのカード、前のLPには前のLPの見出しのカードが付く(取り違えない)", () => {
    const script = readFileSync(path.join(ROOT, "scripts", "kabu-salon-og.mjs"), "utf8");
    /** スクリプトの CARDS から、そのファイルに描く見出しの行を読む */
    const cardLines = (image: string): string[] => {
      const file = path.basename(image).replace(/\./g, "\\.");
      const found = script.match(
        new RegExp(`file: "${file}",\\s*lines: (\\[[^\\]]*\\])`)
      );
      expect(found).not.toBeNull();
      return JSON.parse(found?.[1] ?? "[]") as string[];
    };
    expect(cardLines(share.images.lp)).toEqual([...kabuSalonV2Copy.hero.heading]);
    expect(cardLines(share.images.lpV1)).toEqual([...kabuSalonCopy.hero.heading]);
    // 3つ目のLPは、見出しが3行になることがあるので、カード用の2行を文言ファイルに持つ
    expect(cardLines(share.images.lpV3)).toEqual([...kabuSalonV3Copy.shareCard.lines]);
    const images = [share.images.lp, share.images.lpV1, share.images.lpV3];
    expect(new Set(images).size).toBe(images.length);
  });
});
