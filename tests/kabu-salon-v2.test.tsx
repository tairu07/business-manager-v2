// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonV2Page, { metadata } from "@/app/kabu-salon/v2/page";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonV2Copy, memberVoices } from "@/content/kabuSalonV2";

afterEach(cleanup);

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

const CTA_SELECTOR = ".nav__cta, #cta-hero, #cta-pricing, #cta-final, #cta-ps";

describe("株分析サロン 新LP(/kabu-salon/v2)", () => {
  it("CTAボタン5本は、新LPの切り替えに従って申込ページ(またはLINE)へ向く", () => {
    const { container } = render(<KabuSalonV2Page />);
    const { enrollment, urls } = kabuSalonConfig;
    const ctas = Array.from(container.querySelectorAll<HTMLAnchorElement>(CTA_SELECTOR));
    expect(ctas).toHaveLength(5);
    const expected = enrollment.v2Open ? urls.apply : urls.waitlist;
    for (const link of ctas) expect(link).toHaveAttribute("href", expected);
    if (enrollment.v2Open) {
      for (const link of ctas) expect(link.textContent).toBe("申し込む");
    }
  });

  it("今のLPの「募集終了」の切り替えとは独立している", () => {
    // 今のLPは enrollment.open、新LPは enrollment.v2Open を見る
    expect(kabuSalonConfig.enrollment).toHaveProperty("open");
    expect(kabuSalonConfig.enrollment).toHaveProperty("v2Open");
    expect(kabuSalonConfig.urls.lpV2).toBe("/kabu-salon/v2");
    expect(kabuSalonConfig.urls.lp).toBe("/kabu-salon");
  });

  it("価格は税込併記で、課金日と日割りなしの条件が書かれている", () => {
    const { container } = render(<KabuSalonV2Page />);
    const text = container.textContent ?? "";
    const regular = yen(kabuSalonConfig.pricing.regular);
    const tax = yen(withTax(kabuSalonConfig.pricing.regular));
    expect(container.querySelector(".plan__amount")?.textContent).toBe(regular);
    expect(text).toContain(`税込 ${tax}`);
    expect(text).toContain(`${regular}(税込 ${tax})`);
    expect(text).toContain("毎月1日");
    expect(text).toContain("日割りはありません");
    // 先行価格はもう売っていないので出さない
    expect(text).not.toContain(yen(kabuSalonConfig.pricing.earlyBird));
    expect(text).not.toContain("先着");
  });

  it("免責事項と「投資助言・代理業ではない」旨が、折り畳みの外に表示される", () => {
    render(<KabuSalonV2Page />);
    const heading = screen.getByRole("heading", { name: "免責事項" });
    expect(heading.parentElement?.textContent).toMatch(/投資助言・代理業ではありません/);
    expect(heading.closest("details")).toBeNull();
  });

  it("推奨・利回りの約束・会員の売買実績と読まれる表現、本名・社名を含まない", () => {
    const { container } = render(<KabuSalonV2Page />);
    const rendered = container.textContent ?? "";
    const content = collectStrings(kabuSalonV2Copy).join("\n");
    for (const text of [rendered, content]) {
      for (const phrase of [
        "必ず儲",
        "確実に儲",
        "元本保証",
        "絶対に上が",
        "買い推奨",
        "推奨銘柄を配信",
        "銘柄を買った",
        "選んだ銘柄",
        "儲かる銘柄",
      ]) {
        expect(text).not.toContain(phrase);
      }
      for (const word of ["SENRITSU", "戦慄", "加藤", "大成", "Taisei", "組織"]) {
        expect(text).not.toContain(word);
      }
    }
    expect(rendered).toContain("タイちゃん");
  });

  it("中心の約束(自分で見つける・探し方)と、配信の実際の中身5つが出る", () => {
    const { container } = render(<KabuSalonV2Page />);
    const text = container.textContent ?? "";
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "バリュー株を、自分で見つけられる人へ。"
    );
    expect(text).toContain("答えではなく、探し方を見せる。");
    expect(container.querySelectorAll("#contents .step")).toHaveLength(5);
    expect(text).toContain("162社を、105社まで絞り込みました");
    // 「見ているだけでは身につかない」と、必要な手間を隠さない
    expect(text).toContain("見ているだけでは身につきません");
    // 追伸がある
    expect(container.querySelector("#ps .ps__label")?.textContent).toBe("追伸");
  });

  it("会員の声は、許可を取った言葉が無いうちは欄ごと出さない", () => {
    const { container } = render(<KabuSalonV2Page />);
    if (memberVoices.length === 0) {
      expect(container.querySelector("#voices")).toBeNull();
    } else {
      expect(container.querySelectorAll("#voices .voice")).toHaveLength(
        memberVoices.length
      );
    }
  });

  it("比較が終わるまで検索に出さない(noindex)、正規URLは新LP自身", () => {
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBe("/kabu-salon/v2");
  });

  it("特商法・プライバシーポリシー・利用規約へのリンクがある", () => {
    const { container } = render(<KabuSalonV2Page />);
    const hrefs = Array.from(container.querySelectorAll("footer a")).map((a) =>
      a.getAttribute("href")
    );
    const { urls } = kabuSalonConfig;
    expect(hrefs).toEqual(
      expect.arrayContaining([urls.tokushoho, urls.privacyPolicy, urls.terms])
    );
  });

  it("背景は交互になり、同じ色の節が隣り合わない", () => {
    const { container } = render(<KabuSalonV2Page />);
    const sections = Array.from(
      container.querySelectorAll("main > section.section")
    ).filter((s) => s.id !== "ps");
    for (let i = 1; i < sections.length; i++) {
      expect(sections[i].classList.contains("section--alt")).not.toBe(
        sections[i - 1].classList.contains("section--alt")
      );
    }
  });
});
