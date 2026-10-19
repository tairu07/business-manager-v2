import { LegalPage, legalMetadata } from "../legal";
import { terms } from "@/content/kabuSalonLegal";

export const metadata = legalMetadata(terms);

export default function Page() {
  return <LegalPage doc={terms} />;
}
