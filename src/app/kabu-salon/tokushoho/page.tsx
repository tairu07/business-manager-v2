import { LegalPage, legalMetadata } from "../legal";
import { getTokushoho } from "@/content/kabuSalonLegal";

/** 「初回0円」の案内を期日後に自動で消すため、1時間ごとに再生成する */
export const revalidate = 3600;

export const metadata = legalMetadata(getTokushoho());

export default function Page() {
  return <LegalPage doc={getTokushoho()} />;
}
