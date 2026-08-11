import { describe, expect, it } from "vitest";
import { maskEmail } from "@/lib/tokens/maskEmail";
import { generateToken, hashToken, isPlausibleToken } from "@/lib/tokens/token";
import { presetToCategories } from "@/lib/preset";
import { parseTopic } from "@/lib/launchTopic";
import { sanitizeProps } from "@/lib/analytics/track";

describe("maskEmail", () => {
  it("ローカル部を1文字だけ残してマスキングする", () => {
    expect(maskEmail("kenji@gmail.com")).toBe("k***@gmail.com");
    expect(maskEmail("a@example.co.jp")).toBe("a***@example.co.jp");
  });
});

describe("token", () => {
  it("32バイト(base64urlで43文字)以上のトークンを生成する", () => {
    const token = generateToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(isPlausibleToken(token)).toBe(true);
  });

  it("生成のたびに異なるトークンになる", () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it("ハッシュは決定的で、トークン本体と異なる", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
  });

  it("短すぎる・不正な形式のトークンを拒否する", () => {
    expect(isPlausibleToken("short")).toBe(false);
    expect(isPlausibleToken("a".repeat(200))).toBe(false);
    expect(isPlausibleToken("invalid!token#with$symbols%%%%%%%%%%%%%%")).toBe(false);
    expect(isPlausibleToken(null)).toBe(false);
    expect(isPlausibleToken(undefined)).toBe(false);
  });
});

describe("presetToCategories(要件2: presetは初期選択にのみ使う)", () => {
  it("正しいpreset値をカテゴリー配列に変換する", () => {
    expect(presetToCategories("iphone")).toEqual(["iphone"]);
    expect(presetToCategories("arbitrage")).toEqual(["arbitrage"]);
    expect(presetToCategories("both")).toEqual(["iphone", "arbitrage"]);
  });

  it("不正な値はnull(事前選択なし)になる", () => {
    expect(presetToCategories("all")).toBeNull();
    expect(presetToCategories("")).toBeNull();
    expect(presetToCategories(undefined)).toBeNull();
  });
});

describe("parseTopic", () => {
  it("不正値・未指定はbothにフォールバックする", () => {
    expect(parseTopic("iphone")).toBe("iphone");
    expect(parseTopic("arbitrage")).toBe("arbitrage");
    expect(parseTopic("unknown")).toBe("both");
    expect(parseTopic(undefined)).toBe("both");
  });
});

describe("analytics sanitizeProps(要件9: 個人情報を分析に送らない)", () => {
  it("メールアドレス・トークン・subscriberId等の禁止キーを除去する", () => {
    const out = sanitizeProps({
      campaign_id: "launch_2026_joint",
      topic: "both",
      day_number: 1,
      selected_category_count: 2,
      email: "leak@example.com",
      token: "secret-token",
      subscriberId: "sub_123",
      name: "山田太郎",
      phone: "090-0000-0000",
    });
    expect(out).toEqual({
      campaign_id: "launch_2026_joint",
      topic: "both",
      day_number: 1,
      selected_category_count: 2,
    });
    expect(JSON.stringify(out)).not.toContain("@");
    expect(JSON.stringify(out)).not.toContain("secret-token");
    expect(JSON.stringify(out)).not.toContain("sub_123");
  });
});
