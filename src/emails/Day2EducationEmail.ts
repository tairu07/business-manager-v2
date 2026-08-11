import { day2Definition } from "@/content/emails/day2";
import { renderEmail } from "./render";
import type { EmailRenderOptions, RenderedEmail } from "./types";

/** Day 2: 教育メール(topicで本文を切り替え) */
export function renderDay2EducationEmail(options: EmailRenderOptions): RenderedEmail {
  return renderEmail(day2Definition(options.topic, options.token), options.token);
}
