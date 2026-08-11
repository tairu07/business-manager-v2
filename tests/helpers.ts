import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/tokens/token";
import { maskEmail } from "@/lib/tokens/maskEmail";
import type { Category } from "@/config/launch";

/** テスト用購読者を作成し、生トークンを返す */
export async function createTestSubscriber(options: {
  email: string;
  categories?: Category[] | null;
  status?: "active" | "opted_out";
  expiresInMs?: number;
}) {
  const token = generateToken();
  const subscriber = await prisma.subscriber.create({
    data: {
      email: options.email,
      maskedEmail: maskEmail(options.email),
      preferenceTokenHash: hashToken(token),
      tokenExpiresAt: new Date(Date.now() + (options.expiresInMs ?? 86_400_000)),
      status: options.status ?? "active",
      categories:
        options.categories === undefined || options.categories === null
          ? null
          : JSON.stringify(options.categories),
    },
  });
  return { token, subscriber };
}

/** 同一オリジンPOSTリクエストを組み立てる(CSRFガードを通過する形) */
export function postRequest(path: string, body: unknown): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "localhost:3000",
      origin: "http://localhost:3000",
      "sec-fetch-site": "same-origin",
      "user-agent": "vitest",
    },
    body: JSON.stringify(body),
  });
}

export function getRequest(path: string): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: "GET",
    headers: { host: "localhost:3000", "user-agent": "vitest" },
  });
}

let uuidCounter = 0;

/** テスト用の一意なUUID v4形式文字列 */
export function testUuid(): string {
  uuidCounter += 1;
  const n = String(uuidCounter).padStart(12, "0");
  return `00000000-0000-4000-8000-${n}`;
}
