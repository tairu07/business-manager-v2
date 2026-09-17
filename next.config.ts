import type { NextConfig } from "next";

/**
 * HOME_REDIRECT にパスを設定すると、サイトのルート(/)をそのパスへ転送する。
 * 例: Vercel の環境変数に HOME_REDIRECT=/kabu-salon を設定すると、独自ドメイン直下でLPが開く。
 * 未設定なら従来どおり / はトップページ(配信設定のデモ一覧)を表示する。
 */
const homeRedirect = process.env.HOME_REDIRECT;

const nextConfig: NextConfig = {
  async redirects() {
    if (!homeRedirect || !homeRedirect.startsWith("/")) return [];
    return [{ source: "/", destination: homeRedirect, permanent: false }];
  },
};

export default nextConfig;
