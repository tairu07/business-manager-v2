// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonPage from "@/app/kabu-salon/page";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonCopy } from "@/content/kabuSalon";

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

afterEach(() => cleanup());

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
});
