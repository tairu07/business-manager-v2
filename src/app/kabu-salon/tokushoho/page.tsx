import { LegalPage, legalMetadata } from "../legal";
import { tokushoho } from "@/content/kabuSalonLegal";

export const metadata = legalMetadata(tokushoho);

export default function Page() {
  return <LegalPage doc={tokushoho} />;
}
