import { copy } from "@/content/copy";
import { launchConfig } from "@/config/launch";

/** フッター: プライバシーポリシー / 特商法表記 / 問い合わせ先 / 配信者の正式名称 */
export function SiteFooter() {
  const links = [
    { label: copy.footer.privacyPolicy, href: launchConfig.urls.privacyPolicy },
    { label: copy.footer.tokushoho, href: launchConfig.urls.tokushoho },
  ];
  return (
    <footer className="mt-auto bg-navy-900 px-4 py-8 text-sm text-white/85">
      <div className="mx-auto max-w-xl space-y-4">
        <nav aria-label="フッターリンク">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="underline underline-offset-4 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p>
          {copy.footer.contact}:{launchConfig.sender.contact}
        </p>
        <p className="text-white/70">配信者:{launchConfig.sender.legalName}</p>
      </div>
    </footer>
  );
}
