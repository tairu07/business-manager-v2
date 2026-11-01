import { describe, expect, it } from "vitest";
import { legacyHostRedirects, siteUrl } from "@/config/site";

describe("公開ドメイン設定(SITE_URL / LEGACY_HOSTS)", () => {
  it("SITE_URL は https のオリジンだけを受け付ける", () => {
    expect(siteUrl({ SITE_URL: "https://kabu.example.jp" })?.origin).toBe(
      "https://kabu.example.jp"
    );
    expect(siteUrl({ SITE_URL: "https://kabu.example.jp/" })?.host).toBe(
      "kabu.example.jp"
    );
    expect(siteUrl({})).toBeUndefined();
    expect(siteUrl({ SITE_URL: "" })).toBeUndefined();
    expect(siteUrl({ SITE_URL: "http://kabu.example.jp" })).toBeUndefined();
    expect(siteUrl({ SITE_URL: "https://kabu.example.jp/kabu-salon" })).toBeUndefined();
    expect(siteUrl({ SITE_URL: "not a url" })).toBeUndefined();
  });

  it("旧ホストはパスを保ったまま SITE_URL へ一時転送する", () => {
    const r = legacyHostRedirects({
      SITE_URL: "https://kabu.example.jp",
      LEGACY_HOSTS: "old-app.vercel.app, Other.Example.com ,",
    });
    expect(r).toHaveLength(2);
    expect(r[0]).toEqual({
      source: "/:path*",
      has: [{ type: "host", value: "^old-app\\.vercel\\.app$" }],
      destination: "https://kabu.example.jp/:path*",
      permanent: false,
    });
    expect(r[1].has[0].value).toBe("^other\\.example\\.com$");
    // エスケープ済みの正規表現は、似たホストに一致しない
    const re = new RegExp(r[0].has[0].value);
    expect(re.test("old-app.vercel.app")).toBe(true);
    expect(re.test("old-appXvercel.app")).toBe(false);
    expect(re.test("old-app.vercel.app.evil.com")).toBe(false);
  });

  it("SITE_URL が無い・転送先と同じホスト・不正なホスト名は無視する(転送ループを作らない)", () => {
    expect(legacyHostRedirects({ LEGACY_HOSTS: "old-app.vercel.app" })).toEqual([]);
    expect(
      legacyHostRedirects({
        SITE_URL: "https://kabu.example.jp",
        LEGACY_HOSTS: "kabu.example.jp,bad host,/x",
      })
    ).toEqual([]);
  });
});
