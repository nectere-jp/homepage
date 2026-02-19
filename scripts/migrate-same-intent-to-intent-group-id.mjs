/**
 * sameIntentKeywords → intentGroupId マイグレーション（Node 単体実行用）
 * node scripts/migrate-same-intent-to-intent-group-id.mjs
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEYWORDS_FILE = path.join(__dirname, '..', 'content', 'keywords.json');
const BACKUP_SUFFIX = `.before-intent-group-id.${new Date().toISOString().slice(0, 10)}.json`;

function slugify(s) {
  return String(s)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '')
    .slice(0, 40);
}

function shortHash(s) {
  return createHash('sha256').update(s).digest('hex').slice(0, 8);
}

const raw = fs.readFileSync(KEYWORDS_FILE, 'utf8');
const db = JSON.parse(raw);
const targetKeywords = db.targetKeywords || {};

const groupMap = new Map();
for (const [keyword, entry] of Object.entries(targetKeywords)) {
  const list = entry.sameIntentKeywords;
  if (!list || list.length === 0) continue;
  const key = [...list].sort().join('\0');
  const existing = groupMap.get(key);
  const main = entry.mainKeywordInSameIntent ?? null;
  if (existing) {
    existing.keywordIds.push(keyword);
    if (main && !existing.mainKeyword) existing.mainKeyword = main;
  } else {
    groupMap.set(key, { keywordIds: [keyword], mainKeyword: main || null });
  }
}

const groupKeyToIntentGroupId = new Map();
for (const [groupKey, { keywordIds, mainKeyword }] of groupMap.entries()) {
  const base = mainKeyword || keywordIds[0] || 'group';
  const slug = slugify(base);
  const hash = shortHash(groupKey);
  groupKeyToIntentGroupId.set(groupKey, `${slug}-${hash}`);
}

let updated = 0;
for (const [keyword, entry] of Object.entries(targetKeywords)) {
  const list = entry.sameIntentKeywords;
  if (!list || list.length === 0) continue;
  const key = [...list].sort().join('\0');
  const intentGroupId = groupKeyToIntentGroupId.get(key);
  if (!intentGroupId) continue;
  entry.intentGroupId = intentGroupId;
  delete entry.sameIntentKeywords;
  updated++;
}

console.log(`${groupMap.size} グループ、${updated} キーワードを更新`);
fs.copyFileSync(KEYWORDS_FILE, KEYWORDS_FILE + BACKUP_SUFFIX);
fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ 完了');
