import { day1Definition } from "@/content/emails/day1";
import { renderEmail } from "./render";
import type { EmailRenderOptions, RenderedEmail } from "./types";

/** Day 1: 教育メール(topicで件名・本文を切り替え) */
export function renderDay1EducationEmail(options: EmailRenderOptions): RenderedEmail {
  return renderEmail(day1Definition(options.topic, options.token), options.token);
}
