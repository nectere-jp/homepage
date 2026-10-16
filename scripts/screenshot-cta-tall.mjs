#!/usr/bin/env node
// LINE 特典カード全体を1枚で見るための縦長スクショ（検証用）
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chromePath)) throw new Error("Chrome not found");

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  defaultViewport: { width: 390, height: 1800, isMobile: true, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1");

const outDir = path.join(process.cwd(), "reports", "screenshots");
await mkdir(outDir, { recursive: true });

const ARTICLES = [
  { slug: "sports-suisen-taisaku-itsukara", id: "engine_schedule_line" },
  { slug: "athletic-recruitment", id: "athletic_main_line" },
  { slug: "sports-school-study-support", id: "sportsschool_mid_line" },
  { slug: "baseball-career-path-hub", id: "hub_ch3_line" },
];

for (const a of ARTICLES) {
  console.log(`==> ${a.slug}`);
  await page.goto(`http://localhost:3000/blog/${a.slug}`, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  // LINE ブロック直前にスクロール
  const found = await page.evaluate((id) => {
    const el = document.querySelector(`[data-track-cta="${id}"]`);
    const block = el?.closest("div.cta-block");
    if (!block) return null;
    const r = block.getBoundingClientRect();
    window.scrollTo(0, Math.max(0, Math.round(r.top + window.scrollY) - 60));
    return true;
  }, a.id);
  if (!found) {
    console.log("  (skip, not found)");
    continue;
  }
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  await page.screenshot({ path: path.join(outDir, `${a.slug}-line-full.png`), type: "png" });
  console.log(`  wrote ${a.slug}-line-full.png`);
}

await browser.close();
