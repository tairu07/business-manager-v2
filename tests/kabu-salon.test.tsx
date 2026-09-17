// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonPage from "@/app/kabu-salon/page";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonCopy } from "@/content/kabuSalon";
import { kabuSalonImages } from "@/content/kabuSalonImages";
import { PhotoCredits, resolvePhoto } from "@/app/kabu-salon/photos";

/** 投資助言・断定表現と誤認されうる語(弁護士指針: 推奨・煽動の線引き) */
const FORBIDDEN_PHRASES = [
  "必ず儲",
  "確実に儲",
  "元本保証",
  "絶対に上が",
  "買い推奨",
  "推奨銘柄を配信",
];

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

/**
 * 写真ファイルの存在判定を差し替える(resolvePhoto の exists 引数)。
 * null なら実ファイルを見る(既定)。true/false で「全スロットあり/なし」を強制し、
 * 仮画像の無い CI でも page 側の出し分けを検証できるようにする。
 */
const fsState = vi.hoisted(() => ({ exists: null as boolean | null }));
vi.mock("@/app/kabu-salon/photos", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/app/kabu-salon/photos")>();
  const resolvePhoto: typeof real.resolvePhoto = (slot, manifest, exists) =>
    real.resolvePhoto(
      slot,
      manifest,
      (file) => fsState.exists ?? (exists ?? real.publicFileExists)(file)
    );
  return { ...real, resolvePhoto };
});

afterEach(() => {
  cleanup();
  fsState.exists = null;
});

