import type { Category, LaunchTopic } from "@/config/launch";

/**
 * URLクエリ ?preset= をチェック状態の事前選択に変換する。
 *
 * preset は初期表示のチェック状態にのみ使い、
 * 同意・配信設定の確定には一切関与しない(確定はPOSTのみ)。
 */
export function presetToCategories(preset: string | undefined): Category[] | null {
  const map: Record<LaunchTopic, Category[]> = {
    iphone: ["iphone"],
    arbitrage: ["arbitrage"],
    both: ["iphone", "arbitrage"],
  };
  if (preset === "iphone" || preset === "arbitrage" || preset === "both") {
    return map[preset];
  }
  return null;
}
