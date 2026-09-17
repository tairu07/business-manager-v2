import type { Metadata } from "next";
import { Fragment } from "react";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonCopy as copy } from "@/content/kabuSalon";
import { Photo, PhotoCredits, photoStyle, resolvePhoto } from "./photos";
import "./kabu-salon.css";

export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  robots: { index: true, follow: true },
};

/** 実際に使う書体・ウェイトだけ要求する(明朝 400/500/600、ゴシック 300〜700、欧文は italic のみ) */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap";

const { pricing, operator, urls, name } = kabuSalonConfig;

/** 【 】付きの値は未設定のプレースホルダー(公開前に config で置換する) */
function isPlaceholder(value: string): boolean {
  return value.startsWith("【");
}

/** 見出しの「N. 」プレフィックスを外す(番号は欧文の i. ii. iii. で示すため) */
function stripIndex(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

/** content の段落(文字列 と { em } の並び)を描画する */
type Segment = string | { readonly em: string };
function Paragraph({ segments }: { segments: ReadonlyArray<Segment> }) {
  return (
    <p>
      {segments.map((seg, i) =>
        typeof seg === "string" ? (
          <Fragment key={i}>{seg}</Fragment>
        ) : (
          <span className="em" key={i}>
            {seg.em}
          </span>
        )
      )}
    </p>
  );
}

/** 文中の keyword を金にする。breakAfter を指定すると、その直後でモバイルのみ改行する */
function Gold({
  text,
  keyword,
  breakAfter,
}: {
  text: string;
  keyword: string;
  breakAfter?: string;
}) {
  const at = text.indexOf(keyword);
  if (at < 0) return <>{text}</>;
  const rest = text.slice(at + keyword.length);
  return (
    <>
      {text.slice(0, at)}
      <span className="gold">{keyword}</span>
      {breakAfter ? <BreakAfter text={rest} at={breakAfter} mobileOnly /> : rest}
    </>
  );
}

/** 最初に現れる at の直後で改行する(mobileOnly なら ≤600px のみ)。語の途中での折り返しを防ぐ */
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

/** 「。」で区切り、モバイルだけ文ごとに改行する(括弧の途中で折り返さないため) */
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

function Eyebrow({ en, jp, center }: { en: string; jp: string; center?: boolean }) {
  return (
    <div className={center ? "eyebrow eyebrow--center reveal" : "eyebrow reveal"}>
      <span className="eyebrow__en">{en}</span>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span className="eyebrow__jp">{jp}</span>
    </div>
  );
}

function QuoteBand({
  quote,
  alt,
  photo,
}: {
  quote: (typeof copy.quotes)[number];
  alt?: boolean;
  photo?: ReturnType<typeof resolvePhoto>;
}) {
  const classes = [
    "quote-band",
    alt && "quote-band--alt",
    photo && "quote-band--photo",
    "reveal",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={photoStyle(photo ?? null)}>
      <p className="quote-band__text">
        {quote.text.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </p>
      <span className="quote-band__attr">— {quote.attr}</span>
    </div>
  );
}

const ROMAN = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];
const KANJI = ["一", "二", "三", "四"];

/**
 * ナビの scrolled / .reveal の出現 / ヒーロー背景の点描。
 * JSが動かない環境でも全て見えるよう、冒頭でルートに js クラスを付けてから演出を有効化する。
 * 点描: 上場約3,800社を絞り込むイメージ。多数の薄い点と、ごく少数の金の点(星のように瞬く)。
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

/**
 * 株分析サロンのランディングページ。
 * 文言は src/content/kabuSalon.ts、価格・URLは src/config/kabuSalon.ts に集約。
 * デザインは依頼主の参照LP(投資分析レポートサロン)の言語をそのまま移植している。
 * 本名・社名・主宰写真は出さない(運営者情報は特商法ページ側)。
 */
export default function KabuSalonPage() {
  const [heroFirst, heroSecond] = copy.hero.heading;
  const [finalFirst, finalSecond] = copy.final.heading;
  // 写真はファイルの有無で出し分ける(無ければ写真なしのレイアウトのまま)
  const photos = {
    okami: resolvePhoto("okami"),
    quote1: resolvePhoto("quote1"),
    desk: resolvePhoto("desk"),
    quote2: resolvePhoto("quote2"),
    final: resolvePhoto("final"),
  };

  return (
    <div className="ks" id="top">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      {/* ナビ */}
      <nav className="nav" aria-label="メインナビゲーション">
        <a className="nav__brand" href="#top" aria-label="トップへ">
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__name">{name}</span>
          <span className="nav__name-en">{operator.handle}</span>
        </a>
        <div className="nav__links">
          <a className="nav__link" href="#why">
            なぜ作ったか
          </a>
          <a className="nav__link" href="#values">
            内容
          </a>
          <a className="nav__link" href="#method">
            分析の型
          </a>
          <a className="nav__link" href="#pricing">
            料金
          </a>
          <a className="nav__cta" href={urls.apply}>
            申し込む
          </a>
        </div>
      </nav>

      {/* ヒーロー */}
      <header className="hero">
        <canvas id="ks-constellation" className="hero__canvas" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            <span className="hero__badge-text">{copy.hero.badge}</span>
          </div>
          <h1 className="hero__title">
            <Gold text={heroFirst} keyword={copy.hero.gold} />
            <br />
            {heroSecond}
          </h1>
          <p className="hero__sub">
            {copy.hero.lead[0]}
            <br />
            <BreakAfter text={copy.hero.lead[1]} at="、" mobileOnly />
          </p>
          <p className="hero__note">
            <Sentences text={copy.hero.priceLine} />
          </p>
          <div className="hero__cta-group">
            <a className="btn btn--primary" href={urls.apply} id="cta-hero">
              {copy.hero.cta}
            </a>
            <a className="btn btn--ghost" href="#why">
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
        {/* Why — なぜ作ったか */}
        <section className="section" id="why">
          <div className="container">
            <Eyebrow en={copy.why.en} jp={copy.why.jp} />
            <h2 className="h2 reveal">
              {copy.why.heading[0]}
              <br />
              <Gold text={copy.why.heading[1]} keyword="続かない" />
            </h2>
            <div className="okami">
              <div className="reveal">
                <p className="okami__quote">
                  {copy.why.quote.map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </p>
              </div>
              <div className="okami__body reveal">
                {copy.why.paragraphs.map((segments, i) => (
                  <Paragraph segments={segments} key={i} />
                ))}
              </div>
              {/* 2カラムの下に全幅の横長帯として置く(グリッド直下の子でないと grid-column が効かない) */}
              <Photo photo={photos.okami} variant="okami" className="reveal" />
            </div>
          </div>
        </section>

        {/* Honestly — 正直な位置づけ */}
        <section className="section section--alt" id="honest">
          <div className="container">
            <Eyebrow en={copy.honest.en} jp={copy.honest.jp} />
            <h2 className="h2 reveal">
              {copy.honest.heading[0]}
              <br className="br-sm" />
              {copy.honest.heading[1]}
            </h2>
            <div className="values" style={{ marginTop: 64 }}>
              {copy.honest.items.map((item, i) => (
                <div className="reveal" key={item.title}>
                  <div className="value__head">
                    <span className="value__index">{ROMAN[i]}</span>
                    <h3 className="value__title">{item.title}</h3>
                  </div>
                  <p className="value__desc">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="fit reveal" style={{ marginTop: 72 }}>
              <div className="fit__col fit__col--yes">
                <div className="fit__head">
                  <span className="fit__head-mark">For You</span>
                  {copy.forWhom.heading}
                </div>
                <ul className="fit__list">
                  {copy.forWhom.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="fit__col fit__col--no">
                <div className="fit__head">
                  <span className="fit__head-mark">Not For</span>
                  {copy.forWhom.notHeading}
                </div>
                <ul className="fit__list">
                  {copy.forWhom.notItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 引用帯 */}
        <QuoteBand quote={copy.quotes[0]} photo={photos.quote1} />

        {/* What You Get — 内容 */}
        <section className="section" id="values">
          <div className="container">
            <Eyebrow en={copy.offer.en} jp={copy.offer.heading} />
            <h2 className="h2 reveal">
              週1回の<span className="gold">Zoom</span>は、
              <br className="br-sm" />
              約束します。
            </h2>
            <p className="lead reveal">{copy.offer.lead}</p>
            <div className="values values--five" style={{ marginTop: 56 }}>
              {copy.offer.items.map((item, i) => (
                <div className="reveal" key={item.title}>
                  <div className="value__head">
                    <span className="value__index">{ROMAN[i]}</span>
                    <h3 className="value__title">{item.title}</h3>
                  </div>
                  <p className="value__desc">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="values-note reveal">※ {copy.disclaimer.items[1]}</p>
          </div>
        </section>

        {/* Philosophy — まず、負けない */}
        <section className="section section--alt" id="philosophy">
          <div className="container">
            <Eyebrow en={copy.philosophy.en} jp={copy.philosophy.jp} />
            <div className="okami">
              <div className="reveal">
                <p className="okami__quote">
                  {copy.philosophy.story.quote.map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </p>
                <div className="seal" aria-label="まず負けない">
                  <span className="seal__stamp">不敗</span>
                  <span className="seal__caption">{copy.philosophy.story.sealLabel}</span>
                </div>
              </div>
              <div className="okami__body reveal">
                {copy.philosophy.story.paragraphs.map((segments, i) => (
                  <Paragraph segments={segments} key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Method — 分析の軸は3つ */}
        <section className="section" id="method">
          <div className="container">
            <Eyebrow en="Method" jp="分析の軸" />
            <h2 className="h2 reveal">
              分析の軸は、<span className="gold">3つ</span>だけ。
            </h2>
            <p className="lead reveal">{copy.philosophy.lead}</p>
            <div className="values" style={{ marginTop: 64 }}>
              {copy.philosophy.items.map((item, i) => (
                <div className="reveal" key={item.title}>
                  <div className="value__head">
                    <span className="value__index">{ROMAN[i]}</span>
                    <h3 className="value__title">{stripIndex(item.title)}</h3>
                  </div>
                  <p className="value__desc">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="dont reveal">
              <div className="dont__head">
                <span className="dont__head-mark">Never</span>
                {copy.philosophy.dont.title}
              </div>
              <ul className="dont__list">
                {copy.philosophy.dont.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Process — 分析の中身 */}
        <section className="section section--alt" id="process">
          <div className="container">
            <Eyebrow en={copy.method.en} jp={copy.method.heading} />
            <div
              className={
                photos.desk ? "process__head process__head--photo" : "process__head"
              }
            >
              <h2 className="h2 reveal">
                抽象論ではなく、
                <br className="br-sm" />
                <span className="gold">配信でこれ</span>を回す。
              </h2>
              <Photo photo={photos.desk} variant="desk" className="reveal" />
            </div>
            <ol className="steps reveal">
              {copy.method.items.map((item, i) => (
                <li className="step" key={item.title}>
                  <span className="step__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="step__title">{item.title}</h3>
                  <p className="step__desc">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Four Precepts — 四訓 */}
        <section className="section" id="precepts">
          <div className="container">
            <Eyebrow en="Four Precepts" jp="行動指針" />
            <h2 className="h2 reveal">{copy.precepts.heading}</h2>
            <div className="precepts reveal">
              {copy.precepts.items.map((p, i) => (
                <div className="precept" key={p.title}>
                  <div className="precept__num">{KANJI[i]}</div>
                  <h3 className="precept__title">{p.title}</h3>
                  <p className="precept__desc">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 引用帯 */}
        <QuoteBand quote={copy.quotes[1]} alt photo={photos.quote2} />

        {/* Passport — ファンのパスポート */}
        <section className="section" id="passport">
          <div className="container">
            <Eyebrow en={copy.passport.en} jp={copy.passport.jp} />
            <h2 className="h2 reveal">
              {copy.passport.heading[0]}
              <br />
              <Gold text={copy.passport.heading[1]} keyword="パスポート" />
            </h2>
            <p className="lead reveal">{copy.passport.lead}</p>
            <div className="precepts precepts--three reveal" style={{ marginTop: 56 }}>
              {copy.passport.items.map((item, i) => (
                <div className="precept" key={item.title}>
                  <div className="precept__num precept__num--latin" aria-hidden="true">
                    {ROMAN[i]}
                  </div>
                  <h3 className="precept__title">{item.title}</h3>
                  <p className="precept__desc">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership — 料金 */}
        <section className="section section--alt" id="pricing">
          <div className="container">
            <Eyebrow en={copy.pricing.en} jp={copy.pricing.heading} center />
            <h2 className="h2 h2--center reveal">
              責任と締切を、
              <br className="br-sm" />
              <span className="gold">買って</span>もらう値段。
            </h2>
            <div className="pricing pricing--single">
              <div className="plan plan--featured reveal">
                <span className="plan__tag">先着{pricing.earlyBirdSeats}名 先行価格</span>
                <div className="plan__name">{name}</div>
                <div className="plan__name-en">{operator.handle}</div>
                <div className="plan__price">
                  <span className="plan__amount">{yen(pricing.earlyBird)}</span>
                  <small>/ 月(税抜)</small>
                </div>
                <div className="plan__tax">税込 {yen(withTax(pricing.earlyBird))}</div>
                <div className="plan__limit">
                  先着{pricing.earlyBirdSeats}名の先行価格。
                  <br />
                  通常 {yen(pricing.regular)}(税込 {yen(withTax(pricing.regular))})
                  <br />
                  <BreakAfter text={copy.pricing.notes[0]} at="限り" />
                </div>
                <ul className="plan__list">
                  {copy.offer.items.map((item) => (
                    <li key={item.title}>{item.title}</li>
                  ))}
                  <li>今後のサロン・ツールの会員割引</li>
                </ul>
                <a className="btn btn--primary" href={urls.apply} id="cta-pricing">
                  {copy.pricing.cta}
                </a>
              </div>
            </div>
            <div className="pricing-note reveal">
              <p>※ {copy.pricing.notes[1]}</p>
              <p>※ {copy.pricing.notes[2]}</p>
            </div>
          </div>
        </section>

        {/* Flow — 参加までの流れ */}
        <section className="section" id="flow">
          <div className="container">
            <Eyebrow en="Flow" jp={copy.flow.heading} />
            <h2 className="h2 reveal">申込から、参加まで。</h2>
            <ol className="precepts reveal">
              {copy.flow.steps.map((step, i) => (
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
        <section className="section section--alt" id="faq">
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

        {/* 最終CTA */}
        <section
          className={photos.final ? "final final--photo" : "final"}
          id="join"
          style={photoStyle(photos.final)}
        >
          <div className="final__inner reveal">
            <h2 className="final__title">
              <Gold text={finalFirst} keyword={copy.final.gold} />
              <br />
              {finalSecond}
            </h2>
            <p className="final__sub">
              <Sentences text={copy.hero.priceLine} />
              <br />
              {copy.honest.items[2].body}
            </p>
            <a className="btn btn--primary" href={urls.apply} id="cta-final">
              {copy.pricing.cta}
            </a>
            <p className="final__note">{copy.hero.ctaNote}</p>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <div className="footer__brand">{name}</div>
              <div className="footer__company">
                {copy.footer.operatorNote}
                {isPlaceholder(operator.contact) ? null : (
                  <>
                    <br />
                    {copy.footer.contact}：{operator.contact}
                  </>
                )}
              </div>
            </div>
            <nav className="footer__links" aria-label="フッターリンク">
              <a className="footer__link" href={urls.tokushoho}>
                {copy.footer.tokushoho}
              </a>
              <a className="footer__link" href={urls.privacyPolicy}>
                {copy.footer.privacyPolicy}
              </a>
            </nav>
          </div>
          <div className="disclaimer">
            <h2 className="disclaimer__title">{copy.disclaimer.heading}</h2>
            {copy.disclaimer.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <PhotoCredits photos={Object.values(photos)} />
          <div className="copyright">{copy.footer.copyright}</div>
        </div>
      </footer>

      <script data-ks="1" dangerouslySetInnerHTML={{ __html: KS_SCRIPT }} />
    </div>
  );
}
