#!/usr/bin/env node
// 4記事それぞれで、ブログ記事のCTA周辺をスマホ幅 390x844 で撮影する。
// 使い方: node scripts/screenshot-cta.mjs (dev サーバを別ターミナルで起動しておく)
// 出力: reports/screenshots/<slug>-<label>.png

import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];
const chromePath = CHROME_PATHS.find((p) => existsSync(p));
if (!chromePath) throw new Error("Chrome binary not found");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "reports", "screenshots");

const ARTICLES = [
  { slug: "sports-suisen-taisaku-itsukara", hasSticky: true },
  { slug: "athletic-recruitment", hasSticky: false },
  { slug: "sports-school-study-support", hasSticky: true },
  { slug: "baseball-career-path-hub", hasSticky: false },
];

async function pageSetup(page) {
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  );
}

async function wait(page, ms) {
  await page.evaluate((t) => new Promise((r) => setTimeout(r, t)), ms);
}

async function captureAroundCta(page, ctaId, outPath) {
  const bounds = await page.evaluate((id) => {
    const el = document.querySelector(`[data-track-cta="${id}"]`);
    const block = el?.closest("div.cta-block") || el;
    if (!block) return null;
    const r = block.getBoundingClientRect();
    return {
      top: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
      vw: window.innerWidth,
    };
  }, ctaId);
  if (!bounds) {
    console.log(`  (skip) cta_id=${ctaId} not found`);
    return false;
  }
  // CTA の 100px 手前にスクロール（ヘッダーとの間に少し余白を取る）
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, bounds.top - 100));
  await wait(page, 350);
  await page.screenshot({ path: outPath, type: "png" });
  console.log(`  wrote ${path.basename(outPath)}`);
  return true;
}

async function captureFullPage(page, outPath) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(page, 300);
  await page.screenshot({ path: outPath, type: "png", fullPage: true });
  console.log(`  wrote ${path.basename(outPath)} (full)`);
}

async function captureSticky(page, outPath) {
  // 固定バーが出る条件: 最初の H2 を通過
  await page.evaluate(() => {
    const h = document.querySelector(".prose h2");
    if (h) {
      const r = h.getBoundingClientRect();
      window.scrollTo(0, Math.round(r.top + window.scrollY + 500));
    }
  });
  await wait(page, 400);
  await page.screenshot({ path: outPath, type: "png" });
  console.log(`  wrote ${path.basename(outPath)} (sticky visible)`);
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    defaultViewport: null,
  });
  try {
    const page = await browser.newPage();
    await pageSetup(page);

    for (const a of ARTICLES) {
      console.log(`\n==> ${a.slug}`);
      await page.goto(`${BASE}/blog/${a.slug}`, { waitUntil: "networkidle0", timeout: 60_000 });
      await wait(page, 500);

      // 1. 中段 CTA 周辺 (面談ブロック)
      const midConsultIds = {
        "sports-suisen-taisaku-itsukara": "engine_schedule_consult",
        "athletic-recruitment": "athletic_main_consult",
        "sports-school-study-support": "sportsschool_mid_consult",
        "baseball-career-path-hub": "hub_ch3_consult",
      };
      const midId = midConsultIds[a.slug];
      if (midId) {
        await captureAroundCta(page, midId, path.join(OUT_DIR, `${a.slug}-mid.png`));
      }

      // 2. 末尾 CTA 周辺
      const endConsultIds = {
        "sports-suisen-taisaku-itsukara": "engine_end_consult",
        "athletic-recruitment": "athletic_end_consult",
        "sports-school-study-support": "sportsschool_end_consult",
        "baseball-career-path-hub": "hub_end_consult",
      };
      const endId = endConsultIds[a.slug];
      if (endId) {
        await captureAroundCta(page, endId, path.join(OUT_DIR, `${a.slug}-end.png`));
      }

      // 3. 固定バーが出る位置での viewport
      if (a.hasSticky) {
        await captureSticky(page, path.join(OUT_DIR, `${a.slug}-sticky.png`));
      }
    }
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
