// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonV2Page, { metadata } from "@/app/kabu-salon/page";
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

// 2026/11/13 から新LP(v2 のデザイン)が本線。前のLPは /kabu-salon/v1(tests/kabu-salon-v1.test.tsx)
describe("株分析サロン 本線のLP(/kabu-salon。新LP)", () => {
  it("CTAボタン5本は、本線の切り替えに従って申込ページ(またはLINE)へ向く", () => {
    const { container } = render(<KabuSalonV2Page />);
    const { enrollment, urls } = kabuSalonConfig;
    const ctas = Array.from(container.querySelectorAll<HTMLAnchorElement>(CTA_SELECTOR));
    expect(ctas).toHaveLength(5);
    const expected = enrollment.open ? urls.apply : urls.waitlist;
    for (const link of ctas) expect(link).toHaveAttribute("href", expected);
    if (enrollment.open) {
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
      expect(text).toContain("次の募集は、LINEで最初にお知らせします。");
      // 「決済すると1分で部屋が開く」の案内は、ボタンの下からは消す
      expect(container.querySelector(".final__note")?.textContent).not.toContain("決済");
    }
  });

  it("前のLPの「募集終了」の切り替えとは独立している", () => {
    // 本線(新LP)は enrollment.open、前のLPは enrollment.v1Open を見る
    expect(kabuSalonConfig.enrollment).toHaveProperty("open");
    expect(kabuSalonConfig.enrollment).toHaveProperty("v1Open");
    expect(kabuSalonConfig.enrollment).not.toHaveProperty("v2Open");
    expect(kabuSalonConfig.urls.lp).toBe("/kabu-salon");
    expect(kabuSalonConfig.urls.lpV1).toBe("/kabu-salon/v1");
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
        "稼げる",
        "仕手",
        "ファンド",
        "サヤ取り",
        "銘柄が動",
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
    // 「見つけられる人へ」は、すでに見つけられる人宛てにも読めるので使わない
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "バリュー株を、自分で見つけたい人へ。"
    );
    expect(metadata.title).toEqual({
      absolute: expect.stringContaining("バリュー株を、自分で見つけたい人へ"),
    });
    // 2節目の見出しは、1行目の見出しと同じ言葉を繰り返さない
    expect(container.querySelector("#problem h2")?.textContent).toBe(
      "ひとつでも、当てはまるなら。"
    );
    expect(text).toContain("答えではなく、探し方を見せる。");
    expect(container.querySelectorAll("#contents .step")).toHaveLength(5);
    expect(text).toContain("162社を、105社まで絞り込みました");
    // 「見ているだけでは身につかない」と、必要な手間を隠さない
    expect(text).toContain("見ているだけでは身につきません");
    // 追伸がある
    expect(container.querySelector("#ps .ps__label")?.textContent).toBe("追伸");
  });

  it("割安の型4つ・回戦制・これからの1年が出て、先の話は「予定」「目安」と書かれている", () => {
    const { container } = render(<KabuSalonV2Page />);
    const text = container.textContent ?? "";
    expect(
      container.querySelectorAll("#solution .values--four .value__title")
    ).toHaveLength(4);
    for (const t of ["資産で割安", "利益で割安", "成長で割安", "知名度で割安"]) {
      expect(text).toContain(t);
    }
    expect(text).toContain("1回戦目は、最後に17銘柄まで絞り込みました");
    // 途中から入る人の不安には、回戦の説明のすぐ下で答える
    expect(container.querySelector("#contents .rounds__join")?.textContent).toContain(
      "途中から入った人も"
    );
    expect(container.querySelectorAll("#roadmap .roadmap__item")).toHaveLength(4);
    // 「これから1ヶ月」がいつからかを注記で示す
    expect(container.querySelector("#roadmap")?.textContent).toContain("2026年11月時点");
    expect(text).toContain("投資分析アナリストマスター");
    expect(container.querySelector("#roadmap")?.textContent).toMatch(/予定/);
    expect(container.querySelector("#roadmap")?.textContent).toMatch(/時期は目安/);
  });

  it("料金の前に「毎月なにが手に入るか」があり、参加の手間に答える質問もある", () => {
    const { container } = render(<KabuSalonV2Page />);
    const lead = container.querySelector("#pricing .pricing-lead")?.textContent ?? "";
    expect(lead).toContain("1時間半〜2時間ほど");
    expect(lead).toContain("月に6〜8時間ほど");
    expect(lead).toContain("質問にはタイちゃん本人が");
    const questions = Array.from(container.querySelectorAll("#faq .faq__q")).map(
      (el) => el.textContent ?? ""
    );
    for (const q of [
      "出られない日",
      "聞くだけでも大丈夫",
      "スマホだけでも参加",
      "Discordを使ったことがありません",
      "月の途中で入ったら",
      "解約はいつでも",
    ]) {
      expect(questions.filter((text) => text.includes(q))).toHaveLength(1);
    }
  });

  it("値段に見合うかの迷いに答える(スペースとの違い・元は取れるか)。利益は約束しない", () => {
    const { container } = render(<KabuSalonV2Page />);
    const faq = new Map(
      Array.from(container.querySelectorAll("#faq .faq__item")).map((el) => [
        el.querySelector(".faq__q")?.textContent?.replace(/^Q\./, "") ?? "",
        el.querySelector(".faq__a")?.textContent ?? "",
      ])
    );
    expect(faq.get("無料のスペースと、何が違いますか?")).toContain(
      "毎週のZoom配信を約束"
    );
    const roi = faq.get("サロン代の元は取れますか?") ?? "";
    expect(roi).toMatch(/^約束はできません/);
    expect(roi).toContain("課金日の前日まで");
    // 料金の一覧にある項目は、本文のどこかで説明する
    const contents = container.querySelector("#contents")?.textContent ?? "";
    expect(contents).toContain("論文を読む回");
    expect(contents).toContain("コーチ");
    // 「聞くだけでも大丈夫」と食い違う「自分で調べる時間は、取れない」は、向かない人に入れない
    const notFor = container.querySelector(".fit__col--no")?.textContent ?? "";
    expect(notFor).not.toContain("調べる時間");
    expect(notFor).toContain("最後の判断を、人に任せたい");
    // 同じ銘柄を数ヶ月追うのに「来週には古くなる」とは書かない
    expect(container.querySelector("#ps")?.textContent).not.toContain("来週には");
  });

  it("募集停止中は、流れが LINE の追加から始まり、価格の行に解約の話を出さない", () => {
    const { container } = render(<KabuSalonV2Page />);
    const steps = Array.from(container.querySelectorAll("#flow .precept__desc")).map(
      (el) => el.textContent ?? ""
    );
    expect(steps).toHaveLength(4);
    const heroNote = container.querySelector(".hero__note")?.textContent ?? "";
    if (kabuSalonConfig.enrollment.open) {
      expect(steps[0]).toContain("申込ボタンから");
      expect(heroNote).toContain("いつでも解約できます");
      expect(container.querySelector(".hero__after")).toBeNull();
    } else {
      expect(steps[0]).toContain("LINE");
      expect(steps.join("")).not.toContain("申込ボタンから");
      expect(heroNote).not.toContain("いつでも解約できます");
      expect(heroNote).toContain("今期の募集は終了しました");
      expect(container.querySelector(".hero__after")?.textContent).toContain("LINE");
    }
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

  it("本線なので検索に出す。正規URLは告知で使っている /kabu-salon", () => {
    expect(metadata.robots).toMatchObject({ index: true });
    expect(metadata.alternates?.canonical).toBe("/kabu-salon");
    expect(metadata.alternates?.canonical).toBe(kabuSalonConfig.urls.lp);
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
