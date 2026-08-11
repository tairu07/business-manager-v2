import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { resetRateLimits } from "@/lib/rateLimit";
import { launchConfig } from "@/config/launch";
import { GET as resolveGet } from "@/app/api/preferences/resolve/route";
import { POST as confirmPost } from "@/app/api/preferences/confirm/route";
import { POST as optOutPost } from "@/app/api/preferences/opt-out/route";
import * as optOutRoute from "@/app/api/preferences/opt-out/route";
import { createTestSubscriber, getRequest, postRequest, testUuid } from "./helpers";

let seq = 0;
function nextEmail(): string {
  seq += 1;
  return `user${Date.now()}-${seq}@example.com`;
}

beforeEach(() => {
  resetRateLimits();
});

describe("GET /api/preferences/resolve", () => {
  it("GETアクセスだけでは設定が変更されない(要件1)", async () => {
    const { token, subscriber } = await createTestSubscriber({
      email: nextEmail(),
      categories: null,
    });

    const res = await resolveGet(
      getRequest(`/api/preferences/resolve?token=${token}&preset=iphone`)
    );
    expect(res.status).toBe(200);

    const after = await prisma.subscriber.findUniqueOrThrow({
      where: { id: subscriber.id },
    });
    expect(after.categories).toBeNull();
    expect(after.status).toBe("active");
    const events = await prisma.consentEvent.count({
      where: { subscriberId: subscriber.id },
    });
    expect(events).toBe(0);
  });

  it("マスキング済みメールアドレスのみ返し、生アドレスを含まない(要件9)", async () => {
    const email = nextEmail();
    const { token } = await createTestSubscriber({ email, categories: ["iphone"] });

    const res = await resolveGet(getRequest(`/api/preferences/resolve?token=${token}`));
    const body = await res.json();
    expect(body.maskedEmail).toContain("***");
    expect(JSON.stringify(body)).not.toContain(email);
  });

  it("presetはレスポンス(保存状態)に影響しない(要件2)", async () => {
    const { token } = await createTestSubscriber({
      email: nextEmail(),
      categories: null,
    });
    const res = await resolveGet(
      getRequest(`/api/preferences/resolve?token=${token}&preset=both`)
    );
    const body = await res.json();
    // presetを付けても保存状態は空のまま
    expect(body.categories).toEqual([]);
    expect(body.hasSaved).toBe(false);
  });
});

