// このモジュールは node:fs を使うため、サーバーコンポーネント(page.tsx)からのみ import すること。
// クライアントコンポーネントから import するとバンドルに node:fs が入りビルドが落ちる。
import { existsSync } from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import {
  KABU_SALON_IMAGE_DIR,
  kabuSalonImages,
  type KabuSalonImage,
  type KabuSalonImageSlot,
} from "@/content/kabuSalonImages";

/** ファイルの有無で解決済みの写真。src は public 配下の公開パス */
export type ResolvedPhoto = {
  readonly slot: KabuSalonImageSlot;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly credit?: KabuSalonImage["credit"];
  /** 仮画像(<slot>.placeholder.jpg)を使っているか */
  readonly placeholder: boolean;
};

/** 写真枠のレイアウト変種(CSS の .photo--<variant>) */
export type PhotoVariant = "okami" | "desk" | "founder";

/** public/kabu-salon/img/<file> の存在をビルド時に確認する(サーバーコンポーネント / jsdom テストの両方で node:fs が使える) */
export function publicFileExists(file: string): boolean {
  return existsSync(path.join(process.cwd(), "public", KABU_SALON_IMAGE_DIR, file));
}

/**
 * スロットの写真を解決する。本物の <slot>.jpg → 仮画像 <slot>.placeholder.jpg の順に探し、どちらも無ければ null。
 * credit は本物の写真にだけ付く(仮画像に他人の作者名を出さない)。
 * exists はテストで差し替えるための存在判定(既定は public 配下の実ファイル)。
 */
export function resolvePhoto(
  slot: KabuSalonImageSlot,
  manifest: ReadonlyArray<KabuSalonImage> = kabuSalonImages,
  exists: (file: string) => boolean = publicFileExists
): ResolvedPhoto | null {
  const entry = manifest.find((m) => m.slot === slot);
  if (!entry) return null;
  const base = { slot, alt: entry.alt, width: entry.width, height: entry.height };
  if (exists(entry.file)) {
    return {
      ...base,
      src: `${KABU_SALON_IMAGE_DIR}/${entry.file}`,
      credit: entry.credit,
      placeholder: false,
    };
  }
  const placeholder = entry.file.replace(/\.[a-z0-9]+$/i, "") + ".placeholder.jpg";
  if (exists(placeholder)) {
    return { ...base, src: `${KABU_SALON_IMAGE_DIR}/${placeholder}`, placeholder: true };
  }
  return null;
}

/** 背景写真を CSS 変数 --photo で渡す(quote-band / final 用)。写真が無ければ undefined */
export function photoStyle(photo: ResolvedPhoto | null): CSSProperties | undefined {
  if (!photo) return undefined;
  return { ["--photo" as string]: `url("${photo.src}")` } as CSSProperties;
}

/** 金罫フレーム+墨のビネット付きの写真枠。写真が無ければ何も描画しない */
export function Photo({
  photo,
  variant,
  className,
}: {
  photo: ResolvedPhoto | null;
  variant: PhotoVariant;
  className?: string;
}) {
  if (!photo) return null;
  const classes = ["photo", `photo--${variant}`, className].filter(Boolean).join(" ");
  return (
    <figure className={classes}>
      {/* 公開用HTMLでは data URI に置換して単体配信するため next/image は使わない */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

/** フッター免責の下に出す写真クレジット。credit のある写真が1枚も無ければ描画しない */
export function PhotoCredits({
  photos,
}: {
  photos: ReadonlyArray<ResolvedPhoto | null>;
}) {
  const credited = photos.filter(
    (p): p is ResolvedPhoto & { credit: NonNullable<ResolvedPhoto["credit"]> } =>
      Boolean(p && p.credit)
  );
  if (credited.length === 0) return null;
  return (
    <p className="photo-credits">
      {credited.map((p, i) => (
        <span key={p.slot}>
          {i > 0 && <span className="photo-credits__sep"> · </span>}
          Photo:{" "}
          <a href={p.credit.url} target="_blank" rel="noopener noreferrer">
            {p.credit.author} / {p.credit.source}
          </a>
        </span>
      ))}
    </p>
  );
}
