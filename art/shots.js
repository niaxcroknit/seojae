const { chromium } = require('playwright');
const path = require('path');
const seg = (t, h) => ({ t, h: !!h });
const books = [
  { id: 'b1', title: '소년이 온다', author: '한강', publisher: '창비', status: 'reading', pages: 216, current: 128, color: '#7A3B3B', rating: 0, oneLine: '', essay: [], createdAt: '2026-10-20', startedAt: '2026-10-12',
    pageNotes: [
      { id: 'n1', page: 52, segs: [seg('읽다가 몇 번이나 책을 덮었다. '), seg('기억하는 사람이 있어야 끝나지 않는다', true), seg('는 문장이 계속 남는다.')] },
      { id: 'n2', page: 97, segs: [seg('동호의 시점이 바뀌는 장. '), seg('“너는 왜 거기 있었니”', true), seg(' 이 질문이 나한테도 오는 것 같았다.')] },
      { id: 'n3', page: 121, segs: [seg('여기서 잠깐 쉬었다. 내일 이어서.')] } ] },
  { id: 'b2', title: '모순', author: '양귀자', publisher: '쓰다', status: 'reading', pages: 316, current: 74, color: '#3B4F7A', rating: 0, oneLine: '', essay: [], pageNotes: [], createdAt: '2026-10-15' },
  { id: 'b3', title: '작별하지 않는다', author: '한강', publisher: '문학동네', status: 'done', pages: 332, current: 332, color: '#4F6B70', rating: 5, oneLine: '기억하는 일의 무게를 끝까지 붙든 소설', finishedAt: '2026-08-21', createdAt: '2026-07-30',
    essay: [seg('눈이 내리는 장면마다 숨이 느려졌다. 처음엔 꿈 같은 이야기라고 생각했는데, 읽을수록 '), seg('잊지 않겠다는 마음이 얼마나 많은 걸 견뎌야 하는지', true), seg('를 알게 됐다.\n\n인선과 경하가 서로를 붙잡는 방식이 오래 남는다. '), seg('작별하지 않는다는 건 끝내 놓지 않는다는 뜻', true), seg('이었구나.')],
    pageNotes: [
      { id: 'n4', page: 41, segs: [seg('첫 장부터 '), seg('눈송이가 내려앉는 소리까지 들리는 문장', true), seg('.')] },
      { id: 'n5', page: 188, segs: [seg('새가 나오는 장면. '), seg('작은 생명 하나를 지키려는 마음', true), seg('이 이 책 전체 같다.')] },
      { id: 'n6', page: 263, segs: [seg('여기서 한참 멈췄다. '), seg('살아남은 사람이 짊어지는 것', true), seg('에 대해.')] },
      { id: 'n7', page: 311, segs: [seg('마지막 장면은 '), seg('촛불 하나로 끝까지 버티는 밤', true), seg('이었다.')] } ] },
  { id: 'b4', title: '채식주의자', author: '한강', publisher: '창비', status: 'done', pages: 247, current: 247, color: '#2F4A3F', rating: 4, oneLine: '세 사람의 시선으로 본 한 사람의 침묵', finishedAt: '2026-10-02', createdAt: '2026-09-18', essay: [], pageNotes: [] },
  { id: 'b5', title: '불편한 편의점', author: '김호연', publisher: '나무옆의자', status: 'done', pages: 268, current: 268, color: '#8A6D2E', rating: 4, oneLine: '편의점 불빛처럼 은근하게 따뜻한 이야기', finishedAt: '2026-05-02', createdAt: '2026-04-20', essay: [], pageNotes: [] },
  { id: 'b6', title: '아몬드', author: '손원평', publisher: '창비', status: 'done', pages: 264, current: 264, color: '#5B4B6E', rating: 4, oneLine: '감정을 배우는 과정이 담담해서 더 아팠다', finishedAt: '2026-03-14', createdAt: '2026-03-01', essay: [], pageNotes: [] },
  { id: 'b7', title: '달러구트 꿈 백화점', author: '이미예', publisher: '팩토리나인', status: 'done', pages: 300, current: 300, color: '#3B4F7A', rating: 3, oneLine: '잠들기 전에 가볍게 읽기 좋은 꿈 이야기', finishedAt: '2026-01-20', createdAt: '2026-01-05', essay: [], pageNotes: [] },
  { id: 'b8', title: '이처럼 사소한 것들', author: '클레어 키건', publisher: '다산책방', status: 'unread', pages: 132, current: 0, color: '#8A6D2E', rating: 0, oneLine: '', essay: [], pageNotes: [], createdAt: '2026-10-18' },
  { id: 'b9', title: '물고기는 존재하지 않는다', author: '룰루 밀러', publisher: '곰출판', status: 'unread', pages: 300, current: 0, color: '#4F6B70', rating: 0, oneLine: '', essay: [], pageNotes: [], createdAt: '2026-10-10' },
];
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, colorScheme: 'light' });
  await ctx.addInitScript((data) => {
    localStorage.setItem('reading-log-books', JSON.stringify(data));
    const stub = { readFile: () => Promise.reject(new Error('none')), writeFile: () => Promise.resolve({ uri: '' }), share: () => Promise.resolve(), addListener: () => Promise.resolve({ remove() {} }), exitApp() {} };
    window.Capacitor = { isNativePlatform: () => true, registerPlugin: () => stub };
  }, books);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('www/index.html')); await p.waitForTimeout(1200);
  const out = n => `store/screenshot-${n}.png`;
  await p.screenshot({ path: out(1) });
  await p.click('.item[data-id="b1"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: out(2) });
  await p.click('#backBtn'); await p.waitForTimeout(300);
  await p.click('.item[data-id="b3"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { document.getElementById('detail').scrollTop = 0; }); await p.waitForTimeout(200);
  await p.screenshot({ path: out(3) });
  await p.click('#dTabs [data-t="hl"]'); await p.waitForTimeout(200);
  await p.evaluate(() => { const d = document.getElementById('detail'); const bar = document.querySelector('.d-bar').getBoundingClientRect().bottom; d.scrollTop += document.getElementById('dTabs').getBoundingClientRect().top - bar - 8; }); await p.waitForTimeout(200);
  await p.screenshot({ path: out(4) });
  await p.click('#backBtn'); await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(300);
  await p.screenshot({ path: out(5) });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
