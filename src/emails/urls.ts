import { launchConfig, type LaunchTopic } from "@/config/launch";

/** メール本文で使うURL一式。トークンはESPマージタグのまま渡せる */
export function emailUrls(token = "{{TOKEN}}") {
  const base = launchConfig.urls.appBaseUrl;
  const preferences = `${base}/preferences?token=${token}`;
  return {
    preferences,
    preferencesWithPreset: (preset: LaunchTopic) => `${preferences}&preset=${preset}`,
    // 配信停止リンク。開いただけでは停止せず、確認画面からPOSTで確定する
    optOut: `${preferences}&intent=opt-out`,
    day: (day: 1 | 2 | 3, topic: LaunchTopic) =>
      `${base}/launch/day-${day}?topic=${topic}`,
    iphoneSalesLp: launchConfig.urls.iphoneSalesLp,
    arbitrageSalesLp: launchConfig.urls.arbitrageSalesLp,
  };
}

/**
 * List-Unsubscribe / RFC 8058 ワンクリック解除用ヘッダー。
 * 配信システム側でメール送信時にこのヘッダーを付与する。
 * ワンクリック解除はPOSTで /api/preferences/one-click-unsubscribe に届く。
 */
export function listUnsubscribeHeaders(token = "{{TOKEN}}") {
  const base = launchConfig.urls.appBaseUrl;
  return {
    "List-Unsubscribe": `<${base}/api/preferences/one-click-unsubscribe?token=${token}>, <mailto:${launchConfig.sender.supportEmail}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
