import { PrismaClient } from "@prisma/client";
import { createHash, createHmac } from "node:crypto";

/**
 * ローカル確認用のシードデータ。
 * 固定デモトークンを持つ購読者を作成する(README「デモ用URL」参照)。
 *
 * 注意: 本番環境ではこのシードを実行しないこと。
 */

const prisma = new PrismaClient();

// src/lib/demo/demoTokens.ts と同じ値(seedはtsx直実行のためパスエイリアスを使わない)
const demoTokens = {
  fresh: "demo-token-fresh-user-000000000000000000",
  iphoneSelected: "demo-token-iphone-user-00000000000000000",
  arbitrageSelected: "demo-token-arbitrage-user-00000000000000",
  bothSelected: "demo-token-both-user-0000000000000000000",
  optedOut: "demo-token-opted-out-user-00000000000000",
  expired: "demo-token-expired-user-0000000000000000",
};

function hashToken(token: string): string {
  const secret = process.env.PREFERENCE_TOKEN_SECRET;
  if (!secret) throw new Error("PREFERENCE_TOKEN_SECRET が未設定です");
  return createHmac("sha256", secret).update(token).digest("hex");
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  return `${email[0]}***@${email.slice(at + 1)}`;
}

const inOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

interface SeedSubscriber {
  email: string;
  token: string;
  tokenExpiresAt: Date;
  status: "active" | "opted_out";
  categories: string[] | null;
}

const subscribers: SeedSubscriber[] = [
  {
    email: "fresh@example.com",
    token: demoTokens.fresh,
    tokenExpiresAt: inOneMonth,
    status: "active",
    categories: null,
  },
  {
    email: "iphone@example.com",
    token: demoTokens.iphoneSelected,
    tokenExpiresAt: inOneMonth,
    status: "active",
    categories: ["iphone"],
  },
  {
    email: "arbitrage@example.com",
    token: demoTokens.arbitrageSelected,
    tokenExpiresAt: inOneMonth,
    status: "active",
    categories: ["arbitrage"],
  },
  {
    email: "both@example.com",
    token: demoTokens.bothSelected,
    tokenExpiresAt: inOneMonth,
    status: "active",
    categories: ["iphone", "arbitrage"],
  },
  {
    email: "optedout@example.com",
    token: demoTokens.optedOut,
    tokenExpiresAt: inOneMonth,
    status: "opted_out",
    categories: [],
  },
  {
    email: "expired@example.com",
    token: demoTokens.expired,
    tokenExpiresAt: lastWeek,
    status: "active",
    categories: null,
  },
];

async function main() {
  for (const s of subscribers) {
    const data = {
      email: s.email,
      maskedEmail: maskEmail(s.email),
      preferenceTokenHash: hashToken(s.token),
      tokenExpiresAt: s.tokenExpiresAt,
      status: s.status,
      categories: s.categories === null ? null : JSON.stringify(s.categories),
    };
    const subscriber = await prisma.subscriber.upsert({
      where: { email: s.email },
      create: data,
      update: data,
    });

    // 選択済みユーザーには対応する ConsentEvent も1件作成する
    if (s.categories !== null) {
      const action =
        s.status === "opted_out" ? "all_marketing_opted_out" : "consent_confirmed";
      const requestId = createHash("sha256")
        .update(`seed-${s.email}`)
        .digest("hex")
        .slice(0, 32);
      const seedRequestId = [
        requestId.slice(0, 8),
        requestId.slice(8, 12),
        `4${requestId.slice(13, 16)}`,
        `8${requestId.slice(17, 20)}`,
        requestId.slice(20, 32),
      ].join("-");
      await prisma.consentEvent.upsert({
        where: { requestId: seedRequestId },
        create: {
          subscriberId: subscriber.id,
          categories: JSON.stringify(s.categories),
          action,
          consentVersion: "2026-08-v1",
          consentTextHash: "seed",
          campaignId: process.env.CAMPAIGN_ID ?? "launch_2026_joint",
          requestId: seedRequestId,
          userAgent: "seed-script",
        },
        update: {},
      });
    }
  }
  console.log(`シード完了: ${subscribers.length}件の購読者を作成しました`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
