/**
 * 公開ドメインの設定(環境変数で切り替える。コードにドメインを書かない)。
 *
 *   SITE_URL      正規の公開URL。例: https://kabu.senritsu.site
 *                 metadataBase と canonical に使う。
 *   LEGACY_HOSTS  正規URLへ転送する旧ホスト(カンマ区切り)。例: business-manager-v2.vercel.app
 *                 プレビューデプロイのホストは入れないこと(プレビューまで本番へ飛んでしまう)。
 *
 * どちらも未設定なら何もしない(従来どおり)。
 */

type Env = Record<string, string | undefined>;

/** SITE_URL を https の URL として解釈する。不正・未設定なら undefined */
export function siteUrl(env: Env = process.env): URL | undefined {
  const raw = env.SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

type PathRedirect = { source: string; destination: string; permanent: boolean };

/**
 * サイト内で場所を移したページ(古いURL → 今のURL)。
 * 2026/11/13 本線(/kabu-salon)を新LPに差し替えた。それまで新LPを置いていた /kabu-salon/v2 は本線へ送る。
 */
export const movedPaths = [
  { source: "/kabu-salon/v2", destination: "/kabu-salon" },
] as const;

/** movedPaths を next.config 用の redirects にする */
export function movedPathRedirects(): PathRedirect[] {
  // 戻すことになってもブラウザに永久キャッシュが残らないよう、一時転送(307)
  return movedPaths.map((moved) => ({ ...moved, permanent: false }));
}

type HostRedirect = {
  source: string;
  has: { type: "host"; value: string }[];
  destination: string;
  permanent: boolean;
};

/** 旧ホストへのアクセスを、同じパスのまま SITE_URL へ転送する next.config 用の redirects */
export function legacyHostRedirects(env: Env = process.env): HostRedirect[] {
  const target = siteUrl(env);
  if (!target) return [];
  const hosts = (env.LEGACY_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter((h) => /^[a-z0-9.-]+$/.test(h) && h !== target.host);
  return hosts.map((host) => ({
    source: "/:path*",
    // has.value は正規表現として扱われるので、ドットをエスケープして完全一致にする
    has: [{ type: "host", value: `^${host.replace(/\./g, "\\.")}$` }],
    destination: `${target.origin}/:path*`,
    // 設定ミスがブラウザに永久キャッシュされないよう、まずは一時転送(307)
    permanent: false,
  }));
}
