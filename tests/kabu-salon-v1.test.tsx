// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonPage, { metadata } from "@/app/kabu-salon/v1/page";
import { isLaunchFreePeriod, kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
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

// 2026/11/13 に本線(/kabu-salon)を新LPへ差し替えた。前のLPは /kabu-salon/v1 に残している
describe("株分析サロン 前のLP(/kabu-salon/v1)", () => {
  it("比較用に残すページなので検索に出さない(noindex)。正規URLは自分自身", () => {
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBe("/kabu-salon/v1");
    expect(metadata.alternates?.canonical).toBe(kabuSalonConfig.urls.lpV1);
  });

  it("価格は設定ファイルから計算され、税込併記で表示される", () => {
    render(<KabuSalonPage />);
    const regular = yen(kabuSalonConfig.pricing.regular);
    const regularTax = yen(withTax(kabuSalonConfig.pricing.regular));
    const early = yen(kabuSalonConfig.pricing.earlyBird);
    expect(withTax(20000)).toBe(22000);
    expect(
      screen.getAllByText(new RegExp(`${regular}.*税込 ${regularTax}`)).length
    ).toBeGreaterThan(0);
    const amounts = Array.from(document.querySelectorAll(".plan__amount")).map(
      (el) => el.textContent
    );
    if (kabuSalonConfig.pricing.earlyBirdOpen) {
      expect(screen.getAllByText(new RegExp(early)).length).toBeGreaterThan(0);
      expect(amounts).toEqual([early]);
    } else {
      // 受付終了後は先行価格を「今の価格」として出さない(請求額と表示を一致させる)
      expect(amounts).toEqual([regular]);
      const text = document.body.textContent ?? "";
      expect(text).not.toContain(`先着${kabuSalonConfig.pricing.earlyBirdSeats}名`);
      // 募集中のカードには「先行価格は終わった」とは書かず、初回の決済の条件を出す
      expect(text).not.toContain("先行価格の受付は終了しました");
      if (!kabuSalonConfig.enrollment.v1Open) {
        expect(text).toContain("今期の募集は終了しました");
      }
      for (const link of screen.queryAllByRole("link", { name: /申し込む/ })) {
        expect(link.textContent).not.toContain("先行価格");
      }
    }
  });

  it("料金の注記: 課金日は毎月1日、初回0円の案内はローンチ期間中だけ出る", () => {
    const { container } = render(<KabuSalonPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("課金日である毎月1日の前日まで");
    expect(container.querySelectorAll(".pricing-note__launch").length).toBe(
      isLaunchFreePeriod() ? 1 : 0
    );
    if (isLaunchFreePeriod()) expect(text).toContain(kabuSalonCopy.pricing.launchNote);
    // 初回の決済と日割りなしは、料金の欄に1回だけ出る(初回0円の期間中は launchNote に任せる)
    const pricingText = container.querySelector("#pricing")?.textContent ?? "";
    expect(pricingText.split(kabuSalonCopy.pricing.billing).length - 1).toBe(
      isLaunchFreePeriod() ? 0 : 1
    );
    // 見出しの下に、払う側が受け取るものを書く
    expect(container.querySelector("#pricing .pricing-lead")?.textContent).toContain(
      "受け取るのは、その分析の過程そのものです。"
    );
    // 参加までの流れは「Discordログイン → 決済 → 自動付与」
    expect(text).toContain("Discordでログイン");
    expect(text).not.toContain("決済ID");
  });

  it("CTAボタン4本は、募集中は申込URLへ、募集停止中はLINE公式アカウントへ向く", () => {
    const { container } = render(<KabuSalonPage />);
    const { enrollment, urls } = kabuSalonConfig;
    const ctas = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(
        ".nav__cta, #cta-hero, #cta-pricing, #cta-final"
      )
    );
    expect(ctas).toHaveLength(4);
    const expected = enrollment.v1Open ? urls.apply : urls.waitlist;
    for (const link of ctas) {
      expect(link).toHaveAttribute("href", expected);
    }
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    );
    if (enrollment.v1Open) {
      for (const link of ctas) expect(link.textContent).toMatch(/申し込む/);
      expect(hrefs).not.toContain(urls.waitlist);
    } else {
      // 募集停止中は決済ページへのリンクを一切出さない
      expect(hrefs).not.toContain(urls.apply);
      for (const link of ctas) expect(link.textContent).toMatch(/LINE/);
      expect(screen.queryAllByRole("link", { name: /申し込む/ })).toHaveLength(0);
      expect(container.textContent).toContain("今期の募集は終了");
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

  it("本名・社名・主宰写真を出さず、ラクマル愛好会の価格には触れない", () => {
    const { container } = render(<KabuSalonPage />);
    const rendered = container.textContent ?? "";
    for (const word of ["SENRITSU", "戦慄", "加藤", "大成", "Taisei"]) {
      expect(rendered).not.toContain(word);
    }
    expect(container.querySelectorAll(".photo--founder")).toHaveLength(0);
    expect(rendered).toContain("タイちゃん");
    const all = collectStrings(kabuSalonCopy).join("\n");
    expect(all).not.toContain("ラクマル");
    expect(all).not.toContain("9,000");
  });

  it("目標200人の方針と矛盾する「少人数・10〜20人でいい・稼ぐためではない」を出さない", () => {
    const { container } = render(<KabuSalonPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("食べていくと決めました");
    expect(text).toContain(`目標は${kabuSalonConfig.pricing.goalMembers}人`);
    expect(text).toContain("今の仲間と生きていく");
    // 「10〜20人」は過去の想定として語りの中で1回だけ触れる
    expect(text).toContain("最初は、10〜20人でいいと思っていました");
    expect(text.split("10〜20人").length - 1).toBe(1);
    for (const stale of [
      "少人数",
      "大勢を集める気はありません",
      "稼ぐためのサロンでは",
      "稼ぐために開くものではありません",
      "本業でも、集客でもない",
    ]) {
      expect(text).not.toContain(stale);
    }
    // 「組織」とは書かない(社名を出さない方針)
    expect(text).not.toContain("組織");
  });

  it("募集停止中は、流れが LINE の追加から始まり、ヒーローに LINE の一言が出る", () => {
    const { container } = render(<KabuSalonPage />);
    const steps = Array.from(container.querySelectorAll("#flow .precept__desc")).map(
      (el) => el.textContent ?? ""
    );
    expect(steps).toHaveLength(4);
    if (kabuSalonConfig.enrollment.v1Open) {
      expect(steps[0]).toContain("申込ボタンから");
      expect(container.querySelector(".hero__after")).toBeNull();
    } else {
      // ボタンが LINE なのに「申込ボタンから」と案内しない
      expect(steps[0]).toContain("LINE");
      expect(steps.join("")).not.toContain("申込ボタンから");
      expect(container.querySelector("#flow h2")?.textContent).toBe(
        kabuSalonCopy.flow.closedTitle
      );
      expect(container.querySelector(".hero__after")?.textContent).toBe(
        kabuSalonCopy.waitlistNote
      );
    }
  });

  it("パスポートは本人のロードマップに沿う(図書館・型とツール・IRアルファ)。約束は「予定」と書く", () => {
    const { container } = render(<KabuSalonPage />);
    const passport = container.querySelector("#passport")?.textContent ?? "";
    expect(container.querySelectorAll("#passport .precept")).toHaveLength(3);
    expect(passport).toContain("IRアルファデータベース");
    expect(passport).toContain("無料か、特別な価格で提供する予定");
    expect(passport).toContain("時期や条件は変わることがあります");
    // 古い約束(次のサロンの割引・note)は出さない
    expect(passport).not.toContain("次のサロン");
    expect(passport).not.toContain("会員価格で");
  });

  it("参加の手間に答える質問(聞くだけ・スマホ・Discord)がある。通り名は X の表記", () => {
    const { container } = render(<KabuSalonPage />);
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
    // 「元は取れますか」には、約束できない理由と解約のしやすさで答える(入るなとは言わない)
    const faqText = container.querySelector("#faq")?.textContent ?? "";
    expect(faqText).toContain("株でいくら増えるかは、誰にも約束できない");
    expect(faqText).not.toContain("入らない方がいい");
    expect(kabuSalonConfig.operator.handle).toBe("タイルドマンサックス");
    expect(container.textContent).not.toContain("タイルドマン・サックス");
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
