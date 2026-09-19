// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KabuSalonPage from "@/app/kabu-salon/page";
import TokushohoPage from "@/app/kabu-salon/tokushoho/page";
import PrivacyPage from "@/app/kabu-salon/privacy/page";
import TermsPage from "@/app/kabu-salon/terms/page";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonLegalDocs } from "@/content/kabuSalonLegal";

const { company, pricing, urls } = kabuSalonConfig;

afterEach(cleanup);

/** 特定商取引法 第11条・施行規則が通信販売(継続的役務)に求める表示項目 */
const TOKUSHOHO_REQUIRED_LABELS = [
  "販売事業者",
  "代表者",
  "所在地",
  "電話番号",
  "メールアドレス",
  "販売価格",
  "販売価格以外にお客様が負担する費用",
  "支払方法",
  "支払時期",
  "サービスの提供時期",
  "契約期間・更新",
  "解約方法",
  "返品・キャンセル(返金)について",
  "動作環境",
  "販売数量の制限・特別条件",
];

describe("株分析サロン 法務ページ", () => {
  it("特商法表記: 必須項目がすべて表示され、会社情報と税込価格が入っている", () => {
    const { container } = render(<TokushohoPage />);
    const text = container.textContent ?? "";
    for (const label of TOKUSHOHO_REQUIRED_LABELS) {
      expect(screen.getByText(label, { selector: "dt" })).toBeInTheDocument();
    }
    expect(text).toContain(company.legalName);
    expect(text).toContain(company.representative);
    expect(text).toContain(company.postalCode);
    expect(text).toContain(company.address);
    expect(text).toContain(company.tel);
    expect(text).toContain(company.email);
    expect(text).toContain(company.paymentProvider);
    expect(text).toContain(
      `${yen(pricing.regular)}(税込 ${yen(withTax(pricing.regular))})`
    );
    expect(text).toContain(
      `${yen(pricing.earlyBird)}(税込 ${yen(withTax(pricing.earlyBird))})`
    );
    expect(text).toContain(`先着${pricing.earlyBirdSeats}名`);
    // 継続課金・解約・返金・クーリングオフの説明(決済審査で見られる)
    expect(text).toMatch(/自動で課金|継続課金/);
    expect(text).toContain("自動更新");
    expect(text).toContain("次回決済日の前日まで");
    expect(text).toContain("返金");
    expect(text).toContain("クーリング・オフ");
    // 投資助言でない旨
    expect(text).toContain("投資助言・代理業ではありません");
    // プレースホルダーが残っていない
    expect(text).not.toContain("【");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "特定商取引法に基づく表記"
    );
  });

  it("プライバシーポリシー: 取得情報・利用目的・第三者提供・委託先・開示請求・窓口がある", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    for (const heading of [
      "取得する情報",
      "利用目的",
      "第三者への提供",
      "業務委託先への提供",
      "安全管理",
      "開示・訂正・利用停止等の請求",
      "お問い合わせ窓口",
    ]) {
      expect(text).toContain(heading);
    }
    expect(text).toContain(company.legalName);
    expect(text).toContain(company.email);
    expect(text).toContain(company.paymentProvider);
    expect(text).not.toContain("【");
  });

  it("利用規約: 投資助言でない旨・解約・返金・禁止事項・準拠法がある", () => {
    const { container } = render(<TermsPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("投資助言・代理業");
    expect(text).toContain("第5条(契約期間・解約)");
    expect(text).toContain("第7条(禁止事項)");
    expect(text).toContain("大阪地方裁判所");
    expect(text).toContain(
      `${yen(pricing.regular)}(税込 ${yen(withTax(pricing.regular))})`
    );
    expect(text).not.toContain("【");
    // 番号付き条文は <ol>、禁止事項は <ul>
    expect(container.querySelectorAll("ol.legal__list--ordered").length).toBeGreaterThan(
      3
    );
    expect(container.querySelectorAll("ul.legal__list").length).toBeGreaterThan(0);
  });

  it("法務ページ同士とLPが相互にリンクしている", () => {
    const docs = Object.values(kabuSalonLegalDocs);
    expect(docs.map((d) => d.path)).toEqual([
      urls.tokushoho,
      urls.privacyPolicy,
      urls.terms,
    ]);
    for (const [Page, doc] of [
      [TokushohoPage, kabuSalonLegalDocs.tokushoho],
      [PrivacyPage, kabuSalonLegalDocs.privacy],
      [TermsPage, kabuSalonLegalDocs.terms],
    ] as const) {
      const { container, unmount } = render(<Page />);
      const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
        a.getAttribute("href")
      );
      expect(hrefs).toContain(urls.lp);
      for (const other of docs) {
        if (other.slug !== doc.slug) expect(hrefs).toContain(other.path);
      }
      // 演出用の reveal は使わない(JS無しで全文が見える)
      expect(container.querySelectorAll(".reveal")).toHaveLength(0);
      unmount();
    }

    const lp = render(<KabuSalonPage />);
    const lpHrefs = Array.from(lp.container.querySelectorAll("footer a")).map((a) =>
      a.getAttribute("href")
    );
    expect(lpHrefs).toEqual(
      expect.arrayContaining([urls.tokushoho, urls.privacyPolicy, urls.terms])
    );
  });

  it("LP本文には会社名・代表者名・住所・電話番号を出さない(法務ページにのみ載せる)", () => {
    const { container } = render(<KabuSalonPage />);
    const text = container.textContent ?? "";
    for (const secret of [
      company.legalName,
      company.representative,
      company.address,
      company.tel,
    ]) {
      expect(text).not.toContain(secret);
    }
  });
});
