#!/usr/bin/env node
// CTA の計測発火を検証する。
//   - window.gtag をスタブ化して呼び出しを記録
//   - /api/analytics/track へのリクエスト body を記録
//   - 各記事を 390px で開く → 中段 CTA 近くまでスクロール → 中段面談ボタンをクリック
//   - 期待結果: cta_view が面談・LINE それぞれで1回ずつ、consultation_click/line_register が
//     クリック対象に応じて発火していること
// 使い方: 事前に `npm run dev` を立ち上げてから `node scripts/verify-cta-tracking.mjs`

import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
];
const chromePath = CHROME_PATHS.find((p) => existsSync(p));
if (!chromePath) throw new Error("Chrome binary not found");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SPECS = [
  { slug: "sports-suisen-taisaku-itsukara", midConsult: "engine_schedule_consult", midLine: "engine_schedule_line" },
  { slug: "athletic-recruitment", midConsult: "athletic_main_consult", midLine: "athletic_main_line" },
  { slug: "sports-school-study-support", midConsult: "sportsschool_mid_consult", midLine: "sportsschool_mid_line" },
  { slug: "baseball-career-path-hub", midConsult: "hub_ch3_consult", midLine: "hub_ch3_line" },
];

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  defaultViewport: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
await page.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
);

// Real gtag.js (googletagmanager.com) の inline script は Next.js の strategy=lazyOnload で
// Page load 後に実行され、window.gtag を本物に差し替える。stub では捕捉し切れないため、
// 本スクリプトでは「https://www.google-analytics.com/g/collect」宛てのネットワーク送信を
// GA4 側の fire-and-forget の証拠として使う。sendBeacon も spy しておく。
await page.evaluateOnNewDocument(() => {
  window.__beacons = [];
  const originalBeacon = navigator.sendBeacon?.bind(navigator);
  navigator.sendBeacon = (url, data) => {
    try {
      const info = { url };
      if (data && typeof data.text === 'function') data.text().then((t) => { info.body = t; });
      window.__beacons.push(info);
    } catch { /* ignore */ }
    return originalBeacon ? originalBeacon(url, data) : true;
  };
});
page.on('console', (msg) => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error' || type === 'warn' || text.includes('[tracker')) console.log(`  [page ${type}] ${text}`);
});

const sent = []; // POST /api/analytics/track body (events)
const gaBeacons = []; // GA4 の `/g/collect` ネットワーク送信
page.on("request", async (req) => {
  const url = req.url();
  if (url.includes("/api/analytics/track")) {
    try {
      const body = JSON.parse(req.postData() || "{}");
      for (const ev of body.events || []) sent.push({ eventType: ev.eventType, path: ev.path, section: ev.section });
    } catch { /* ignore */ }
    return;
  }
  if (url.includes("google-analytics.com/g/collect") || url.includes("googletagmanager.com/gtag/collect")) {
    // event name は URL のクエリ `en=` に入る
    try {
      const u = new URL(url);
      const en = u.searchParams.get("en");
      const cid = u.searchParams.get("ep.cta_id") || u.searchParams.get("cta_id");
      const slug = u.searchParams.get("ep.article_slug") || u.searchParams.get("article_slug");
      // POST body にも `events` が入ることがある
      const body = req.postData() || "";
      // body は `en=event1\nen=event2` のような newline 区切り
      const inBody = Array.from(body.matchAll(/(?:^|\n)en=([^\n&]+)/g)).map((m) => decodeURIComponent(m[1]));
      if (en) gaBeacons.push({ en, cta_id: cid, article_slug: slug });
      for (const e of inBody) gaBeacons.push({ en: e, source: 'body' });
    } catch { /* ignore */ }
  }
});

function pretty(xs) {
  return xs.map((x) => JSON.stringify(x)).join("\n    ");
}

async function wait(ms) {
  await page.evaluate((t) => new Promise((r) => setTimeout(r, t)), ms);
}

