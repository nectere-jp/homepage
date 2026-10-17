#!/usr/bin/env node
// LINE CTA 単体を 800px 幅でキャプチャ (PC版の見た目確認用)
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chromePath)) throw new Error("Chrome not found");

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  defaultViewport: { width: 1280, height: 1200, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const outDir = path.join(process.cwd(), "reports", "screenshots");
await mkdir(outDir, { recursive: true });

await page.goto("http://localhost:3000/blog/sports-suisen-taisaku-itsukara", { waitUntil: "networkidle0", timeout: 60_000 });
await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

const el = await page.$('[data-track-cta="engine_schedule_line"]');
if (el) {
  const block = await el.evaluateHandle((e) => e.closest("div.cta-block"));
  if (block) {
    const bbox = await block.boundingBox();
    if (bbox) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, Math.round(bbox.y - 20)));
      await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
      const bbox2 = await block.boundingBox();
      if (bbox2) {
        await page.screenshot({
          path: path.join(outDir, "sports-suisen-pc-line-only.png"),
          clip: {
            x: Math.max(0, bbox2.x - 20),
            y: Math.max(0, bbox2.y - 10),
            width: Math.min(1280, bbox2.width + 40),
            height: bbox2.height + 20,
          },
        });
        console.log("wrote sports-suisen-pc-line-only.png", bbox2.width, "x", bbox2.height);
      }
    }
  }
}
await browser.close();
