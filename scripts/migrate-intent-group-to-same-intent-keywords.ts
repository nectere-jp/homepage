/**
 * intentGroupId を廃止し、各キーワードに sameIntentKeywords と mainKeywordInSameIntent を設定するマイグレーション
 *
 * - intentGroupId ごとにそのグループに属するキーワード一覧を収集
 * - 各キーワードに sameIntentKeywords = その一覧、mainKeywordInSameIntent = middle/big で estimatedPv 最大（いなければ先頭）を設定
 * - 全キーワードから intentGroupId を削除
 */
import fs from 'fs/promises';
import path from 'path';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');
const BACKUP_SUFFIX = `.before-same-intent.${new Date().toISOString().slice(0, 10)}.json`;

interface TargetKeywordDataLegacy {
  priority: number;
  estimatedPv: number;
  relatedBusiness: string[];
  relatedTags: string[];
  currentRank: number | null;
  rankHistory: unknown[];
  status: string;
  assignedArticles: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  keywordTier?: string;
  expectedRank?: number | null;
  cvr?: number | null;
  intentGroupId?: string | null;
  workflowFlag?: string;
  pillarSlug?: string | null;
  sameIntentKeywords?: string[];
  mainKeywordInSameIntent?: string | null;
}

interface KeywordDatabaseV2 {
  version: string;
  targetKeywords: Record<string, TargetKeywordDataLegacy>;
  usageTracking: Record<string, unknown>;
  tagMaster: Record<string, unknown>;
  metadata: {
    version: string;
    lastUpdated: string;
    totalTargetKeywords: number;
    totalTags: number;
  };
}

function pickMainKeyword(
  keywords: string[],
  targetKeywords: Record<string, TargetKeywordDataLegacy>
): string {
  if (keywords.length === 0) return '';
  let best = keywords[0];
  let bestPv = 0;
  const tierOrder = (t: string | undefined) => (t === 'big' ? 2 : t === 'middle' ? 1 : 0);
  for (const kw of keywords) {
    const d = targetKeywords[kw];
    if (!d) continue;
    const tier = d.keywordTier ?? 'longtail';
    if (tier !== 'middle' && tier !== 'big') continue;
    const pv = d.estimatedPv ?? 0;
    const currentBest = targetKeywords[best];
    if (
      pv > bestPv ||
      (pv === bestPv && tierOrder(d.keywordTier) > tierOrder(currentBest?.keywordTier))
    ) {
      best = kw;
      bestPv = pv;
    }
  }
  return best;
}

async function migrate() {
  console.log('🔄 intentGroupId → sameIntentKeywords マイグレーションを開始します...');

  let db: KeywordDatabaseV2;
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    db = JSON.parse(data);
    console.log('✅ 既存のデータを読み込みました');
  } catch (error) {
    console.error('❌ 既存のデータの読み込みに失敗しました:', error);
    return;
  }

  const backupPath = KEYWORDS_FILE.replace('.json', BACKUP_SUFFIX);
  try {
    await fs.writeFile(backupPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`✅ バックアップを作成しました: ${backupPath}`);
  } catch (error) {
    console.error('❌ バックアップの作成に失敗しました:', error);
    return;
  }

  // intentGroupId ごとにキーワード一覧を収集
  const groupToKeywords = new Map<string, string[]>();
  for (const [keyword, data] of Object.entries(db.targetKeywords)) {
    const gid = data.intentGroupId;
    if (!gid) continue;
    const list = groupToKeywords.get(gid) ?? [];
    if (!list.includes(keyword)) list.push(keyword);
    groupToKeywords.set(gid, list);
  }

  let migratedCount = 0;
  for (const [, keywords] of groupToKeywords) {
    const main = pickMainKeyword(keywords, db.targetKeywords);
    for (const keyword of keywords) {
      const data = db.targetKeywords[keyword];
      if (!data) continue;
      const { intentGroupId, ...rest } = data;
      db.targetKeywords[keyword] = {
        ...rest,
        sameIntentKeywords: keywords,
        mainKeywordInSameIntent: main || null,
      };
      migratedCount++;
    }
  }

  // 残り全キーワードから intentGroupId を削除
  for (const [keyword, data] of Object.entries(db.targetKeywords)) {
    if ('intentGroupId' in data && data.intentGroupId !== undefined) {
      const { intentGroupId, ...rest } = data;
      db.targetKeywords[keyword] = rest;
    }
  }

  db.metadata.lastUpdated = new Date().toISOString();

  try {
    await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
    console.log('✅ マイグレーション後のデータを保存しました');
  } catch (error) {
    console.error('❌ データの保存に失敗しました:', error);
    return;
  }

  console.log('🎉 マイグレーションが完了しました！');
  console.log(`   - 同趣旨リストを設定したキーワード: ${migratedCount} 件`);
  console.log(`   - グループ数: ${groupToKeywords.size}`);
  console.log(`   - バックアップ: ${backupPath}`);
}

migrate().catch(console.error);
