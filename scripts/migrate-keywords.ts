/**
 * keywords.jsonをV1からV2形式に移行するスクリプト
 */
import fs from 'fs/promises';
import path from 'path';
import { getAllPosts } from '../lib/blog';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');
const BACKUP_FILE = path.join(process.cwd(), 'content', 'keywords.v1.backup.json');

interface KeywordDataV1 {
  articles: string[];
  frequency: number;
  lastUsed: string;
}

interface KeywordDatabaseV1 {
  globalKeywords: Record<string, KeywordDataV1>;
  keywordGaps: string[];
  analysis: {
    lastAnalyzed: string | null;
    totalArticles: number;
    uniqueKeywords: number;
  };
}

async function migrate() {
  console.log('🔄 キーワードデータベースの移行を開始します...');

  // 既存のデータを読み込む
  let v1Data: KeywordDatabaseV1;
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    v1Data = JSON.parse(data);
    console.log('✅ 既存のデータを読み込みました');
  } catch (error) {
    console.error('❌ 既存のデータの読み込みに失敗しました:', error);
    return;
  }

  // バックアップを作成
  try {
    await fs.writeFile(BACKUP_FILE, JSON.stringify(v1Data, null, 2), 'utf8');
    console.log(`✅ バックアップを作成しました: ${BACKUP_FILE}`);
  } catch (error) {
    console.error('❌ バックアップの作成に失敗しました:', error);
    return;
  }

  // すべての記事からタグを収集（下書き含む）
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const allTags = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
  });

  console.log(`📝 ${allTags.size}個のタグを検出しました`);

  // tagMasterを生成
  const tagMaster: Record<string, any> = {};
  allTags.forEach(tag => {
    tagMaster[tag] = {
      description: `${tag}に関する記事`,
      targetKeywords: [],
      displayName: tag,
    };
  });

  // V2形式のデータを作成
  const v2Data = {
    version: '2.0',
    targetKeywords: {},
    usageTracking: v1Data.globalKeywords || {},
    tagMaster,
    metadata: {
      version: '2.0',
      lastUpdated: new Date().toISOString(),
      totalTargetKeywords: 0,
      totalTags: allTags.size,
    },
  };

  // V2形式で保存
  try {
    await fs.writeFile(KEYWORDS_FILE, JSON.stringify(v2Data, null, 2), 'utf8');
    console.log('✅ V2形式でデータを保存しました');
  } catch (error) {
    console.error('❌ データの保存に失敗しました:', error);
    return;
  }

  console.log('🎉 移行が完了しました！');
  console.log(`   - usageTracking: ${Object.keys(v2Data.usageTracking).length}個のキーワード`);
  console.log(`   - tagMaster: ${Object.keys(v2Data.tagMaster).length}個のタグ`);
  console.log(`   - targetKeywords: ${Object.keys(v2Data.targetKeywords).length}個（初期は空）`);
  console.log(`   - バックアップ: ${BACKUP_FILE}`);
}

migrate().catch(console.error);