describe("株分析サロンLP", () => {
  it("価格は設定ファイルから計算され、税込併記で表示される", () => {
    render(<KabuSalonPage />);
    const regular = yen(kabuSalonConfig.pricing.regular);
    const regularTax = yen(withTax(kabuSalonConfig.pricing.regular));
    const early = yen(kabuSalonConfig.pricing.earlyBird);
    expect(withTax(20000)).toBe(22000);
    expect(
      screen.getAllByText(new RegExp(`${regular}.*税込 ${regularTax}`)).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(early)).length).toBeGreaterThan(0);
  });

  it("申込ボタンは全て設定の申込URLへ向く", () => {
    render(<KabuSalonPage />);
    const links = screen.getAllByRole("link", { name: /申し込む/ });
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      expect(link).toHaveAttribute("href", kabuSalonConfig.urls.apply);
    }
  });

  it("免責事項と「投資助言ではない」旨が、折り畳みの外(免責文)に表示される", () => {
    const { container } = render(<KabuSalonPage />);
    const heading = screen.getByRole("heading", { name: "免責事項" });
    expect(heading).toBeInTheDocument();
    // FAQ(<details>)の回答だけでなく、常時見える免責文にも明記されていること
    const disclaimer = heading.parentElement;
    expect(disclaimer?.textContent).toMatch(/投資助言・代理業ではありません/);
    expect(screen.getAllByText(/投資助言・代理業ではありません/).length).toBeGreaterThan(
      1
    );
    // プレースホルダーの問い合わせ先は描画しない
    expect(container.textContent).not.toContain("【問い合わせ先");
  });

  it("文言(content と描画結果の両方)に利回りの約束・推奨と誤認される表現を含まない", () => {
    const fromContent = collectStrings(kabuSalonCopy).join("\n");
    const { container } = render(<KabuSalonPage />);
    const rendered = container.textContent ?? "";
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(fromContent).not.toContain(phrase);
      expect(rendered).not.toContain(phrase);
    }
  });

  it("運営者はSENRITSUで、ラクマル愛好会の価格には触れない", () => {
    render(<KabuSalonPage />);
    expect(screen.getAllByText(/株式会社SENRITSU/).length).toBeGreaterThan(0);
    const all = collectStrings(kabuSalonCopy).join("\n");
    expect(all).not.toContain("ラクマル");
    expect(all).not.toContain("9,000");
  });

  it("写真マニフェストの各スロットは alt・寸法を持ち、slot が重複しない", () => {
    const slots = kabuSalonImages.map((m) => m.slot);
    expect(new Set(slots).size).toBe(slots.length);
    for (const m of kabuSalonImages) {
      expect(m.alt.trim()).not.toBe("");
      expect(m.file).toMatch(/\.jpe?g$/);
      expect(m.width).toBeGreaterThan(0);
      expect(m.height).toBeGreaterThan(0);
    }
  });

  it("写真はファイルが無ければ描画されず、あれば width/height と lazy 付きの <img> になる", () => {
    // マニフェストに無いファイル → null(写真なしレイアウトへフォールバック)
    expect(
      resolvePhoto("okami", [
        { slot: "okami", file: "__missing__.jpg", alt: "x", width: 10, height: 10 },
      ])
    ).toBeNull();
    const { container } = render(<KabuSalonPage />);
    for (const img of Array.from(container.querySelectorAll(".photo img"))) {
      expect(img.getAttribute("alt")).not.toBe("");
      expect(img.getAttribute("loading")).toBe("lazy");
      expect(Number(img.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(img.getAttribute("height"))).toBeGreaterThan(0);
    }
  });

  it("写真が全てあれば --photo 系のクラスと style が出て、無ければ一切出ない", () => {
    fsState.exists = true;
    const withPhotos = render(<KabuSalonPage />);
    const c = withPhotos.container;
    expect(c.querySelectorAll(".photo--okami img")).toHaveLength(1);
    expect(c.querySelectorAll(".photo--desk img")).toHaveLength(1);
    expect(c.querySelectorAll(".photo--founder img")).toHaveLength(1);
    // okami は .okami グリッド直下の子(grid-column を効かせるため)
    expect(c.querySelector(".okami > .photo--okami")).not.toBeNull();
    expect(c.querySelectorAll(".quote-band--photo")).toHaveLength(2);
    expect(c.querySelectorAll(".final--photo")).toHaveLength(1);
    expect(c.querySelectorAll(".process__head--photo")).toHaveLength(1);
    for (const el of Array.from(
      c.querySelectorAll(".quote-band--photo, .final--photo")
    )) {
      expect(el.getAttribute("style")).toMatch(/--photo:\s*url\(/);
    }
    // 本物の <slot>.jpg が優先される
    expect(resolvePhoto("okami")).toMatchObject({
      src: "/kabu-salon/img/okami.jpg",
      placeholder: false,
    });
    withPhotos.unmount();

    fsState.exists = false;
    const { container } = render(<KabuSalonPage />);
    expect(container.querySelectorAll(".photo")).toHaveLength(0);
    expect(
      container.querySelectorAll(
        ".quote-band--photo, .final--photo, .process__head--photo, [style*='--photo']"
      )
    ).toHaveLength(0);
    expect(container.querySelectorAll(".photo-credits")).toHaveLength(0);
    expect(resolvePhoto("okami")).toBeNull();
  });

  it("credit のある写真があればフッターに Photo クレジットが出る(無ければ出ない)", () => {
    const base = {
      src: "/kabu-salon/img/x.jpg",
      alt: "x",
      width: 1,
      height: 1,
      placeholder: false,
    };
    const { container, unmount } = render(
      <PhotoCredits
        photos={[
          { ...base, slot: "okami" },
          {
            ...base,
            slot: "quote1",
            credit: {
              author: "Jane Doe",
              source: "Unsplash",
              url: "https://unsplash.com/@jane",
            },
          },
        ]}
      />
    );
    expect(container.textContent).toContain("Photo: Jane Doe / Unsplash");
    expect(screen.getByRole("link", { name: /Jane Doe/ })).toHaveAttribute(
      "href",
      "https://unsplash.com/@jane"
    );
    unmount();
    const none = render(<PhotoCredits photos={[{ ...base, slot: "okami" }, null]} />);
    expect(none.container.textContent).toBe("");
  });
});
