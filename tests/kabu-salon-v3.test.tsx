// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonV3Page, { metadata } from "@/app/kabu-salon/_v3/page";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonV3Copy } from "@/content/kabuSalonV3";

afterEach(cleanup);

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

/** 文字数(絵文字や結合文字を含まない前提で、コードポイントで数える) */
const len = (s: string) => [...s].length;

const CTA_SELECTOR = ".nav__cta, #cta-hero, #cta-pricing, #cta-final, #cta-ps";

// 2026/11/14 の本人の録音(サロンをどういうサロンにしていきたいか)をもとにした、3つ目のLP
describe("株分析サロン 3つ目のLP(/kabu-salon/v3。本業・副業・投資を 1:1:1 に)", () => {
  it("CTAボタン5本は、このLPの切り替え(v3Open)に従って申込ページ(またはLINE)へ向く", () => {
    const { container } = render(<KabuSalonV3Page />);
    const { enrollment, urls } = kabuSalonConfig;
    const ctas = Array.from(container.querySelectorAll<HTMLAnchorElement>(CTA_SELECTOR));
    expect(ctas).toHaveLength(5);
    const expected = enrollment.v3Open ? urls.apply : urls.waitlist;
    for (const link of ctas) expect(link).toHaveAttribute("href", expected);
    if (enrollment.v3Open) {
      for (const link of ctas) expect(link.textContent).toBe("申し込む");
    } else {
      // 募集停止中: ボタンは全部 LINE、決済ページへのリンクは1本も出さない
      for (const link of ctas) expect(link.textContent).toMatch(/LINE/);
      const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
        a.getAttribute("href")
      );
      expect(hrefs).not.toContain(urls.apply);
      expect(screen.queryAllByRole("link", { name: /申し込む/ })).toHaveLength(0);
      const text = container.textContent ?? "";
      expect(text).toContain("今期の募集は終了");
      expect(container.querySelector(".plan__tag")?.textContent).toBe("募集終了");
      expect(container.querySelector(".hero__after")?.textContent).toContain("LINE");
      // 流れは LINE の追加から始まる
      const steps = Array.from(container.querySelectorAll("#flow .precept__desc")).map(
        (el) => el.textContent ?? ""
      );
      expect(steps[0]).toContain("LINE");
      expect(steps.join("")).not.toContain("申込ボタンから");
    }
  });

  it("ほかのLPとは別の切り替えと、別のURLを持つ", () => {
    expect(kabuSalonConfig.enrollment).toHaveProperty("v3Open");
    expect(kabuSalonConfig.urls.lpV3).toBe("/kabu-salon/v3");
    expect(kabuSalonConfig.urls.lp).toBe("/kabu-salon");
    // 本線ではないので検索に出さない。正規URLは自分自身
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBe("/kabu-salon/v3");
  });

  it("1画面目で「本業・副業・投資を 1:1:1 に」が伝わる(見出しと、3本柱の帯)", () => {
    const { container } = render(<KabuSalonV3Page />);
    const hero = container.querySelector("header.hero");
    const heroText = hero?.textContent ?? "";
    for (const pillar of ["本業", "副業", "投資"]) expect(heroText).toContain(pillar);
    // 帯は「1」が3つ。読み上げ用の名前も付いている
    expect(container.querySelectorAll(".hero__ratio-num")).toHaveLength(3);
    expect(container.querySelector(".hero__ratio")?.getAttribute("aria-label")).toBe(
      "本業1、副業1、投資1"
    );
    // 見出しはスマホで折れない長さ(1行10文字以内、2〜3行)
    const lines = kabuSalonV3Copy.hero.heading;
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines.length).toBeLessThanOrEqual(3);
    for (const line of lines) expect(len(line)).toBeLessThanOrEqual(10);
    expect(lines.some((line) => line.includes(kabuSalonV3Copy.hero.gold))).toBe(true);
  });

  it("1:1:1 の節は3本の柱(本業・副業・投資)で、約束ではないことをその場で書く", () => {
    const { container } = render(<KabuSalonV3Page />);
    const ratio = container.querySelector("#ratio");
    expect(ratio).not.toBeNull();
    const labels = Array.from(ratio?.querySelectorAll(".ratio__label") ?? []).map(
      (el) => el.textContent
    );
    expect(labels).toEqual(["本業", "副業", "投資"]);
    expect(ratio?.querySelectorAll(".ratio__col")).toHaveLength(3);
    expect(ratio?.textContent).toMatch(/約束|保証/);
  });

  it("スイッチの節があり、節の見出しはスマホで折れない長さ", () => {
    const { container } = render(<KabuSalonV3Page />);
    expect(container.querySelector("#switch")).not.toBeNull();
    expect(container.querySelectorAll("#switch .step").length).toBeGreaterThanOrEqual(3);
    const ids = kabuSalonV3Copy.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of kabuSalonV3Copy.sections) {
      expect(section.heading.length).toBeLessThanOrEqual(2);
      for (const line of section.heading) expect(len(line)).toBeLessThanOrEqual(13);
      if (section.gold) {
        expect(section.heading.some((line) => line.includes(section.gold))).toBe(true);
      }
    }
    // 2つ目のボタンは、実際にある節へ飛ぶ
    expect(
      container.querySelector(`#${kabuSalonV3Copy.hero.secondaryTarget}`)
    ).not.toBeNull();
  });

  it("価格は税込併記で、課金日と日割りなしの条件が書かれている", () => {
    const { container } = render(<KabuSalonV3Page />);
    const text = container.textContent ?? "";
    const regular = yen(kabuSalonConfig.pricing.regular);
    const tax = yen(withTax(kabuSalonConfig.pricing.regular));
    expect(container.querySelector(".plan__amount")?.textContent).toBe(regular);
    expect(text).toContain(`税込 ${tax}`);
    expect(text).toContain(`${regular}(税込 ${tax})`);
    expect(text).toContain("毎月1日");
    expect(text).toContain("日割りはありません");
    expect(text).not.toContain(yen(kabuSalonConfig.pricing.earlyBird));
  });

  it("免責事項と「投資助言・代理業ではない」旨が、折り畳みの外に表示される", () => {
    render(<KabuSalonV3Page />);
    const heading = screen.getByRole("heading", { name: "免責事項" });
    expect(heading.parentElement?.textContent).toMatch(/投資助言・代理業ではありません/);
    expect(heading.closest("details")).toBeNull();
  });

  it("収入や利益の約束に読める言葉、他社の登録商標、本名・社名を含まない", () => {
    const { container } = render(<KabuSalonV3Page />);
    const rendered = container.textContent ?? "";
    const content = collectStrings(kabuSalonV3Copy).join("\n");
    for (const text of [rendered, content]) {
      for (const phrase of [
        // 「やる気スイッチ」は学習塾の会社の登録商標。続けた形では書かない
        "やる気スイッチ",
        "必ず",
        "確実",
        "絶対",
        "元本保証",
        "稼げ",
        "儲か",
        "誰でも",
        "簡単に",
        "不労所得",
        "再現性",
        "最短",
        "買い推奨",
        "推奨銘柄",
        "銘柄を買った",
        "選んだ銘柄",
        "仕手",
        "ファンド",
        "サヤ取り",
      ]) {
        expect(text).not.toContain(phrase);
      }
      for (const word of ["SENRITSU", "戦慄", "加藤", "大成", "Taisei", "組織"]) {
        expect(text).not.toContain(word);
      }
    }
    // 感嘆符で煽らない(描画結果には演出用スクリプトの「!」が混ざるので、文言だけを見る)
    expect(content).not.toMatch(/[!!]/);
    expect(rendered).toContain("タイちゃん");
  });

  it("面談で買う銘柄は教えないことと、参加の手間・料金の質問がFAQにある", () => {
    const { container } = render(<KabuSalonV3Page />);
    const faq = Array.from(container.querySelectorAll("#faq .faq__item")).map((el) => ({
      q: el.querySelector(".faq__q")?.textContent?.replace(/^Q\./, "") ?? "",
      a: el.querySelector(".faq__a")?.textContent ?? "",
    }));
    const interview = faq.find(
      (item) => item.q.includes("面談") && item.q.includes("銘柄")
    );
    expect(interview?.a).toMatch(/^教えません/);
    for (const q of [
      "出られない日",
      "聞くだけでも大丈夫",
      "スマホだけでも参加",
      "Discordを使ったことがありません",
      "月の途中で入ったら",
      "解約はいつでも",
      "投資助言サービスですか",
    ]) {
      expect(faq.filter((item) => item.q.includes(q))).toHaveLength(1);
    }
    // 同じ質問が2回出ない
    expect(new Set(faq.map((item) => item.q)).size).toBe(faq.length);
  });

  it("特商法・プライバシーポリシー・利用規約へのリンクがある", () => {
    const { container } = render(<KabuSalonV3Page />);
    const hrefs = Array.from(container.querySelectorAll("footer a")).map((a) =>
      a.getAttribute("href")
    );
    const { urls } = kabuSalonConfig;
    expect(hrefs).toEqual(
      expect.arrayContaining([urls.tokushoho, urls.privacyPolicy, urls.terms])
    );
  });

  it("背景は交互になり、同じ色の節が隣り合わない", () => {
    const { container } = render(<KabuSalonV3Page />);
    const sections = Array.from(
      container.querySelectorAll("main > section.section")
    ).filter((s) => s.id !== "ps");
    expect(sections.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < sections.length; i++) {
      expect(sections[i].classList.contains("section--alt")).not.toBe(
        sections[i - 1].classList.contains("section--alt")
      );
    }
  });
});
