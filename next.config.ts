import type { NextConfig } from "next";
import { legacyHostRedirects, movedPathRedirects } from "./src/config/site";

/**
 * HOME_REDIRECT にパスを設定すると、サイトのルート(/)をそのパスへ転送する。
 * 例: Vercel の環境変数に HOME_REDIRECT=/kabu-salon を設定すると、独自ドメイン直下でLPが開く。
 * 未設定なら従来どおり / はトップページ(配信設定のデモ一覧)を表示する。
 */
const homeRedirect = process.env.HOME_REDIRECT;

const nextConfig: NextConfig = {
  async redirects() {
    // 旧ホスト(vercel.app など)→ 自社ドメイン。ルート転送より先に評価させる。
    // その次に、場所を移したページ(以前の新LPのURL → 本線)を転送する
    const redirects = [...legacyHostRedirects(), ...movedPathRedirects()];
    if (!homeRedirect || !homeRedirect.startsWith("/")) return redirects;
    return [...redirects, { source: "/", destination: homeRedirect, permanent: false }];
  },
};

export default nextConfig;
