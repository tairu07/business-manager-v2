import { day3Definition } from "@/content/emails/day3";
import { renderEmail } from "./render";
import type { EmailRenderOptions, RenderedEmail } from "./types";

/** Day 3: コース案内メール(topicで件名・商品ブロックを切り替え) */
export function renderDay3OfferEmail(options: EmailRenderOptions): RenderedEmail {
  return renderEmail(day3Definition(options.topic, options.token), options.token);
}