describe("POST /api/preferences/confirm", () => {
  it("POST後に選択カテゴリーが保存される(要件3)", async () => {
    const { token, subscriber } = await createTestSubscriber({
      email: nextEmail(),
      categories: null,
    });

    const res = await confirmPost(
      postRequest("/api/preferences/confirm", {
        token,
        categories: ["iphone"],
        consentVersion: launchConfig.consentVersion,
        campaignId: launchConfig.campaignId,
        requestId: testUuid(),
      })
    );
    expect(res.status).toBe(200);

    const after = await prisma.subscriber.findUniqueOrThrow({
      where: { id: subscriber.id },
    });
    expect(JSON.parse(after.categories!)).toEqual(["iphone"]);
    expect(after.status).toBe("active");

    const event = await prisma.consentEvent.findFirstOrThrow({
      where: { subscriberId: subscriber.id },
    });
    expect(event.action).toBe("consent_confirmed");
    expect(event.consentVersion).toBe(launchConfig.consentVersion);
    expect(event.consentTextHash).toMatch(/^[0-9a-f]{64}$/);
    expect(event.campaignId).toBe(launchConfig.campaignId);
  });

  it("両方選択時にiphoneとarbitrageが個別保存される(要件4)", async () => {
    const { token, subscriber } = await createTestSubscriber({
      email: nextEmail(),
      categories: null,
    });

    await confirmPost(
      postRequest("/api/preferences/confirm", {
        token,
        categories: ["iphone", "arbitrage"],
        consentVersion: launchConfig.consentVersion,
        campaignId: launchConfig.campaignId,
        requestId: testUuid(),
      })
    );

    const after = await prisma.subscriber.findUniqueOrThrow({
      where: { id: subscriber.id },
    });
    // "both" という単独タグではなく、個別カテゴリーの配列で保存される
    const saved = JSON.parse(after.categories!);
    expect(saved).toContain("iphone");
    expect(saved).toContain("arbitrage");
    expect(saved).toHaveLength(2);

    const event = await prisma.consentEvent.findFirstOrThrow({
      where: { subscriberId: subscriber.id },
    });
    expect(JSON.parse(event.categories)).toEqual(
      expect.arrayContaining(["iphone", "arbitrage"])
    );
  });

  it("二重POSTでも不整合が起きない(要件5)", async () => {
    const { token, subscriber } = await createTestSubscriber({
      email: nextEmail(),
      categories: null,
    });
    const requestId = testUuid();
    const makeBody = () => ({
      token,
      categories: ["arbitrage"] as const,
      consentVersion: launchConfig.consentVersion,
      campaignId: launchConfig.campaignId,
      requestId,
    });

    const res1 = await confirmPost(postRequest("/api/preferences/confirm", makeBody()));
    const res2 = await confirmPost(postRequest("/api/preferences/confirm", makeBody()));
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect((await res2.json()).duplicate).toBe(true);

    // ConsentEventは1件のみ。購読者状態も一貫している
    const events = await prisma.consentEvent.count({
      where: { subscriberId: subscriber.id },
    });
    expect(events).toBe(1);
    const after = await prisma.subscriber.findUniqueOrThrow({
      where: { id: subscriber.id },
    });
    expect(JSON.parse(after.categories!)).toEqual(["arbitrage"]);
  });

  it("無効トークンで情報が漏れない(要件7)", async () => {
    const res = await confirmPost(
      postRequest("/api/preferences/confirm", {
        token: "not-a-real-token-00000000000000000000000",
        categories: ["iphone"],
        consentVersion: launchConfig.consentVersion,
        campaignId: launchConfig.campaignId,
        requestId: testUuid(),
      })
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("invalid_link");
    // メールアドレスや登録状態の情報を含まない
    expect(JSON.stringify(body)).not.toContain("@");
  });

  it("期限切れトークンが拒否され、無効トークンと同じ応答になる(要件8)", async () => {
    const { token } = await createTestSubscriber({
      email: nextEmail(),
      expiresInMs: -1000,
    });
    const res = await confirmPost(
      postRequest("/api/preferences/confirm", {
        token,
        categories: ["iphone"],
        consentVersion: launchConfig.consentVersion,
        campaignId: launchConfig.campaignId,
        requestId: testUuid(),
      })
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    // 無効トークンと同一のエラー内容(存在有無を推測できない)
    expect(body.error).toBe("invalid_link");
  });

  it("クロスオリジンのPOSTを拒否する(CSRF対策)", async () => {
    const { token } = await createTestSubscriber({ email: nextEmail() });
    const req = new Request("http://localhost:3000/api/preferences/confirm", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost:3000",
        origin: "https://evil.example.com",
        "sec-fetch-site": "cross-site",
      },
      body: JSON.stringify({
        token,
        categories: ["iphone"],
        consentVersion: launchConfig.consentVersion,
        campaignId: launchConfig.campaignId,
        requestId: testUuid(),
      }),
    });
    const res = await confirmPost(req);
    expect(res.status).toBe(403);
  });

  it("レート制限を超えると429を返す", async () => {
    const { token } = await createTestSubscriber({ email: nextEmail() });
    let lastStatus = 0;
    for (let i = 0; i < 12; i += 1) {
      const res = await confirmPost(
        postRequest("/api/preferences/confirm", {
          token,
          categories: ["iphone"],
          consentVersion: launchConfig.consentVersion,
          campaignId: launchConfig.campaignId,
          requestId: testUuid(),
        })
      );
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});

describe("POST /api/preferences/opt-out", () => {
  it("配信停止時にすべてのカテゴリーが解除される(要件6)", async () => {
    const { token, subscriber } = await createTestSubscriber({
      email: nextEmail(),
      categories: ["iphone", "arbitrage"],
    });

    const res = await optOutPost(
      postRequest("/api/preferences/opt-out", {
        token,
        consentVersion: launchConfig.consentVersion,
        campaignId: launchConfig.campaignId,
        requestId: testUuid(),
      })
    );
    expect(res.status).toBe(200);

    const after = await prisma.subscriber.findUniqueOrThrow({
      where: { id: subscriber.id },
    });
    expect(after.status).toBe("opted_out");
    expect(JSON.parse(after.categories!)).toEqual([]);

    const event = await prisma.consentEvent.findFirstOrThrow({
      where: { subscriberId: subscriber.id, action: "all_marketing_opted_out" },
    });
    expect(JSON.parse(event.categories)).toEqual([]);
  });

  it("GETハンドラを公開していない=リンクを開いただけでは停止されない(要件10)", () => {
    expect("GET" in optOutRoute).toBe(false);
  });

  it("配信停止も二重POSTで重複記録されない", async () => {
    const { token, subscriber } = await createTestSubscriber({
      email: nextEmail(),
      categories: ["iphone"],
    });
    const requestId = testUuid();
    const body = {
      token,
      consentVersion: launchConfig.consentVersion,
      campaignId: launchConfig.campaignId,
      requestId,
    };
    await optOutPost(postRequest("/api/preferences/opt-out", body));
    await optOutPost(postRequest("/api/preferences/opt-out", body));

    const events = await prisma.consentEvent.count({
      where: { subscriberId: subscriber.id, action: "all_marketing_opted_out" },
    });
    expect(events).toBe(1);
  });
});
