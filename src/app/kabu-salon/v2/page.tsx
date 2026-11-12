import type { Metadata } from "next";
import { Fragment } from "react";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { siteUrl } from "@/config/site";
import { kabuSalonCopy } from "@/content/kabuSalon";
import { kabuSalonV2Copy as copy, memberVoices } from "@/content/kabuSalonV2";
import { Photo, PhotoCredits, photoStyle, resolvePhoto } from "../photos";
import "../kabu-salon.css";
import "./v2.css";

/**
 * 株分析サロン 新LP。今のLP(/kabu-salon)とは別URLで、比較のために置く。
 * 今のLPのファイルには手を入れない(部品はこのファイル内に持つ)。
 * 文言は src/content/kabuSalonV2.ts、価格・URL・免責は今のLPと共通の設定を使う。
 */
export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  // 比較が終わるまで検索には出さない
  robots: { index: false, follow: true },
  metadataBase: siteUrl(),
  alternates: { canonical: kabuSalonConfig.urls.lpV2 },
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap";

const { pricing, urls, name } = kabuSalonConfig;

/** 申込ボタンの行き先。新LPは今のLPとは別の切り替え(enrollment.v2Open)に従う */
const open = kabuSalonConfig.enrollment.v2Open;
const ctaHref = open ? urls.apply : urls.waitlist;
const ctaLabel = open ? copy.pricing.cta : copy.closed.cta;
const navLabel = open ? copy.pricing.cta : copy.closed.navCta;
/** 募集停止中は「今期の募集は終了しました。」を価格の行に足す */
const priceLine = open
  ? copy.hero.priceLine
  : `${copy.hero.priceLine}${copy.closed.status}`;
const ctaNote = open ? copy.hero.ctaNote : copy.closed.ctaNote;

const ROMAN = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];

/** 文中の keyword を金にする。breakAfterKeyword なら、その直後でスマホだけ改行する */
function Gold({
  text,
  keyword,
  breakAfterKeyword,
}: {
  text: string;
  keyword: string;
  breakAfterKeyword?: boolean;
}) {
  const at = text.indexOf(keyword);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="gold">{keyword}</span>
      {breakAfterKeyword ? <br className="br-sm" /> : null}
      {text.slice(at + keyword.length)}
    </>
  );
}

/** 最初に現れる at の直後で改行する(mobileOnly なら ≤600px のみ) */
function BreakAfter({
  text,
  at,
  mobileOnly,
}: {
  text: string;
  at: string;
  mobileOnly?: boolean;
}) {
  const idx = text.indexOf(at);
  if (idx < 0) return <>{text}</>;
  const cut = idx + at.length;
  return (
    <>
      {text.slice(0, cut)}
      {mobileOnly ? <br className="br-sm" /> : <br />}
      {text.slice(cut)}
    </>
  );
}

/** 「。」で区切り、モバイルだけ文ごとに改行する */
function Sentences({ text }: { text: string }) {
  const parts = text.split("。").filter(Boolean);
  return (
    <>
      {parts.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && <br className="br-sm" />}
          {s}。
        </Fragment>
      ))}
    </>
  );
}

