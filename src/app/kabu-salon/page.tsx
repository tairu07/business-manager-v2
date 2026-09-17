import type { Metadata } from "next";
import { Fragment } from "react";
import { kabuSalonConfig, withTax, yen } from "@/config/kabuSalon";
import { kabuSalonCopy as copy } from "@/content/kabuSalon";
import "./kabu-salon.css";

export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
  robots: { index: true, follow: true },
};

/** 実際に使う書体・ウェイトだけ要求する(明朝 400/500/600、ゴシック 300〜700、欧文は italic のみ) */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap";

const { pricing, ladder, operator, urls, name } = kabuSalonConfig;

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

/** ヒーローの見出し: 「まず負けない」を金にし、読点で改行する(モバイルは閉じ括弧の後でも改行) */
function Headline({ text }: { text: string }) {
  const key = "まず負けない";
  const at = text.indexOf(key);
  if (at < 0) return <>{text}</>;
  const before = text.slice(0, at);
  const rest = text.slice(at + key.length);
  const comma = rest.indexOf("、");
  const restHead = comma >= 0 ? rest.slice(0, comma + 1) : rest;
  const restTail = comma >= 0 ? rest.slice(comma + 1) : "";
  return (
    <>
      {before}
      <span className="gold">{key}</span>
      {restHead.startsWith("」") ? (
        <>
          」<br className="br-sm" />
          {restHead.slice(1)}
        </>
      ) : (
        restHead
      )}
      {restTail ? (
        <>
          <br />
          {restTail}。
        </>
      ) : null}
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
}: {
  quote: (typeof copy.quotes)[number];
  alt?: boolean;
}) {
  return (
    <div className={alt ? "quote-band quote-band--alt reveal" : "quote-band reveal"}>
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
 */
export default function KabuSalonPage() {
  const salonTier = copy.ladder.tiers[1];
  const noteTier = copy.ladder.tiers[0];
  const irTier = copy.ladder.tiers[2];
  // ヒーロー本文の2文目を読点で分け、語の途中で折り返さないようにする
  const leadParts = copy.hero.lead[1].split("、");
  const [finalFirst, finalSecond] = copy.final.heading;

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
          <span className="nav__name-en">Stock Analysis Salon</span>
        </a>
        <div className="nav__links">
          <a className="nav__link" href="#method">
            分析の軸
          </a>
          <a className="nav__link" href="#values">
            提供価値
          </a>
          <a className="nav__link" href="#founder">
            主宰
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
            <span className="hero__badge-text">
              MEMBERSHIP — 先着{pricing.earlyBirdSeats}名 先行価格
            </span>
          </div>
          <h1 className="hero__title">
            <Headline text={copy.hero.heading} />
          </h1>
          <p className="hero__sub">
            {copy.hero.lead[0]}
            {leadParts.map((part, i) => (
              <Fragment key={i}>
                {i === leadParts.length - 1 ? <br className="br-sm" /> : <br />}
                {part}
                {i < leadParts.length - 1 ? "、" : ""}
              </Fragment>
            ))}
          </p>
          <p className="hero__note">
            <Sentences text={copy.hero.priceLine} />
          </p>
          <div className="hero__cta-group">
            <a className="btn btn--primary" href={urls.apply} id="cta-hero">
              {copy.hero.cta}
            </a>
            <a className="btn btn--ghost" href="#philosophy">
              分析の軸を読む
            </a>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-line" />
          <span className="hero__scroll-text">Scroll</span>
        </div>
      </header>

      <main>
        {/* Philosophy — まず、負けない */}
        <section className="section" id="philosophy">
          <div className="container">
            <Eyebrow en="Philosophy" jp="まず、負けない" />
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
                {copy.philosophy.story.paragraphs.slice(0, 2).map((segments, i) => (
                  <Paragraph segments={segments} key={i} />
                ))}
                <p>{copy.operator.paragraphs[1]}</p>
                <Paragraph segments={copy.philosophy.story.paragraphs[2]} />
              </div>
            </div>
          </div>
        </section>

        {/* Method — 分析の軸は3つ */}
        <section className="section section--alt" id="method">
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

        {/* 引用帯 */}
        <QuoteBand quote={copy.quotes[0]} />

        {/* Four Precepts — 四訓 */}
        <section className="section section--tight" id="precepts">
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

        {/* What You Get — 提供価値 */}
        <section className="section section--alt" id="values">
          <div className="container">
            <Eyebrow en="What You Get" jp={copy.offer.heading} />
            <h2 className="h2 reveal">
              銘柄ではなく、
              <br className="br-sm" />
              <span className="gold">プロセス</span>を渡す。
            </h2>
            <div className="values values--five">
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

        {/* Process — 分析の中身 */}
        <section className="section" id="process">
          <div className="container">
            <Eyebrow en="Process" jp={copy.method.heading} />
            <h2 className="h2 reveal">
              抽象論ではなく、
              <br className="br-sm" />
              <span className="gold">毎週これ</span>を回す。
            </h2>
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

        {/* 引用帯 */}
        <QuoteBand quote={copy.quotes[1]} alt />

        {/* For You — or Not */}
        <section className="section" id="fit">
          <div className="container">
            <Eyebrow en="For You — or Not" jp="向き、不向き" />
            <h2 className="h2 reveal">
              正直に言います。
              <br />
              全員には、向いていません。
            </h2>
            <div className="fit reveal">
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

        {/* Founder — 主宰 */}
        <section className="section section--alt" id="founder">
          <div className="container">
            <Eyebrow en="Founder" jp="運営者・主宰" />
            <div className="founder">
              <div className="founder__aside reveal">
                <div className="founder__role">代表・主宰</div>
                <h2 className="founder__name">{operator.displayName}</h2>
                <div className="founder__name-en">Taisei — SENRITSU Inc.</div>
              </div>
              <div className="reveal">
                <div className="founder__bio">
                  {copy.operator.bio.map((segments, i) => (
                    <Paragraph segments={segments} key={i} />
                  ))}
                </div>
                <p className="founder__note">{copy.operator.paragraphs[2]}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Membership — 料金 */}
        <section className="section" id="pricing">
          <div className="container">
            <Eyebrow en="Membership" jp={copy.ladder.heading} center />
            <h2 className="h2 h2--center reveal">
              銘柄ではなく、
              <br className="br-sm" />
              <span className="gold">プロセス</span>に払う。
            </h2>
            <p className="lead lead--center reveal">{copy.ladder.lead}</p>
            <div className="pricing">
              {/* note */}
              <div className="plan reveal">
                <div className="plan__stage">First</div>
                <div className="plan__name">{noteTier.name}</div>
                <div className="plan__name-en">Weekly Note</div>
                <div className="plan__price">
                  <span className="plan__amount">{yen(ladder.notePrice)}</span>
                  <small>/ 月{ladder.noteTaxIncluded ? "(税込)" : "(税抜)"}</small>
                </div>
                <div className="plan__tax">
                  {ladder.noteTaxIncluded
                    ? "初月無料"
                    : `税込 ${yen(withTax(ladder.notePrice))}・初月無料`}
                </div>
                <div className="plan__limit">週1回の読み物</div>
                <p className="plan__desc">{noteTier.body}</p>
                <a className="btn btn--ghost" href={urls.note}>
                  noteを読む
                </a>
              </div>

              {/* サロン(主役) */}
              <div className="plan plan--featured reveal">
                <span className="plan__tag">先着{pricing.earlyBirdSeats}名 先行価格</span>
                <div className="plan__stage">Second</div>
                <div className="plan__name">{salonTier.name}</div>
                <div className="plan__name-en">Stock Analysis Salon</div>
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
                </ul>
                <a className="btn btn--primary" href={urls.apply} id="cta-pricing">
                  {copy.pricing.cta}
                </a>
              </div>

              {/* IRアルファデータベース */}
              <div className="plan reveal">
                <div className="plan__stage">Third</div>
                <div className="plan__name">IRアルファデータベース</div>
                <div className="plan__name-en">IR Alpha Database — in development</div>
                <div className="plan__price">
                  <span className="plan__amount">{yen(ladder.irAlphaPrice)}</span>
                  <small>/ 月(税抜・予定)</small>
                </div>
                <div className="plan__tax">
                  税込 {yen(withTax(ladder.irAlphaPrice))} 予定・開発中
                </div>
                <div className="plan__limit">毎月1回の個別面談つき</div>
                <p className="plan__desc">{irTier.body}</p>
                <span className="btn btn--static">サロン生に先行案内</span>
              </div>
            </div>
            <div className="pricing-note reveal">
              <p>※ {copy.pricing.notes[1]}</p>
              <p>※ {copy.pricing.notes[2]}</p>
            </div>
          </div>
        </section>

        {/* Flow — 参加までの流れ */}
        <section className="section section--alt" id="flow">
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
        <section className="section" id="faq">
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
        <section className="final" id="join">
          <div className="reveal">
            <h2 className="final__title">
              {finalFirst}
              <br />
              <Gold text={finalSecond} keyword="まず負けない" breakAfter="、" />
            </h2>
            <p className="final__sub">
              <Sentences text={copy.hero.priceLine} />
              <br />
              {copy.offer.items[4].body}
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
                {copy.footer.operatorLabel}：{operator.legalName}
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
          <div className="copyright">© 2026 SENRITSU Inc. All rights reserved.</div>
        </div>
      </footer>

      <script data-ks="1" dangerouslySetInnerHTML={{ __html: KS_SCRIPT }} />
    </div>
  );
}
