/**
 * 法務文書に事業者情報が直書きされていないか、TODO 等の仮の文字列が残っていないか検査する。
 *
 * 本文は公開ページとして配信されるため、確認待ちの印や仮の文字を一切含んではならない。
 *
 * - 事業者情報（住所・電話・メール・代表者名）が .md に直書きされていたら exit 1
 * - TODO が本文に 1 件でもあれば exit 1
 *
 * 検査対象は content/legal/ 配下の .md。
 * 事業者情報を参照する場合は {{business.*}} 差し込みか :::business-info / :::contact-info ブロックを使う。
 * 作業上の覚えは docs/legal-changes-YYYYMMDD.md に書く。
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const LEGAL_DIR = path.join(ROOT, "content", "legal");

/** 事業者情報と見做す直書きパターン。business.ts の値から派生させている。 */
const FORBIDDEN_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "電話番号 03-6820-9037", regex: /03[-(]?6820[-)]?9037/ },
  { name: "メアド @nectere.jp", regex: /\b[a-zA-Z0-9._%+-]+@nectere\.jp\b/ },
  { name: "住所「太子堂」", regex: /太子堂/ },
  { name: "郵便番号 154-0004", regex: /154[-\s]?0004/ },
  { name: "代表者「養田貴大」", regex: /養田貴大/ },
  { name: "番地「マガザン三軒茶屋」", regex: /マガザン三軒茶屋/ },
];

const TODO_PATTERN = /TODO/g;

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await walk(LEGAL_DIR);
  let directWriteCount = 0;
  let todoCount = 0;

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    const rel = path.relative(ROOT, file);

    const lines = content.split("\n");
    for (const { name, regex } of FORBIDDEN_PATTERNS) {
      lines.forEach((line, i) => {
        if (regex.test(line)) {
          console.error(`✗ ${rel}:${i + 1}  [${name}] の直書きが検出されました: ${line.trim()}`);
          directWriteCount++;
        }
      });
    }

    lines.forEach((line, i) => {
      if (TODO_PATTERN.test(line)) {
        console.error(`✗ ${rel}:${i + 1}  本文に TODO が残っています: ${line.trim()}`);
        todoCount++;
      }
      TODO_PATTERN.lastIndex = 0;
    });
  }

  if (directWriteCount > 0 || todoCount > 0) {
    if (directWriteCount > 0) {
      console.error(`\n✗ 事業者情報の直書きが ${directWriteCount} 件検出されました。{{business.*}} 差し込みか :::business-info / :::contact-info ブロックを使ってください。`);
    }
    if (todoCount > 0) {
      console.error(`\n✗ 本文に TODO が ${todoCount} 件残っています。公開前に確定事実で埋めるか、作業ログ docs/legal-changes-*.md に移してください。`);
    }
    process.exit(1);
  }

  console.log(`✓ ${files.length} 件の法務文書を検査、事業者情報の直書き・本文 TODO ともになし`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
