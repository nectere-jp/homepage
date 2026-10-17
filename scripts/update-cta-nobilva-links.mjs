#!/usr/bin/env node
// 全ブログ記事の :::cta-nobilva ブロックを一括更新する。
//   - link を /ja/services/nobilva/diagnosis に差し替え (LP 直行 → 予約フォーム直行)
//   - button を「無料学習面談を予約する」で始まる形に揃える (「受ける」→「予約する」)
//   - id が未指定なら <slug_underscores>_end_consult を追加
// 既に diagnosis を向いているブロック (Phase 2 で手動更新した engine/athletic/sports-school/hub の
// cta_id 付きブロック) は touch しない。

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/** slug (file basename without .md) を id プレフィックスに変換 */
function slugToIdPrefix(slug) {
  return slug.replace(/-/g, "_");
}

function updateFileContent(slug, md) {
  // :::cta-nobilva ... ::: ブロックを探す (末尾改行は EOF でもよい)
  const re = /:::cta-nobilva\n([\s\S]*?)\n:::(\n|$)/g;
  let changed = false;
  const newMd = md.replace(re, (match, body, tail) => {
    // 既に /diagnosis 向きならスキップ
    if (/\blink:\s*\/ja\/services\/nobilva\/diagnosis\b/.test(body)) return match;

    const lines = body.split("\n");
    let hasId = false;
    const newLines = lines.map((line) => {
      if (/^id:/.test(line)) {
        hasId = true;
        return line;
      }
      if (/^link:\s*(\/services\/nobilva|\/ja\/services\/nobilva)\s*$/.test(line)) {
        return "link: /ja/services/nobilva/diagnosis";
      }
      if (/^button:\s*無料学習面談を受ける/.test(line)) {
        return line.replace(/^button:\s*無料学習面談を受ける/, "button: 無料学習面談を予約する");
      }
      return line;
    });
    if (!hasId) {
      const id = `${slugToIdPrefix(slug)}_end_consult`;
      newLines.unshift(`id: ${id}`);
    }
    changed = true;
    return `:::cta-nobilva\n${newLines.join("\n")}\n:::${tail}`;
  });
  return { md: newMd, changed };
}

async function main() {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));
  let updated = 0;
  const details = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(BLOG_DIR, file);
    const md = await readFile(filePath, "utf8");
    const { md: newMd, changed } = updateFileContent(slug, md);
    if (changed) {
      await writeFile(filePath, newMd, "utf8");
      updated++;
      details.push(slug);
    }
  }
  console.log(`Updated ${updated} / ${files.length} files`);
  for (const s of details) console.log(`  ${s}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
