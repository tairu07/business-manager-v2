import type { Metadata } from "next";
import { Fragment } from "react";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonCopy } from "@/content/kabuSalon";
import { kabuSalonV3Copy as copy, type V3Section } from "@/content/kabuSalonV3";
import {
  BreakAfter,
  Eyebrow,
  FONTS_HREF,
  Gold,
  KS_SCRIPT,
  Lines,
  ROMAN,
  Sentences,
} from "../parts";
import { PhotoCredits, photoStyle, resolvePhoto } from "../photos";
import { shareMetadata } from "../share";
import "../kabu-salon.css";
import "../v2.css";
import "./v3.css";

/**
 * 【作成中】文言が仮のあいだは、このフォルダを _v3 にして公開していない
 * (Next.js は _ で始まるフォルダを URL にしない)。文言が決まったら v3 に戻して公開する。
 *
 * 株分析サロン 3つ目のLP(「本業・副業・投資を 1:1:1 に」)。本線(/kabu-salon)とは別のURLに置く。
 * 2026/11/14 の本人の録音(サロンをどういうサロンにしていきたいか)をもとに作った。
 * 文言は src/content/kabuSalonV3.ts。価格・URL・免責・参加までの流れ・共通のFAQは、ほかのLPと同じものを使う。
 * 見た目は本線のLP(v2.css)を土台に、1:1:1 の3本柱など、このLPだけの部品を ./v3.css に足している。
 */
export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  // 本線は /kabu-salon。こちらは別の切り口を試すページなので、検索には出さない
  robots: { index: false, follow: true },
  ...shareMetadata({
    title: copy.meta.title,
    description: copy.meta.description,
    path: kabuSalonConfig.urls.lpV3,
    image: kabuSalonConfig.share.images.lpV3,
  }),
};

const { pricing, urls, name } = kabuSalonConfig;

/** 申込ボタンの行き先。このLPは enrollment.v3Open に従う(本線の open とは別の切り替え) */
const open = kabuSalonConfig.enrollment.v3Open;
const ctaHref = open ? urls.apply : urls.waitlist;
const ctaLabel = open ? copy.pricing.cta : copy.closed.cta;
const navLabel = open ? copy.pricing.cta : copy.closed.navCta;
/** 募集停止中は「今期の募集は終了しました。」を価格の行に足す */
const priceLine = open
  ? copy.hero.priceLine
  : `${copy.hero.priceOnly}${copy.closed.status}`;
const ctaNote = open ? copy.hero.ctaNote : copy.closed.ctaNote;

/** ナビに出す節(あるものだけ出す) */
const NAV: ReadonlyArray<{ id: V3Section["id"]; label: string }> = [
  { id: "ratio", label: "1:1:1" },
  { id: "switch", label: "スイッチ" },
  { id: "story", label: "タイちゃん" },
];

/** 節の見出し(2行目だけスマホで改行する。金にする語はどちらの行にあってもよい) */
function SectionHeading({ section }: { section: V3Section }) {
  return (
    <h2 className="h2 reveal">
      {section.heading.map((line, i) => (
        <Fragment key={line}>
          {i > 0 ? <br className="br-sm" /> : null}
          {section.gold ? <Gold text={line} keyword={section.gold} /> : line}
        </Fragment>
      ))}
    </h2>
  );
}

