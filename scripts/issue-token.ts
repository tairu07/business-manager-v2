import { PrismaClient } from "@prisma/client";
import { createHmac, randomBytes } from "node:crypto";

/**
 * 受信者別トークンの発行・再発行スクリプト。
 *
 * 使い方:
 *   npx tsx scripts/issue-token.ts user@example.com
 *   npx tsx scripts/issue-token.ts user@example.com --days 14
 *
 * - 購読者が存在しなければ作成し、存在すればトークンを再発行する
 *   (旧トークンはハッシュが置き換わるため即座に無効になる)
 * - トークン本体は標準出力のみに表示し、DBにはハッシュだけ保存する
 */

const prisma = new PrismaClient();

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  return `${email[0]}***@${email.slice(at + 1)}`;
}

async function main() {
  const email = process.argv[2];
  if (!email || !email.includes("@")) {
    console.error("使い方: npx tsx scripts/issue-token.ts <email> [--days N]");
    process.exit(1);
  }
  const daysFlag = process.argv.indexOf("--days");
  const days = daysFlag > -1 ? Number(process.argv[daysFlag + 1]) : 30;
  if (!Number.isFinite(days) || days <= 0) {
    console.error("--days には正の数を指定してください");
    process.exit(1);
  }

  const secret = process.env.PREFERENCE_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    console.error("PREFERENCE_TOKEN_SECRET が未設定です(16文字以上)");
    process.exit(1);
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHmac("sha256", secret).update(token).digest("hex");
  const tokenExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.subscriber.upsert({
    where: { email },
    create: {
      email,
      maskedEmail: maskEmail(email),
      preferenceTokenHash: tokenHash,
      tokenExpiresAt,
      status: "active",
    },
    update: {
      preferenceTokenHash: tokenHash,
      tokenExpiresAt,
    },
  });

  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  console.log("トークンを発行しました(DBにはハッシュのみ保存)");
  console.log(`  対象: ${maskEmail(email)}`);
  console.log(`  有効期限: ${tokenExpiresAt.toISOString()}`);
  console.log(`  配信設定URL: ${base}/preferences?token=${token}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