/** 行の配列を <br /> でつなぐ */
function Lines({ lines }: { lines: ReadonlyArray<string> }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

function Eyebrow({ en, jp, center }: { en: string; jp: string; center?: boolean }) {
  return (
    <div className={center ? "eyebrow eyebrow--center reveal" : "eyebrow reveal"}>
      <span className="eyebrow__en">{en}</span>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span className="eyebrow__jp">{jp}</span>
    </div>
  );
}

/**
 * ナビの scrolled / .reveal の出現 / ヒーロー背景の点描(今のLPと同じ演出)。
 * JSが動かない環境でも全て見えるよう、ルートに js クラスを付けてから演出を有効化する。
 */
const KS_SCRIPT = [
  "(function(){",
  "var root=document.querySelector('.ks');if(!root)return;",
  "var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;",
  "root.classList.add('js');",
  "var nav=root.querySelector('.nav');",
  "if(nav){var onScroll=function(){nav.classList.toggle('scrolled',window.scrollY>60);};window.addEventListener('scroll',onScroll,{passive:true});onScroll();}",
  "var reveals=root.querySelectorAll('.reveal');",
  "if('IntersectionObserver' in window){",
  "var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});",
  "reveals.forEach(function(el){io.observe(el);});",
  "}else{reveals.forEach(function(el){el.classList.add('visible');});}",
  "var canvas=document.getElementById('ks-constellation');if(!canvas||!canvas.getContext)return;",
  "var ctx=canvas.getContext('2d');var W=0,H=0,dots=[];var COUNT=3800;",
  "function resize(){var dpr=Math.min(window.devicePixelRatio||1,2);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}",
  "function init(){dots=[];var cx=W/2,cy=H/2;var R=Math.min(W,H)*0.5;var ax=W/Math.min(W,H);",
  "for(var i=0;i<COUNT;i++){var a=Math.random()*Math.PI*2;var r=R*(0.4+0.6*Math.sqrt(Math.random()));var gold=Math.random()<0.03;",
  "dots.push({x:cx+Math.cos(a)*r*ax*0.8,y:cy+Math.sin(a)*r*0.86,baseA:gold?0.35+Math.random()*0.35:0.06+Math.random()*0.22,s:gold?1.8:0.6+Math.random()*0.8,gold:gold,ph:Math.random()*Math.PI*2,sp:0.2+Math.random()*0.5,dx:(Math.random()-0.5)*0.05,dy:(Math.random()-0.5)*0.05});}}",
  "var t=0;",
  "function draw(){ctx.clearRect(0,0,W,H);",
  "for(var i=0;i<dots.length;i++){var d=dots[i];if(!reduced){d.x+=d.dx;d.y+=d.dy;if(d.x<-10)d.x=W+10;if(d.x>W+10)d.x=-10;if(d.y<-10)d.y=H+10;if(d.y>H+10)d.y=-10;}",
  "var tw=reduced?1:0.65+0.35*Math.sin(t*d.sp+d.ph);ctx.beginPath();ctx.arc(d.x,d.y,d.s,0,Math.PI*2);",
  "ctx.fillStyle=d.gold?'rgba(201,168,106,'+(d.baseA*tw).toFixed(3)+')':'rgba(237,230,214,'+(d.baseA*tw).toFixed(3)+')';ctx.fill();}",
  "t+=0.016;if(!reduced)requestAnimationFrame(draw);}",
  "resize();init();draw();",
  "var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){resize();init();if(reduced)draw();},200);});",
  "})();",
].join("\n");

export default function KabuSalonV2Page() {
  // 旅館・城・夜景の写真は今のLPの話に合わせたものなので使わない
  const photos = {
    desk: resolvePhoto("desk"),
    final: resolvePhoto("final"),
  };
  // 背景色を交互にする(会員の声の有無で並びが変わっても崩れないよう、描画順で数える)
  let sectionCount = 0;
  const sectionClass = () => (sectionCount++ % 2 ? "section section--alt" : "section");
  const disclaimer = kabuSalonCopy.disclaimer;
  const footer = kabuSalonCopy.footer;

  return (
    <div className="ks ks-v2" id="top">
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
          <a className="nav__link" href="#solution">
            探し方
          </a>
          <a className="nav__link" href="#contents">
            配信の中身
          </a>
          <a className="nav__link" href="#story">
            タイちゃん
          </a>
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
            {copy.hero.heading[0]}
            <br />
            <Gold
              text={copy.hero.heading[1]}
              keyword={copy.hero.gold}
              breakAfterKeyword
            />
          </h1>
          <p className="hero__sub">
            {copy.hero.lead[0]}
            <br />
            <BreakAfter text={copy.hero.lead[1]} at="、" mobileOnly />
            <br />
            {copy.hero.lead[2]}
          </p>
          <p className="hero__note">
            <Sentences text={priceLine} />
          </p>
          <div className="hero__cta-group">
            <a className="btn btn--primary" href={ctaHref} id="cta-hero">
              {ctaLabel}
            </a>
            <a className="btn btn--ghost" href="#contents">
              {copy.hero.ctaSecondary}
            </a>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-line" />
          <span className="hero__scroll-text">Scroll</span>
        </div>
      </header>

      <main>
        {/* P + A — こんな人のための部屋 */}
        <section className={sectionClass()} id="problem">
          <div className="container">
            <Eyebrow en={copy.problem.en} jp={copy.problem.jp} />
            <h2 className="h2 reveal">
              {copy.problem.heading[0]}
              <br className="br-sm" />
              {copy.problem.heading[1]}
            </h2>
            <ul className="feel reveal">
              {copy.problem.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="lead honest__lead affinity reveal">
              <Lines lines={copy.problem.affinity} />
            </p>
          </div>
        </section>

        {/* S — 答えではなく、探し方 */}
        <section className={sectionClass()} id="solution">
          <div className="container">
            <Eyebrow en={copy.solution.en} jp={copy.solution.jp} />
            <h2 className="h2 reveal">
              {copy.solution.heading[0]}
              <br className="br-sm" />
              <Gold text={copy.solution.heading[1]} keyword={copy.solution.gold} />
            </h2>
            <div className="prose reveal">
              {copy.solution.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="axes-lead reveal">{copy.solution.axesLead}</p>
            <div className="values values--four">
              {copy.solution.axes.map((item, i) => (
                <div className="reveal" key={item.title}>
                  <div className="value__head">
                    <span className="value__index">{ROMAN[i]}</span>
                    <h3 className="value__title">{item.title}</h3>
                  </div>
                  <p className="value__desc">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="prose reveal">{copy.solution.axesNote}</p>
          </div>
        </section>

        {/* C — 配信の中身 */}
        <section className={sectionClass()} id="contents">
          <div className="container">
            <Eyebrow en={copy.contents.en} jp={copy.contents.jp} />
            <div
              className={
                photos.desk ? "process__head process__head--photo" : "process__head"
              }
            >
              <h2 className="h2 reveal">
                {copy.contents.heading[0]}
                <br className="br-sm" />
                {copy.contents.heading[1]}
              </h2>
              <Photo photo={photos.desk} variant="desk" className="reveal" />
            </div>
            <p className="lead reveal">{copy.contents.lead}</p>
            <ol className="steps reveal" style={{ marginTop: 48 }}>
              {copy.contents.items.map((item, i) => (
                <li className="step" key={item.title}>
                  <span className="step__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="step__title">{item.title}</h3>
                  <p className="step__desc">{item.body}</p>
                </li>
              ))}
            </ol>
            <div className="note-box rounds reveal">
              <p className="rounds__title">{copy.contents.rounds.title}</p>
              <p>{copy.contents.rounds.body}</p>
            </div>
            <p className="values-note reveal">※ {copy.contents.note}</p>
          </div>
        </section>

        {/* B — 続けると、変わっていくこと */}
        <section className={sectionClass()} id="benefit">
          <div className="container">
            <Eyebrow en={copy.benefit.en} jp={copy.benefit.jp} />
            <h2 className="h2 reveal">
              {copy.benefit.heading[0]}
              <br className="br-sm" />
              <Gold text={copy.benefit.heading[1]} keyword={copy.benefit.gold} />
            </h2>
            <div className="precepts precepts--two reveal" style={{ marginTop: 56 }}>
              {copy.benefit.items.map((item, i) => (
                <div className="precept" key={item.title}>
                  <div className="precept__num precept__num--latin" aria-hidden="true">
                    {ROMAN[i]}
                  </div>
                  <h3 className="precept__title">{item.title}</h3>
                  <p className="precept__desc">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="note-box reveal">{copy.benefit.honest}</p>
          </div>
        </section>

        {/* これからの1年 */}
        <section className={sectionClass()} id="roadmap">
          <div className="container">
            <Eyebrow en={copy.roadmap.en} jp={copy.roadmap.jp} />
            <h2 className="h2 reveal">
              {copy.roadmap.heading[0]}
              <br className="br-sm" />
              {copy.roadmap.heading[1]}
            </h2>
            <p className="lead reveal">{copy.roadmap.lead}</p>
            <ol className="roadmap reveal">
              {copy.roadmap.items.map((item) => (
                <li className="roadmap__item" key={item.when}>
                  <span className="roadmap__when">{item.when}</span>
                  <p className="roadmap__body">{item.body}</p>
                </li>
              ))}
            </ol>
            <p className="values-note reveal">※ {copy.roadmap.note}</p>
          </div>
        </section>

        {/* プロフィール + E — タイちゃんのこと */}
        <section className={sectionClass()} id="story">
          <div className="container">
            <Eyebrow en={copy.story.en} jp={copy.story.jp} />
            <h2 className="h2 reveal">
              {copy.story.heading[0]}
              <br />
              <Gold text={copy.story.heading[1]} keyword={copy.story.gold} />
            </h2>
            <div className="okami">
              <div className="reveal">
                <p className="okami__quote">
                  <Lines lines={copy.story.quote} />
                </p>
              </div>
              <div className="okami__body reveal">
                {copy.story.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* E — 会員の声(許可を取った言葉があるときだけ) */}
        {memberVoices.length > 0 ? (
          <section className={sectionClass()} id="voices">
            <div className="container">
              <Eyebrow en={copy.voices.en} jp={copy.voices.jp} />
              <h2 className="h2 reveal">{copy.voices.heading}</h2>
              <div className="voices reveal">
                {memberVoices.map((v) => (
                  <figure className="voice" key={v.quote}>
                    <blockquote className="voice__quote">{v.quote}</blockquote>
                    <figcaption className="voice__who">{v.who}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* O — 参加の条件 */}
        <section className={sectionClass()} id="pricing">
          <div className="container">
            <Eyebrow en={copy.pricing.en} jp={copy.pricing.jp} center />
            <h2 className="h2 h2--center reveal">
              {copy.pricing.heading[0]}
              <br className="br-sm" />
              {copy.pricing.heading[1]}
            </h2>
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
              {copy.pricing.notes.map((note) => (
                <p key={note}>※ {note}</p>
              ))}
            </div>
          </div>
        </section>

        {/* N — 向く人・向かない人 */}
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

        {/* 参加までの流れ(今のLPと同じ手順) */}
        <section className={sectionClass()} id="flow">
          <div className="container">
            <Eyebrow en="Flow" jp={kabuSalonCopy.flow.heading} />
            <h2 className="h2 reveal">申込から、参加まで。</h2>
            <ol className="precepts reveal">
              {kabuSalonCopy.flow.steps.map((step, i) => (
                <li className="precept" key={step}>
                  <div className="precept__num precept__num--latin" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="precept__desc">{step}</p>
                </li>
              ))}
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

        {/* A — 最後の行動 */}
        <section
          className={photos.final ? "final final--photo" : "final"}
          id="join"
          style={photoStyle(photos.final)}
        >
          <div className="final__inner reveal">
            <h2 className="final__title">
              {copy.final.heading[0]}
              <br />
              <Gold text={copy.final.heading[1]} keyword={copy.final.gold} />
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