/** 節の中身(種類ごとに見せ方を変える) */
function SectionBody({ section }: { section: V3Section }) {
  switch (section.id) {
    // 1:1:1 — 3本の柱を横に並べる(スマホでは縦)
    case "ratio":
      return (
        <ol className="ratio reveal">
          {section.items.map((item, i) => (
            <li className="ratio__col" key={item.title}>
              <div className="ratio__mark">
                <span className="ratio__num" aria-hidden="true">
                  1
                </span>
                <span className="ratio__label">{copy.pillars[i]}</span>
              </div>
              <div className="ratio__text">
                <h3 className="ratio__title">{item.title}</h3>
                <p className="ratio__desc">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    // 読み手の気持ちの一覧と、短い語り
    case "problem":
      return (
        <>
          <ul className="feel reveal">
            {section.feelings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="lead honest__lead affinity reveal">
            <Lines lines={section.narrative} />
          </p>
        </>
      );
    // 大きな引用と段落(見方を変える話、タイちゃんのこと)
    case "reframe":
    case "story":
      return (
        <div className="okami v3-okami">
          <div className="reveal">
            <p className="okami__quote">
              <Lines lines={section.quote} />
            </p>
          </div>
          <div className="okami__body reveal">
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      );
    // スイッチの中身 — 番号つきの場面
    case "switch":
      return (
        <ol className="steps reveal" style={{ marginTop: 48 }}>
          {section.items.map((item, i) => (
            <li className="step" key={item.title}>
              <span className="step__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="step__title">{item.title}</h3>
              <p className="step__desc">{item.body}</p>
            </li>
          ))}
        </ol>
      );
    // 受け取れるもの — 金罫のカード
    case "contents":
      return (
        <div
          className={
            section.items.length === 4
              ? "precepts precepts--two reveal"
              : "precepts precepts--three reveal"
          }
          style={{ marginTop: 56 }}
        >
          {section.items.map((item, i) => (
            <div className="precept" key={item.title}>
              <div className="precept__num precept__num--latin" aria-hidden="true">
                {ROMAN[i]}
              </div>
              <h3 className="precept__title">{item.title}</h3>
              <p className="precept__desc">{item.body}</p>
            </div>
          ))}
        </div>
      );
  }
}

export default function KabuSalonV3Page() {
  const photos = { final: resolvePhoto("final") };
  // 背景色を交互にする(節の並びを入れ替えても崩れないよう、描画順で数える)
  let sectionCount = 0;
  const sectionClass = () => (sectionCount++ % 2 ? "section section--alt" : "section");
  const disclaimer = kabuSalonCopy.disclaimer;
  const footer = kabuSalonCopy.footer;
  const sectionIds = new Set(copy.sections.map((s) => s.id));

  return (
    <div className="ks ks-v2 ks-v3" id="top">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      <nav className="nav" aria-label="メインナビゲーション">
        <a className="nav__brand" href="#top" aria-label="トップへ">
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__name">{name}</span>
          <span className="nav__name-en">{copy.handle}</span>
        </a>
        <div className="nav__links">
          {NAV.filter((item) => sectionIds.has(item.id)).map((item) => (
            <a className="nav__link" href={`#${item.id}`} key={item.id}>
              {item.label}
            </a>
          ))}
          <a className="nav__link" href="#pricing">
            料金
          </a>
          <a className="nav__cta" href={ctaHref}>
            {navLabel}
          </a>
        </div>
      </nav>

      <header className="hero">
        <canvas id="ks-constellation" className="hero__canvas" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            <span className="hero__badge-text">
              {open ? copy.hero.badge : copy.closed.badge}
            </span>
          </div>
          <h1 className="hero__title">
            {copy.hero.heading.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? <br /> : null}
                <Gold text={line} keyword={copy.hero.gold} />
              </Fragment>
            ))}
          </h1>
          {/* 1:1:1 を目で見せる帯(読み上げでは「本業1、副業1、投資1」) */}
          <p
            className="hero__ratio"
            aria-label={copy.pillars.map((p) => `${p}1`).join("、")}
          >
            {copy.pillars.map((pillar, i) => (
              <Fragment key={pillar}>
                {i > 0 ? (
                  <span className="hero__ratio-sep" aria-hidden="true">
                    :
                  </span>
                ) : null}
                <span className="hero__ratio-item" aria-hidden="true">
                  <span className="hero__ratio-num">1</span>
                  <span className="hero__ratio-label">{pillar}</span>
                </span>
              </Fragment>
            ))}
          </p>
          <p className="hero__sub">
            <Lines lines={copy.hero.lead} />
          </p>
          <p className="hero__note">
            <Sentences text={priceLine} />
          </p>
          <div className="hero__cta-group">
            <a className="btn btn--primary" href={ctaHref} id="cta-hero">
              {ctaLabel}
            </a>
            <a className="btn btn--ghost" href={`#${copy.hero.secondaryTarget}`}>
              {copy.hero.ctaSecondary}
            </a>
          </div>
          {open ? null : <p className="hero__after">{kabuSalonCopy.waitlistNote}</p>}
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-line" />
          <span className="hero__scroll-text">Scroll</span>
        </div>
      </header>

      <main>
        {copy.sections.map((section) => (
          <section className={sectionClass()} id={section.id} key={section.id}>
            <div className="container">
              <Eyebrow en={section.eyebrowEn} jp={section.eyebrowJp} />
              <SectionHeading section={section} />
              {section.lead ? <p className="lead reveal">{section.lead}</p> : null}
              <SectionBody section={section} />
              {section.note ? (
                <p
                  className={
                    section.id === "switch" ? "note-box reveal" : "values-note reveal"
                  }
                >
                  {section.id === "switch" ? section.note : `※ ${section.note}`}
                </p>
              ) : null}
            </div>
          </section>
        ))}

        {/* 参加の条件 */}
        <section className={sectionClass()} id="pricing">
          <div className="container">
            <Eyebrow en={copy.pricing.en} jp={copy.pricing.jp} center />
            <h2 className="h2 h2--center reveal">
              {copy.pricing.heading[0]}
              <br className="br-sm" />
              {copy.pricing.heading[1]}
            </h2>
            <p className="lead lead--center pricing-lead reveal">
              {copy.pricing.lead.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 ? <br className="br-lg" /> : null}
                  {line}
                </Fragment>
              ))}
            </p>
            <div className="pricing pricing--single">
              <div className="plan plan--featured reveal">
                <span className="plan__tag">
                  {open ? copy.pricing.tag : copy.closed.tag}
                </span>
                <div className="plan__name">{name}</div>
                <div className="plan__name-en">{copy.handle}</div>
                <div className="plan__price">
                  <span className="plan__amount">{yen(pricing.regular)}</span>
                  <small>/ 月(税抜)</small>
                </div>
                <div className="plan__tax">税込 {yen(withTax(pricing.regular))}</div>
                <div className="plan__limit">{copy.pricing.limit}</div>
                <ul className="plan__list">
                  {copy.pricing.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="btn btn--primary" href={ctaHref} id="cta-pricing">
                  {ctaLabel}
                </a>
              </div>
            </div>
            <div className="pricing-note reveal">
              {[...copy.pricing.ownNotes, ...copy.pricing.notes].map((note) => (
                <p key={note}>※ {note}</p>
              ))}
            </div>
          </div>
        </section>

        {/* 向く人・向かない人 */}
        <section className={sectionClass()} id="fit">
          <div className="container">
            <div className="fit reveal">
              <div className="fit__col fit__col--yes">
                <div className="fit__head">
                  <span className="fit__head-mark">For You</span>
                  {copy.fit.yesHeading}
                </div>
                <ul className="fit__list">
                  {copy.fit.yes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="fit__col fit__col--no">
                <div className="fit__head">
                  <span className="fit__head-mark">Not For</span>
                  {copy.fit.noHeading}
                </div>
                <ul className="fit__list">
                  {copy.fit.no.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 参加までの流れ(ほかのLPと同じ手順) */}
        <section className={sectionClass()} id="flow">
          <div className="container">
            <Eyebrow en="Flow" jp={kabuSalonCopy.flow.heading} />
            <h2 className="h2 reveal">
              {open ? kabuSalonCopy.flow.title : kabuSalonCopy.flow.closedTitle}
            </h2>
            <ol className="precepts reveal">
              {(open ? kabuSalonCopy.flow.steps : kabuSalonCopy.flow.closedSteps).map(
                (step, i) => (
                  <li className="precept" key={step}>
                    <div className="precept__num precept__num--latin" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="precept__desc">{step}</p>
                  </li>
                )
              )}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section className={sectionClass()} id="faq">
          <div className="container">
            <Eyebrow en="FAQ" jp={copy.faq.heading} />
            <h2 className="h2 reveal">
              <BreakAfter text={copy.faq.lead} at="、" mobileOnly />
            </h2>
            <div className="faq reveal">
              {copy.faq.items.map((item) => (
                <details className="faq__item" key={item.q}>
                  <summary className="faq__q">
                    <span className="faq__mark" aria-hidden="true">
                      Q.
                    </span>
                    {item.q}
                  </summary>
                  <p className="faq__a">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 最後の行動 */}
        <section
          className={photos.final ? "final final--photo" : "final"}
          id="join"
          style={photoStyle(photos.final)}
        >
          <div className="final__inner reveal">
            <h2 className="final__title">
              {copy.final.heading.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 ? <br /> : null}
                  <Gold text={line} keyword={copy.final.gold} />
                </Fragment>
              ))}
            </h2>
            <p className="final__sub">
              <Sentences text={priceLine} />
              <br />
              <BreakAfter text={copy.final.sub} at="。" mobileOnly />
            </p>
            <a className="btn btn--primary" href={ctaHref} id="cta-final">
              {ctaLabel}
            </a>
            <p className="final__note">
              <BreakAfter text={ctaNote} at="、" mobileOnly />
            </p>
          </div>
        </section>

        {/* 追伸 */}
        <section className="section section--tight ps-section" id="ps">
          <div className="container">
            <div className="ps reveal">
              <p className="ps__label">{copy.postscript.label}</p>
              {copy.postscript.paragraphs.map((p) => (
                <p className="ps__body" key={p}>
                  {p}
                </p>
              ))}
              <a className="btn btn--ghost ps__cta" href={ctaHref} id="cta-ps">
                {ctaLabel}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <div className="footer__brand">{name}</div>
              <div className="footer__company">{footer.operatorNote}</div>
            </div>
            <nav className="footer__links" aria-label="フッターリンク">
              <a className="footer__link" href={urls.tokushoho}>
                {footer.tokushoho}
              </a>
              <a className="footer__link" href={urls.privacyPolicy}>
                {footer.privacyPolicy}
              </a>
              <a className="footer__link" href={urls.terms}>
                {footer.terms}
              </a>
            </nav>
          </div>
          <div className="disclaimer">
            <h2 className="disclaimer__title">{disclaimer.heading}</h2>
            {disclaimer.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <PhotoCredits photos={Object.values(photos)} />
          <div className="copyright">{footer.copyright}</div>
        </div>
      </footer>

      <script data-ks="1" dangerouslySetInnerHTML={{ __html: KS_SCRIPT }} />
    </div>
  );
}
