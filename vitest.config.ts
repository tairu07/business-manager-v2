import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    // デフォルトはnode環境。コンポーネントテストはファイル先頭の
    // @vitest-environment jsdom コメントで切り替える
    environment: "node",
    // SQLiteのテストDBを共有するため直列実行にする
    fileParallelism: false,
    globalSetup: "./tests/globalSetup.ts",
    setupFiles: ["./tests/setup.ts"],
    env: {
      DATABASE_URL: "file:./test.db",
      PREFERENCE_TOKEN_SECRET: "vitest-secret-0123456789abcdef",
      APP_BASE_URL: "http://localhost:3000",
      CAMPAIGN_ID: "launch_2026_joint",
      EMAIL_PROVIDER: "mock",
      DEMO_MODE: "true",
    },
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
