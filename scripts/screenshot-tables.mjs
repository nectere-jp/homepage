// 表を含む記事を 375px / 1280px で表撮影。
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chromePath)) throw new Error("Chrome not found");
const outDir = path.join(process.cwd(), "reports", "screenshots");
await mkdir(outDir, { recursive: true });

const BASE = "http://localhost:3000";
// 列数の多い表がある記事を対象 (関東4校の比較表、推薦スケジュール表、都県別対象学年表)
const SLUGS = ["athletic-recruitment", "sports-suisen-taisaku-itsukara", "baseball-career-path-hub"];
const VIEWPORTS = [
  { name: "sp375", width: 375, height: 844, isMobile: true, dpr: 2 },
  { name: "pc1280", width: 1280, height: 900, isMobile: false, dpr: 1 },
];

const browser = await puppeteer.launch({ executablePath: chromePath, headless: "new" });

for (const slug of SLUGS) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, deviceScaleFactor: vp.dpr });
    if (vp.isMobile) await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1");
    await page.goto(`${BASE}/blog/${slug}`, { waitUntil: "networkidle0", timeout: 60_000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    // 最初のテーブルwrapperまでスクロール
    const scrolled = await page.evaluate(() => {
      const el = document.querySelector(".blog-table-scroll");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      window.scrollTo(0, Math.max(0, Math.round(r.top + window.scrollY) - 60));
      return true;
    });
    if (!scrolled) { console.log(`${slug}/${vp.name}: no table`); await page.close(); continue; }
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    const file = path.join(outDir, `table-${slug}-${vp.name}.png`);
    await page.screenshot({ path: file, type: "png" });
    console.log(`wrote ${path.basename(file)}`);
    await page.close();
  }
}
await browser.close();
