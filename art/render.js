const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const motif = require('./motif');
const GREEN = '#2F4A3F', DARK = '#141615';
const fontCss = ['gowun-batang/700.css','ibm-plex-sans-kr/400.css','ibm-plex-sans-kr/500.css'].map(f => `<link rel="stylesheet" href="file://${path.resolve('www/fonts/'+f)}">`).join('');
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const jobs = [
  // full icon with background (Play Store 512 + capacitor icon-only)
  ['assets/icon-only.png', 1024, 1024, svg(1024,1024, `<rect width="1024" height="1024" fill="${GREEN}"/><g transform="translate(512 512) scale(1.32) translate(-512 -524)">${motif()}</g>`)],
  // adaptive foreground: motif shrunk into the safe zone, transparent background
  ['assets/icon-foreground.png', 1024, 1024, svg(1024,1024, `<g transform="translate(512 512) scale(1.3) translate(-512 -524)">${motif()}</g>`)],
  ['assets/icon-background.png', 1024, 1024, svg(1024,1024, `<rect width="1024" height="1024" fill="${GREEN}"/>`)],
  ['assets/splash.png', 2732, 2732, svg(2732,2732, `<rect width="2732" height="2732" fill="${GREEN}"/><g transform="translate(1366 1380) scale(.9) translate(-512 -524)">${motif()}</g>`)],
  ['assets/splash-dark.png', 2732, 2732, svg(2732,2732, `<rect width="2732" height="2732" fill="${DARK}"/><g transform="translate(1366 1380) scale(.9) translate(-512 -524)">${motif({band: DARK})}</g>`)],
];
const feature = `<!doctype html><html><head><meta charset="utf-8">${fontCss}<style>
html,body{margin:0;width:1024px;height:500px;overflow:hidden;background:${GREEN}}
.wrap{position:relative;width:1024px;height:500px;display:flex;align-items:center}
.txt{position:relative;z-index:1;padding-left:72px;display:flex;flex-direction:column;gap:18px}
h1{margin:0;font-family:'Gowun Batang',serif;font-weight:700;font-size:104px;color:#EEF0EC;letter-spacing:0;line-height:1}
p{margin:0;font-family:'IBM Plex Sans KR',sans-serif;font-size:30px;color:#CFE0D7;line-height:1.45}
mark{background:#F3E37C;color:#1C1F1E;padding:0 6px;border-radius:3px}
svg{position:absolute;right:20px;top:-6px}
</style></head><body><div class="wrap"><div class="txt"><h1>서재한켠</h1><p>가진 책, 읽은 책,<br><mark>마음에 남은 문장</mark>까지</p></div>
${svg(512,512,`<g transform="scale(.5)">${motif()}</g>`)}</div></body></html>`;
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const [out, w, h, s] of jobs) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
  }
  const p = await b.newPage({ viewport: { width: 1024, height: 500 } });
  fs.writeFileSync('art/feature.html', feature);
  await p.goto('file://' + path.resolve('art/feature.html')); await p.waitForTimeout(800);
  await p.screenshot({ path: 'store/feature-graphic-1024x500.png', type: 'png' });
  const q = await b.newPage({ viewport: { width: 512, height: 512 } });
  await q.setContent(`<html><body style="margin:0">${svg(512,512,`<g transform="scale(.5)"><rect width="1024" height="1024" fill="${GREEN}"/><g transform="translate(512 512) scale(1.32) translate(-512 -524)">${motif()}</g></g>`)}</body></html>`);
  await q.screenshot({ path: 'store/app-icon-512.png', clip: { x: 0, y: 0, width: 512, height: 512 } });
  await b.close();
})();
