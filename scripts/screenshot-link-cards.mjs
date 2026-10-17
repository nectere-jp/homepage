// 375px (スマホ) と 1280px (PC) でブログ内部リンクカードが並ぶ記事を開いて撮影する。
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chromePath)) throw new Error("Chrome not found");
const outDir = path.join(process.cwd(), "reports", "screenshots");
await mkdir(outDir, { recursive: true });

const BASE = "http://localhost:3000";
// 多めにカードが並ぶハブ記事を対象に
const SLUG = "baseball-career-path-hub";
const VIEWPORTS = [
  { name: "sp375", width: 375, height: 844, isMobile: true, dpr: 2 },
  { name: "sp390", width: 390, height: 844, isMobile: true, dpr: 2 },
  { name: "tab768", width: 768, height: 900, isMobile: false, dpr: 1 },
  { name: "pc1280", width: 1280, height: 900, isMobile: false, dpr: 1 },
];

const browser = await puppeteer.launch({ executablePath: chromePath, headless: "new" });
for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, deviceScaleFactor: vp.dpr });
  if (vp.isMobile) {
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1");
  }
  await page.goto(`${BASE}/blog/${SLUG}`, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  // 最初の内部リンクカード近傍にスクロール
  const found = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("a")).find((a) => /\/blog\//.test(a.getAttribute("href") || "") && a.querySelector("img"));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    window.scrollTo(0, Math.max(0, Math.round(r.top + window.scrollY) - 80));
    return true;
  });
  if (!found) {
    console.log(`${vp.name}: no card found`);
    continue;
  }
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
  const file = path.join(outDir, `linkcard-${SLUG}-${vp.name}.png`);
  await page.screenshot({ path: file, type: "png" });
  console.log(`wrote ${path.basename(file)}`);
  await page.close();
}
await browser.close();
