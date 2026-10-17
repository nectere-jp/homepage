#!/usr/bin/env node
// スマホ幅 390px で各ブログ記事をレンダリングし、CTA の縦位置を計測する。
// 使い方:
//   1. 別ターミナルで `npm run dev` を起動（http://localhost:3000）
//   2. node scripts/measure-cta-positions.mjs
// 出力: reports/cta-position-<YYYY-MM>.md

import { mkdir, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import path from "node:path";

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];
const chromePath = CHROME_PATHS.find((p) => existsSync(p));
if (!chromePath) {
  console.error("Chrome binary not found. 試したパス:", CHROME_PATHS);
  process.exit(1);
}

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ARTICLES = [
  { slug: "sports-suisen-taisaku-itsukara", label: "エンジン" },
  { slug: "athletic-recruitment", label: "athletic-recruitment" },
  { slug: "sports-school-study-support", label: "sports-school-study-support" },
  { slug: "baseball-career-path-hub", label: "baseball-career-path-hub" },
];

// 日本語ラベル用
function describeCta(className, trackCta, href) {
  if (className.includes("cta-block-nobilva")) return "面談ブロック（cta-nobilva）";
  if (className.includes("cta-block-line")) return "LINE ブロック（cta-line）";
  if (className.includes("cta-block-kindle")) return "Kindle 本紹介";
  if (trackCta) return `data-track-cta="${trackCta}"${href ? ` → ${href}` : ""}`;
  return "unknown";
}

async function measure(page, url) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  // 画像のレイアウトが安定するまで追加で待つ
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
  return await page.evaluate(() => {
    const docH = document.documentElement.scrollHeight;
    // CTA ブロック（div.cta-block）と、ブロック配下に含まれない独立した data-track-cta を対象にする
    const blockEls = Array.from(document.querySelectorAll("div.cta-block"));
    const standaloneLinks = Array.from(
      document.querySelectorAll("a[data-track-cta]"),
    ).filter((a) => !a.closest("div.cta-block"));
    const all = [...blockEls, ...standaloneLinks];
    return {
      docHeight: docH,
      items: all.map((el) => {
        const rect = el.getBoundingClientRect();
        const topFromDoc = Math.round(rect.top + window.scrollY);
        const className = (el.className && typeof el.className === "string") ? el.className : "";
        const trackCta = el.getAttribute?.("data-track-cta") || "";
        const anchor = el.tagName === "A" ? el : el.querySelector("a[data-track-cta]");
        const href = anchor?.getAttribute("href") || "";
        const linkTrack = anchor?.getAttribute("data-track-cta") || trackCta || "";
        const tag = el.tagName.toLowerCase();
        return {
          tag,
          className,
          trackCta: linkTrack,
          href,
          topFromDoc,
          topPct: Math.round((topFromDoc / docH) * 1000) / 10,
          text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
        };
      }),
    };
  });
}

async function run() {
  console.log(`Launching Chrome: ${chromePath}`);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    defaultViewport: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 },
  });

  try {
    const results = [];
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );

    for (const a of ARTICLES) {
      const url = `${BASE}/blog/${a.slug}`;
      console.log(`\n==> ${a.slug}`);
      try {
        const data = await measure(page, url);
        console.log(`  docHeight=${data.docHeight}px, CTAs=${data.items.length}`);
        results.push({ ...a, url, ...data });
      } catch (e) {
        console.error(`  失敗:`, e.message);
        results.push({ ...a, url, error: e.message, docHeight: 0, items: [] });
      }
    }

    // Markdown レポートを生成
    const today = new Date().toISOString().slice(0, 10);
    const yyyyMm = today.slice(0, 7);
    const lines = [];
    lines.push(`# CTA 位置の実測 (${today})`);
    lines.push("");
    lines.push(`- 計測条件: スマホ幅 390px / Safari iOS UA / \`npm run dev\` (${BASE})`);
    lines.push("- `top%` = 要素の上端（document 全体の高さに対する割合）");
    lines.push("- `div.cta-block` と、ブロック外で `[data-track-cta]` が付いた `<a>` を抽出");
    lines.push("");
    for (const r of results) {
      lines.push(`## ${r.slug} (${r.label})`);
      lines.push("");
      if (r.error) {
        lines.push(`- **計測失敗**: ${r.error}`);
        lines.push("");
        continue;
      }
      lines.push(`- URL: ${r.url}`);
      lines.push(`- ドキュメント全体の高さ: **${r.docHeight}px**`);
      lines.push("");
      if (r.items.length === 0) {
        lines.push("- (CTA 要素が見つからなかった)");
        lines.push("");
        continue;
      }
      lines.push("| # | 種別 | top% | top(px) | track | 冒頭テキスト |");
      lines.push("|---|---|---|---|---|---|");
      r.items
        .sort((a, b) => a.topFromDoc - b.topFromDoc)
        .forEach((it, i) => {
          const kind = describeCta(it.className, it.trackCta, it.href);
          const text = it.text.replace(/\|/g, "\\|");
          lines.push(
            `| ${i + 1} | ${kind} | ${it.topPct}% | ${it.topFromDoc} | ${it.trackCta || "-"} | ${text} |`,
          );
        });
      lines.push("");
    }

    const outPath = path.join(process.cwd(), "reports", `cta-position-${yyyyMm}.md`);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, lines.join("\n"), "utf8");
    console.log(`\nWrote ${outPath}`);
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
