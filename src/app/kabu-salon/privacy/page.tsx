import { LegalPage, legalMetadata } from "../legal";
import { privacy } from "@/content/kabuSalonLegal";

export const metadata = legalMetadata(privacy);

export default function Page() {
  return <LegalPage doc={privacy} />;
}
