import type { LaunchTopic } from "@/config/launch";
import { renderDay0PreferenceEmail } from "./Day0PreferenceEmail";
import { renderDay1EducationEmail } from "./Day1EducationEmail";
import { renderDay2EducationEmail } from "./Day2EducationEmail";
import { renderDay3OfferEmail } from "./Day3OfferEmail";
import type { RenderedEmail } from "./types";

export { renderDay0PreferenceEmail } from "./Day0PreferenceEmail";
export { renderDay1EducationEmail } from "./Day1EducationEmail";
export { renderDay2EducationEmail } from "./Day2EducationEmail";
export { renderDay3OfferEmail } from "./Day3OfferEmail";
export { listUnsubscribeHeaders } from "./urls";

export type EmailKey = "day0" | "day1" | "day2" | "day3";

/**
 * プレビュー画面・テスト用のレジストリ。
 * token を省略すると "{{TOKEN}}" のまま出力され、
 * メール配信システムのマージタグ置換に任せられる。
 */
export const emailRegistry: Record<
  EmailKey,
  {
    label: string;
    topicAware: boolean;
    render: (topic: LaunchTopic, token?: string) => RenderedEmail;
  }
> = {
  day0: {
    label: "Day 0:配信希望確認メール",
    topicAware: false,
    render: (_topic, token) => renderDay0PreferenceEmail({ token }),
  },
  day1: {
    label: "Day 1:教育メール",
    topicAware: true,
    render: (topic, token) => renderDay1EducationEmail({ topic, token }),
  },
  day2: {
    label: "Day 2:教育メール",
    topicAware: true,
    render: (topic, token) => renderDay2EducationEmail({ topic, token }),
  },
  day3: {
    label: "Day 3:コース案内メール",
    topicAware: true,
    render: (topic, token) => renderDay3OfferEmail({ topic, token }),
  },
};
