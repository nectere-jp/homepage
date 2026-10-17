#!/usr/bin/env node
// PC 幅 (1280x900) で LINE CTA 周辺とヘッダー (日付表示) をスクショ
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chromePath)) throw new Error("Chrome not found");

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const outDir = path.join(process.cwd(), "reports", "screenshots");
await mkdir(outDir, { recursive: true });

const SPECS = [
  { slug: "sports-suisen-taisaku-itsukara", lineId: "engine_schedule_line" },
];

for (const s of SPECS) {
  console.log(`==> ${s.slug}`);
  await page.goto(`http://localhost:3000/blog/${s.slug}`, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  // ヘッダー (日付) スクショ
  await page.screenshot({ path: path.join(outDir, `${s.slug}-pc-header.png`), type: "png", clip: { x: 0, y: 0, width: 1280, height: 500 } });
  // LINE CTA 周辺
  const bounds = await page.evaluate((id) => {
    const el = document.querySelector(`[data-track-cta="${id}"]`);
    const block = el?.closest("div.cta-block");
    if (!block) return null;
    const r = block.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  }, s.lineId);
  if (bounds) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, bounds.top - 80));
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    await page.screenshot({ path: path.join(outDir, `${s.slug}-pc-line.png`), type: "png" });
  }
  console.log("  done");
}

await browser.close();
