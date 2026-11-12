// 株分析サロンLPのシェア画像(X などでリンクを貼ったときのカード)を作り直す。
//
//   node scripts/kabu-salon-og.mjs
//
// - 出力: public/kabu-salon/og/kabu-salon.png(今のLP)、kabu-salon-v2.png(新LP)。1200×630
// - Playwright はグローバルに入っているものを使う(このリポジトリの依存には入れていない)
// - 見出しを変えたら、下の CARDS も同じ文言に直して作り直し、
//   src/config/kabuSalon.ts の share.version を上げる(X が古い画像を覚えているため)
// - 文言が LP の見出しとずれていないかは tests/kabu-salon-share.test.ts が見ている
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "kabu-salon", "og");

/** gold は金にする語。X はカードの下端にタイトルを重ねるので、下 15% には文字を置かない */
export const CARDS = [
  {
    file: "kabu-salon.png",
    lines: ["タイちゃんの思考を、", "そのまま聞ける部屋。"],
    gold: "思考",
    sub: "株の分析とリサーチを、毎週Zoomでそのまま見せます。",
  },
  {
    file: "kabu-salon-v2.png",
    lines: ["バリュー株を、", "自分で見つけられる人へ。"],
    gold: "自分で",
    sub: "答えではなく、探し方を見せる。毎週、Zoomで配信。",
  },
];

const SALON_NAME = "タイちゃんの株分析サロン";

function html(card) {
  const lines = card.lines
    .map((line) => line.replace(card.gold, `<span class="gold">${card.gold}</span>`))
    .join("<br />");
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600&family=Zen+Kaku+Gothic+New:wght@300;400&display=swap" />
<style>
  html, body { margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #0b0d13; color: #ede6d6;
    font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 300;
    -webkit-font-smoothing: antialiased;
  }
  canvas { position: absolute; inset: 0; }
  .frame { position: absolute; inset: 26px; border: 1px solid rgba(201, 168, 106, 0.32); }
  .brand {
    position: absolute; left: 84px; top: 74px; display: flex; align-items: center; gap: 20px;
    font-family: "Shippori Mincho", serif; font-weight: 500; font-size: 30px; letter-spacing: 0.2em;
  }
  .mark { width: 16px; height: 16px; background: #c9a86a; transform: rotate(45deg); }
  .main { position: absolute; left: 84px; right: 84px; top: 176px; }
  h1 {
    margin: 0; font-family: "Shippori Mincho", serif; font-weight: 600;
    font-size: 78px; line-height: 1.5; letter-spacing: 0.06em;
  }
  .gold { color: #c9a86a; }
  .rule { width: 96px; height: 1px; background: #c9a86a; margin: 30px 0 24px; }
  .sub { font-size: 33px; letter-spacing: 0.08em; color: rgba(237, 230, 214, 0.72); }
</style>
</head>
<body>
<canvas id="c" width="1200" height="630"></canvas>
<div class="frame"></div>
<div class="brand"><span class="mark"></span>${SALON_NAME}</div>
<div class="main">
  <h1>${lines}</h1>
  <div class="rule"></div>
  <div class="sub">${card.sub}</div>
</div>
<script>
  // LPのヒーローと同じ点描(上場約3,800社のイメージ)。作り直しても同じ絵になるよう乱数は固定
  var seed = 20261112;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  var ctx = document.getElementById("c").getContext("2d");
  for (var i = 0; i < 3800; i++) {
    var a = rnd() * Math.PI * 2;
    var r = 330 * (0.35 + 0.65 * Math.sqrt(rnd()));
    var gold = rnd() < 0.03;
    var x = 880 + Math.cos(a) * r * 1.25;
    var y = 300 + Math.sin(a) * r * 0.9;
    ctx.beginPath();
    ctx.arc(x, y, gold ? 2 : 0.7 + rnd() * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = gold
      ? "rgba(201,168,106," + (0.3 + rnd() * 0.3).toFixed(3) + ")"
      : "rgba(237,230,214," + (0.04 + rnd() * 0.13).toFixed(3) + ")";
    ctx.fill();
  }
  // 文字の背面を少し沈めて読みやすくする
  var g = ctx.createLinearGradient(0, 0, 1200, 0);
  g.addColorStop(0, "rgba(11,13,19,0.92)");
  g.addColorStop(0.55, "rgba(11,13,19,0.55)");
  g.addColorStop(1, "rgba(11,13,19,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1200, 630);
</script>
</body>
</html>`;
}

async function main() {
  const globalRoot = execSync("npm root -g").toString().trim();
  const { chromium } = await import(path.join(globalRoot, "playwright", "index.mjs"));
  mkdirSync(OUT_DIR, { recursive: true });
  // プロキシ環境でも Google Fonts を読めるようにする(証明書の検証だけ緩める)
  const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] });
  for (const card of CARDS) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
      ignoreHTTPSErrors: true,
    });
    await page.setContent(html(card), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family)
    );
    if (!fonts.some((f) => f.includes("Shippori"))) {
      throw new Error("Shippori Mincho が読めていません(別の書体で描かれます)");
    }
    const out = path.join(OUT_DIR, card.file);
    await page.screenshot({ path: out, type: "png" });
    console.log("wrote", path.relative(ROOT, out));
    await page.close();
  }
  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
