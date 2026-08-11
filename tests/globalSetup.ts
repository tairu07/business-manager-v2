import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

/**
 * テスト用SQLite DB(prisma/test.db)を毎回作り直す。
 *
 * 対象はこのリポジトリ内のテスト専用ファイルDBのみ(gitignore済み)。
 * 破壊的な --force-reset は使わず、ファイル削除 + 通常のdb pushで初期化する。
 */
export default function globalSetup() {
  const dbFile = path.resolve(process.cwd(), "prisma", "test.db");
  rmSync(dbFile, { force: true });
  rmSync(`${dbFile}-journal`, { force: true });

  execSync("npx prisma db push --skip-generate", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: "file:./test.db",
    },
    stdio: "inherit",
  });
}
