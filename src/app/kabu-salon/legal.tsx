import type { Metadata } from "next";
import { kabuSalonConfig } from "@/config/kabuSalon";
import { kabuSalonCopy as copy } from "@/content/kabuSalon";
import type { LegalDoc } from "@/content/kabuSalonLegal";
import { kabuSalonLegalDocs } from "@/content/kabuSalonLegal";
import "./kabu-salon.css";

const { name, company, urls } = kabuSalonConfig;

/** LP本体と同じ書体(ウェイトは本文に必要な分だけ) */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap";

export function legalMetadata(doc: LegalDoc): Metadata {
  return {
    title: { absolute: `${doc.title} | ${name}` },
    description: doc.description,
    robots: { index: true, follow: true },
  };
}

const NAV_DOCS = [
  kabuSalonLegalDocs.tokushoho,
  kabuSalonLegalDocs.privacy,
  kabuSalonLegalDocs.terms,
] as const;

/**
 * 法務ページ共通レイアウト。LPと同じ `.ks` の世界観(墨・生成り・金罫)で、
 * 演出用JSは載せない(reveal も使わない)ので、そのまま全文が表示される。
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="ks legal-page">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      <nav className="nav nav--static" aria-label="法務ページナビゲーション">
        <a className="nav__brand" href={urls.lp} aria-label="サロンのページへ戻る">
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__name">{name}</span>
        </a>
        <div className="nav__links">
          <a className="nav__link" href={urls.lp}>
            サロンのページへ
          </a>
        </div>
      </nav>

      <main className="section legal">
        <article className="container legal__container">
          <div className="eyebrow">
            <span className="eyebrow__en">{doc.en}</span>
            <span className="eyebrow__rule" aria-hidden="true" />
            <span className="eyebrow__jp">{name}</span>
          </div>
          <h1 className="h2 legal__title">{doc.title}</h1>
          <p className="legal__updated">最終更新日 {company.legalUpdatedAt}</p>

          {doc.intro?.map((p) => (
            <p className="legal__intro" key={p}>
              {p}
            </p>
          ))}

          {doc.rows ? (
            <dl className="legal__table">
              {doc.rows.map((row) => (
                <div className="legal__row" key={row.label}>
                  <dt className="legal__label">{row.label}</dt>
                  <dd className="legal__value">
                    {(typeof row.value === "string" ? [row.value] : row.value).map(
                      (v) => (
                        <p key={v}>{v}</p>
                      )
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {doc.sections?.map((section) => {
            const List = section.ordered ? "ol" : "ul";
            return (
              <section className="legal__section" key={section.heading}>
                <h2 className="legal__h2">{section.heading}</h2>
                {section.paragraphs?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {section.list ? (
                  <List
                    className={
                      section.ordered ? "legal__list legal__list--ordered" : "legal__list"
                    }
                  >
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </List>
                ) : null}
              </section>
            );
          })}
        </article>
      </main>

      <footer className="footer legal__footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <div className="footer__brand">{name}</div>
              <div className="footer__company">
                {company.legalName}
                <br />〒{company.postalCode} {company.address}
              </div>
            </div>
            <nav className="footer__links" aria-label="フッターリンク">
              <a className="footer__link" href={urls.lp}>
                サロンのページ
              </a>
              {NAV_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                <a className="footer__link" href={d.path} key={d.slug}>
                  {d.title}
                </a>
              ))}
            </nav>
          </div>
          <div className="copyright">{copy.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
}
