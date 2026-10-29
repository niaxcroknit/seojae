// Runs www/index.html the way the Android app does: Capacitor globals + the real native-bridge.js + plugin JS,
// with a fake phone answering plugin calls. No registerPlugin is faked.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const bridge = fs.readFileSync(path.resolve('node_modules/@capacitor/android/capacitor/src/main/assets/native-bridge.js'), 'utf8');
const plugins = { App: ['exitApp', 'minimizeApp', 'getInfo'], Filesystem: ['readFile', 'writeFile', 'deleteFile'], Share: ['share', 'canShare'] };
let pluginJS = '';
const headers = [];
for (const [id, methods] of Object.entries(plugins)) {
  pluginJS += `(function(w){var a=(w.Capacitor=w.Capacitor||{});var p=(a.Plugins=a.Plugins||{});var t=(p['${id}']={});t.addListener=function(e,cb){return w.Capacitor.addListener('${id}',e,cb);};` +
    methods.map(m => `t['${m}']=function(_options){return w.Capacitor.nativePromise('${id}','${m}',_options);};`).join('') + `})(window);\n`;
  headers.push({ name: id, methods: methods.map(m => ({ name: m, rtype: 'promise' })).concat([{ name: 'addListener', rtype: 'callback' }, { name: 'removeListener', rtype: 'promise' }]) });
}
pluginJS += `window.Capacitor.PluginHeaders = ${JSON.stringify(headers)};`;
const fakePhone = `
window.__sent = []; window.__files = {}; window.__listeners = {};
window.androidBridge = { postMessage: function (s) {
  var m = JSON.parse(s); window.__sent.push(m.pluginId + '.' + m.methodName + (m.options && m.options.path ? ':' + m.options.path : '') + (m.options && m.options.eventName ? ':' + m.options.eventName : ''));
  setTimeout(function () {
    var reply = { callbackId: m.callbackId, pluginId: m.pluginId, methodName: m.methodName, success: true, data: {} };
    if (m.pluginId === 'Filesystem' && m.methodName === 'readFile') {
      var f = window.__files[m.options.path]; if (f == null) { reply.success = false; reply.error = { message: 'File does not exist' }; } else reply.data = { data: f };
    }
    if (m.pluginId === 'Filesystem' && m.methodName === 'writeFile') { window.__files[m.options.path] = m.options.data; reply.data = { uri: 'file:///data/' + m.options.path }; }
    if (m.methodName === 'addListener') { window.__listeners[m.options.eventName] = m.callbackId; reply.save = true; }
    if (m.methodName.indexOf('Listener') < 0) window.Capacitor.fromNative(reply); // Android keeps addListener calls open without replying
  }, 5);
} };
window.__pressBack = function () { var id = window.__listeners.backButton; window.Capacitor.fromNative({ callbackId: id, pluginId: 'App', methodName: 'addListener', success: true, save: true, data: { canGoBack: false } }); };
`;
const init = fakePhone + 'window.Capacitor = { DEBUG: false, isLoggingEnabled: false, Plugins: {} };\n' + bridge + '\n' + pluginJS;
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 360, height: 700 } });
  await ctx.addInitScript({ content: init });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto('file://' + path.resolve('www/index.html')); await p.waitForTimeout(1500);
  const r = {};
  r.platform = await p.evaluate(() => window.Capacitor.getPlatform && window.Capacitor.getPlatform());
  r.hasRegisterPlugin = await p.evaluate(() => typeof window.Capacitor.registerPlugin);
  r.nativeClass = await p.evaluate(() => document.documentElement.classList.contains('native'));
  // open a sample book, then phone back button
  await p.click('.item'); await p.waitForTimeout(300);
  r.detailOpened = await p.evaluate(() => !document.getElementById('detail').hidden);
  await p.evaluate(() => window.__pressBack()); await p.waitForTimeout(300);
  r.backClosedDetail = await p.evaluate(() => document.getElementById('detail').hidden);
  // add a real book
  await p.click('#addBtn'); await p.fill('#a-title', '시험 책'); await p.fill('#a-pages', '200'); await p.click('#addSave'); await p.waitForTimeout(400);
  r.newBookOpened = await p.evaluate(() => document.getElementById('dTitle') && document.getElementById('dTitle').textContent);
  await p.click('#startBtn'); await p.waitForTimeout(1200);
  await p.evaluate(() => window.__pressBack()); await p.waitForTimeout(300);
  await p.click('[data-step="10"]'); await p.waitForTimeout(1200);
  r.backupWritten = await p.evaluate(() => { try { return JSON.parse(window.__files['books.json'] || '[]').map(b => b.title + ':' + b.status + ':' + b.current); } catch (e) { return 'bad'; } });
  // back with nothing open → exitApp
  await p.evaluate(() => window.__pressBack()); await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 99999)); await p.click('#exportBtn'); await p.waitForTimeout(500);
  r.exportMsg = await p.evaluate(() => document.getElementById('exportMsg').textContent);
  r.calls = await p.evaluate(() => window.__sent);
  r.errors = errs;
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