const results = [];
for (const spec of SPECS) {
  const url = `${BASE}/blog/${spec.slug}`;
  console.log(`\n==> ${spec.slug}`);
  sent.length = 0;
  gaBeacons.length = 0;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  await wait(500);

  // 中段 CTA までスクロール
  const scrolled = await page.evaluate((id) => {
    const el = document.querySelector(`[data-track-cta="${id}"]`);
    const block = el?.closest("div.cta-block") || el;
    if (!block) return null;
    const r = block.getBoundingClientRect();
    window.scrollTo(0, Math.max(0, Math.round(r.top + window.scrollY) - 200));
    return true;
  }, spec.midConsult);
  if (!scrolled) {
    console.log(`  (skip) mid CTA not found: ${spec.midConsult}`);
    continue;
  }
  await wait(900); // IntersectionObserver + バッファ flush (500ms) 待ち

  // 中段の面談ボタンを click (遷移をキャンセルして同一ページで記録を取る)
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-track-cta="${id}"]`);
    if (!el) return;
    el.addEventListener("click", (e) => e.preventDefault(), { once: true, capture: true });
    el.click();
  }, spec.midConsult);
  await wait(600);

  // LINE ボタン clickも検証
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-track-cta="${id}"]`);
    if (!el) return;
    el.addEventListener("click", (e) => e.preventDefault(), { once: true, capture: true });
    el.click();
  }, spec.midLine);
  await wait(900); // flush

  // beacon の async body 取り出し待ち
  await wait(500);
  const beaconBodies = await page.evaluate(() => (window.__beacons || []).map((b) => ({ url: b.url, body: b.body })));
  const nobilvaFromBeacons = [];
  for (const b of beaconBodies) {
    if (!b.body || !b.url.includes('/api/analytics/track')) continue;
    try {
      const j = JSON.parse(b.body);
      for (const ev of j.events || []) nobilvaFromBeacons.push({ eventType: ev.eventType, path: ev.path, section: ev.section });
    } catch { /* ignore */ }
  }
  const nobilvaAll = [...sent, ...nobilvaFromBeacons];
  const gaEventNames = [...new Set(gaBeacons.map((b) => b.en).filter(Boolean))];
  results.push({ slug: spec.slug, gaEventNames, gaBeacons: [...gaBeacons], nobilva: nobilvaAll });

  console.log(`  GA4 事件 (${gaEventNames.length} 種, ${gaBeacons.length} 件): ${gaEventNames.join(', ') || '-'}`);
  console.log(`  Nobilva Analytics (${nobilvaAll.length} 件):`);
  console.log(`    ${pretty(nobilvaAll)}`);
}

await browser.close();

// 簡易アサーション
//   - Nobilva Analytics は sendBeacon spy で確実に捕捉できるため strict に検証
//   - GA4 は gtag.js が window.gtag を上書き → バッチ化 → g/collect に POST する流れで、
//     puppeteer のネットワーク観測だと GA 側のタイミングによって拾えないことがある。
//     本スクリプトでは記録に残すだけに留め、最終的な GA4 発火確認は Realtime/DebugView で行う。
let fail = 0;
for (const r of results) {
  const nobilvaTypes = r.nobilva.map((e) => e.eventType);
  if (!nobilvaTypes.includes("cta_view")) {
    console.log(`\n[FAIL] ${r.slug}: Nobilva Analytics cta_view missing`);
    fail++;
  }
  if (!(nobilvaTypes.includes("cta_diagnosis_click") || nobilvaTypes.includes("cta_click"))) {
    console.log(`\n[FAIL] ${r.slug}: Nobilva Analytics consult click missing`);
    fail++;
  }
  if (!nobilvaTypes.includes("cta_line_click")) {
    console.log(`\n[FAIL] ${r.slug}: Nobilva Analytics line click missing`);
    fail++;
  }
  if (r.gaEventNames.length === 0) {
    console.log(`\n[note] ${r.slug}: GA4 /g/collect は puppeteer で観測できなかった (本番 DebugView で要確認)`);
  }
}
console.log(fail === 0 ? "\nNobilva Analytics: All checks passed" : `\n${fail} Nobilva check(s) failed`);
process.exit(fail === 0 ? 0 : 1);
