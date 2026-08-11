import { describe, expect, it } from "vitest";
import {
  renderDay0PreferenceEmail,
  renderDay1EducationEmail,
  renderDay2EducationEmail,
  renderDay3OfferEmail,
  listUnsubscribeHeaders,
} from "@/emails";

describe("メールテンプレートのtopic切り替え(要件13)", () => {
  it("Day1: topicごとに件名が切り替わる", () => {
    expect(renderDay1EducationEmail({ topic: "iphone" }).subject).toBe(
      "【1/3】iPhone転売で、利益率より先に見る数字"
    );
    expect(renderDay1EducationEmail({ topic: "arbitrage" }).subject).toBe(
      "【1/3】アービトラージで、価格差より先に見る数字"
    );
    expect(renderDay1EducationEmail({ topic: "both" }).subject).toBe(
      "【1/3】利益率・価格差より先に見る数字"
    );
  });

  it("Day1: iphoneのみ選択時はアービトラージのブロックを含まない", () => {
    const rendered = renderDay1EducationEmail({ topic: "iphone" });
    expect(rendered.text).toContain("在庫回転");
    expect(rendered.text).not.toContain("スプレッド");
    expect(rendered.html).not.toContain("証拠金維持率");
  });

  it("Day1: arbitrageのみ選択時はiPhoneのブロックを含まない", () => {
    const rendered = renderDay1EducationEmail({ topic: "arbitrage" });
    expect(rendered.text).toContain("スプレッド");
    expect(rendered.text).not.toContain("決済枠の回復時期");
  });

  it("Day1: both選択時は両方のブロックを含む", () => {
    const rendered = renderDay1EducationEmail({ topic: "both" });
    expect(rendered.text).toContain("在庫回転");
    expect(rendered.text).toContain("スプレッド");
  });

  it("Day3: topicごとに件名と商品ブロックが切り替わる", () => {
    const iphone = renderDay3OfferEmail({ topic: "iphone" });
    expect(iphone.subject).toBe("【3/3】iPhone転売を、感覚ではなく仕組みで管理する");
    expect(iphone.text).toContain("トリック運営");
    expect(iphone.text).not.toContain("エキスパートコースの詳細を見る");

    const arbitrage = renderDay3OfferEmail({ topic: "arbitrage" });
    expect(arbitrage.subject).toBe(
      "【3/3】アービトラージを、感覚ではなく仕組みで検証する"
    );
    expect(arbitrage.text).toContain("エキスパートコース");
    expect(arbitrage.text).not.toContain("iPhone転売サービスの詳細を見る");

    const both = renderDay3OfferEmail({ topic: "both" });
    expect(both.subject).toBe("【3/3】実践を「再現できる仕組み」に変える");
    expect(both.text).toContain("iPhone転売サービスの詳細を見る");
    expect(both.text).toContain("アービトラージエキスパートコースの詳細を見る");
  });

  it("Day3: 販売者が商品ごとに明確に分かれている", () => {
    const both = renderDay3OfferEmail({ topic: "both" });
    // iPhone側はトリック運営、アービトラージ側は前田側の事業者名
    expect(both.text).toContain("販売者:【トリック運営の正式事業者名】");
    expect(both.text).toContain("販売者:【前田さん側の正式事業者名】");
  });
});

describe("メール共通要件", () => {
  const all = [
    renderDay0PreferenceEmail(),
    renderDay1EducationEmail({ topic: "both" }),
    renderDay2EducationEmail({ topic: "both" }),
    renderDay3OfferEmail({ topic: "both" }),
  ];

  it("HTML版とテキスト版の両方が生成される", () => {
    for (const email of all) {
      expect(email.html).toContain("<!doctype html>");
      expect(email.text.length).toBeGreaterThan(100);
      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.previewText.length).toBeGreaterThan(0);
    }
  });

  it("フッターに配信者・問い合わせ先・設定変更・配信停止リンクがある", () => {
    for (const email of all) {
      expect(email.text).toContain("配信設定を変更する");
      expect(email.text).toContain("配信を停止する");
      expect(email.text).toContain("お問い合わせ");
      expect(email.text).toContain("配信者:");
      expect(email.html).toContain("配信設定を変更する");
      expect(email.html).toContain("配信を停止する");
    }
  });

  it("トークン未指定時は {{TOKEN}} マージタグのまま出力される", () => {
    const rendered = renderDay0PreferenceEmail();
    expect(rendered.html).toContain("token={{TOKEN}}");
    expect(rendered.text).toContain("token={{TOKEN}}");
  });

  it("配信停止リンクは確認画面経由(intent=opt-out)でGET即停止にならない", () => {
    const rendered = renderDay0PreferenceEmail();
    expect(rendered.text).toContain("intent=opt-out");
    // ワンクリック解除APIへの直リンクは本文には含めない(ヘッダー専用)
    expect(rendered.text).not.toContain("one-click-unsubscribe");
  });

  it("Day0: 事前選択リンク3種が含まれる", () => {
    const rendered = renderDay0PreferenceEmail();
    expect(rendered.text).toContain("preset=iphone");
    expect(rendered.text).toContain("preset=arbitrage");
    expect(rendered.text).toContain("preset=both");
  });

  it("誇大な収益表現を含まない(表現方針)", () => {
    const banned = [
      "必ず稼げる",
      "誰でも稼げる",
      "放置で稼げる",
      "元本保証",
      "リスクなし",
      "ほぼ負けない",
      "確実に利益",
    ];
    for (const email of all) {
      for (const phrase of banned) {
        expect(email.text).not.toContain(phrase);
        expect(email.html).not.toContain(phrase);
      }
    }
  });
});

describe("List-Unsubscribe ヘッダー(RFC 8058)", () => {
  it("ワンクリック解除用ヘッダーを生成できる", () => {
    const headers = listUnsubscribeHeaders("{{TOKEN}}");
    expect(headers["List-Unsubscribe"]).toContain(
      "/api/preferences/one-click-unsubscribe?token={{TOKEN}}"
    );
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});
