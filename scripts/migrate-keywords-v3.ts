/**
 * keywords.json の targetKeywords に V3 拡張フィールドを付与するマイグレーション
 *
 * - keywordTier: 未設定なら 'middle'
 * - workflowFlag: assignedArticles があるなら 'created'、なければ 'pending'
 * - intentGroupId: 未設定のまま（UIで後からグループ化）
 */
import fs from 'fs/promises';
import path from 'path';
import type { KeywordTier, WorkflowFlag } from '../lib/keyword-manager';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');
const BACKUP_SUFFIX = `.v2.backup.${new Date().toISOString().slice(0, 10)}.json`;

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
  keywordTier?: KeywordTier;
  expectedRank?: number | null;
  cvr?: number | null;
  intentGroupId?: string | null;
  workflowFlag?: WorkflowFlag;
  pillarSlug?: string | null;
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

async function migrate() {
  console.log('🔄 キーワード V3 マイグレーションを開始します...');

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

  let migratedCount = 0;
  for (const [keyword, data] of Object.entries(db.targetKeywords)) {
    const hasArticles = (data.assignedArticles?.length ?? 0) > 0;
    const updates: Partial<TargetKeywordDataLegacy> = {};

    if (data.keywordTier == null) {
      updates.keywordTier = 'middle';
    }
    if (data.workflowFlag == null) {
      updates.workflowFlag = hasArticles ? 'created' : 'pending';
    }

    if (Object.keys(updates).length > 0) {
      db.targetKeywords[keyword] = { ...data, ...updates };
      migratedCount++;
    }
  }

  db.metadata.lastUpdated = new Date().toISOString();

  try {
    await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
    console.log('✅ V3 形式でデータを保存しました');
  } catch (error) {
    console.error('❌ データの保存に失敗しました:', error);
    return;
  }

  console.log('🎉 マイグレーションが完了しました！');
  console.log(`   - 更新したキーワード: ${migratedCount} 件`);
  console.log(`   - バックアップ: ${backupPath}`);
}

migrate().catch(console.error);
