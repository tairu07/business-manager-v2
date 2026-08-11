import { day0Definition } from "@/content/emails/day0";
import { renderEmail } from "./render";
import type { EmailRenderOptions, RenderedEmail } from "./types";

/** Day 0: 配信希望確認メール(topic出し分けなし・全受信者共通) */
export function renderDay0PreferenceEmail(
  options: Partial<EmailRenderOptions> = {}
): RenderedEmail {
  return renderEmail(day0Definition(options.token), options.token);
}
