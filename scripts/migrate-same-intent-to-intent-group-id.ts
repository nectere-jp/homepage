/**
 * sameIntentKeywords を廃止し、各キーワードに intentGroupId を設定するマイグレーション
 *
 * - sameIntentKeywords の集合が同じキーワードを1グループとする
 * - 各グループに intentGroupId（slug + 短いハッシュ）を割り当て
 * - 各キーワードに intentGroupId を設定し、sameIntentKeywords を削除
 */
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');
const BACKUP_SUFFIX = `.before-intent-group-id.${new Date().toISOString().slice(0, 10)}.json`;

interface TargetKeywordEntry {
  priority: number;
  estimatedPv: number;
  relatedBusiness: string[];
  relatedTags: string[];
  currentRank: number | null;
  rankHistory: unknown[];
  status: string;
  assignedArticles: string[];
  createdAt: string;
  updatedAt: string;
  keywordTier?: string;
  expectedRank?: number | null;
  cvr?: number | null;
  workflowFlag?: string;
  pillarSlug?: string | null;
  sameIntentKeywords?: string[];
  mainKeywordInSameIntent?: string | null;
  [key: string]: unknown;
}

interface KeywordDatabase {
  version: string;
  targetKeywords: Record<string, TargetKeywordEntry>;
  usageTracking?: Record<string, unknown>;
  tagMaster?: Record<string, unknown>;
  metadata?: {
    version: string;
    lastUpdated: string;
    totalTargetKeywords: number;
    totalTags: number;
  };
}

function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '')
    .slice(0, 40);
}

function shortHash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 8);
}

async function migrate() {
  console.log('🔄 sameIntentKeywords → intentGroupId マイグレーションを開始します...');

  let db: KeywordDatabase;
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    db = JSON.parse(data);
  } catch (e) {
    console.error('keywords.json の読み込みに失敗しました:', e);
    process.exit(1);
  }

  // グループキー（sameIntentKeywords のソート済み join）→ キーワードID一覧 + mainKeyword
  const groupMap = new Map<
    string,
    { keywordIds: string[]; mainKeyword: string | null }
  >();

  for (const [keyword, entry] of Object.entries(db.targetKeywords)) {
    const list = entry.sameIntentKeywords;
    if (!list || list.length === 0) continue;
    const key = [...list].sort().join('\0');
    const existing = groupMap.get(key);
    const main = entry.mainKeywordInSameIntent ?? null;
    if (existing) {
      existing.keywordIds.push(keyword);
      if (main && !existing.mainKeyword) existing.mainKeyword = main;
    } else {
      groupMap.set(key, {
        keywordIds: [keyword],
        mainKeyword: main || null,
      });
    }
  }

  // 各グループに intentGroupId を割り当て（slug + 8文字ハッシュ）
  const groupKeyToIntentGroupId = new Map<string, string>();
  for (const [groupKey, { keywordIds, mainKeyword }] of groupMap.entries()) {
    const base = mainKeyword || keywordIds[0] || 'group';
    const slug = slugify(base);
    const hash = shortHash(groupKey);
    const intentGroupId = `${slug}-${hash}`;
    groupKeyToIntentGroupId.set(groupKey, intentGroupId);
  }

  let updated = 0;
  for (const [keyword, entry] of Object.entries(db.targetKeywords)) {
    const list = entry.sameIntentKeywords;
    if (!list || list.length === 0) continue;
    const key = [...list].sort().join('\0');
    const intentGroupId = groupKeyToIntentGroupId.get(key);
    if (!intentGroupId) continue;

    (entry as Record<string, unknown>).intentGroupId = intentGroupId;
    delete (entry as Record<string, unknown>).sameIntentKeywords;
    // mainKeywordInSameIntent はそのまま残す
    updated++;
  }

  console.log(`  ${groupMap.size} グループ、${updated} キーワードを更新します。`);

  const backupPath = KEYWORDS_FILE + BACKUP_SUFFIX;
  await fs.copyFile(KEYWORDS_FILE, backupPath);
  console.log(`  バックアップ: ${backupPath}`);

  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('✅ マイグレーション完了');
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
