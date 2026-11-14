import { Fragment } from "react";

/**
 * 株分析サロンのLPで使う小さな部品(見出しの金文字・改行・ナビと点描の演出)。
 * 3つ目のLP(./v3)が使う。本線(./page.tsx)と前のLP(./v1)は、同じ部品をそれぞれのファイルの中に
 * 持っている(先に作ったため)。直すときは3か所をそろえること。
 */

/** 実際に使う書体・ウェイトだけ要求する(明朝 400/500/600、ゴシック 300〜700、欧文は italic のみ) */
export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap";

export const ROMAN = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];

/** 文中の keyword を金にする。breakAfterKeyword なら、その直後でスマホだけ改行する */
export function Gold({
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
export function BreakAfter({
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
export function Sentences({ text }: { text: string }) {
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
export function Lines({ lines }: { lines: ReadonlyArray<string> }) {
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

export function Eyebrow({
  en,
  jp,
  center,
}: {
  en: string;
  jp: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "eyebrow eyebrow--center reveal" : "eyebrow reveal"}>
      <span className="eyebrow__en">{en}</span>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span className="eyebrow__jp">{jp}</span>
    </div>
  );
}

/**
 * ナビの scrolled / .reveal の出現 / ヒーロー背景の点描(前のLPと同じ演出)。
 * JSが動かない環境でも全て見えるよう、ルートに js クラスを付けてから演出を有効化する。
 */
export const KS_SCRIPT = [
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
