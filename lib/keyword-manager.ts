import fs from 'fs/promises';
import path from 'path';
import { getAllPosts, type BusinessType } from './blog';

// Re-export for convenience
export type { BusinessType } from './blog';

const KEYWORDS_FILE = path.join(process.cwd(), 'content', 'keywords.json');

// 既存の型定義（後方互換性のため残す）
export interface KeywordData {
  articles: string[];
  frequency: number;
  lastUsed: string;
}

export interface KeywordDatabase {
  globalKeywords: Record<string, KeywordData>;
  keywordGaps: string[];
  analysis: {
    lastAnalyzed: string | null;
    totalArticles: number;
    uniqueKeywords: number;
  };
}

export interface KeywordConflict {
  keyword: string;
  articles: string[];
  severity: 'high' | 'medium' | 'low';
}

// 新しい型定義（V2）
export interface RankHistoryEntry {
  date: string;
  rank: number;
  source: 'manual' | 'api';
}

export interface TargetKeywordData {
  priority: 1 | 2 | 3 | 4 | 5; // 1-5の数値評価（5が最重要）
  estimatedPv: number; // 想定月間PV数
  relatedBusiness: BusinessType[]; // 関連事業
  relatedTags: string[]; // 関連タグ
  currentRank: number | null; // 現在の検索順位
  rankHistory: RankHistoryEntry[]; // 順位履歴
  status: 'active' | 'paused' | 'achieved'; // ステータス
  assignedArticles: string[]; // 割り当てられた記事のslug
  notes?: string; // キーワードに関するメモや戦略
  createdAt: string;
  updatedAt: string;
}

export interface TagMasterData {
  description: string;
  targetKeywords: string[]; // このタグに関連するキーワード
  displayName: string;
}

export interface KeywordDatabaseV2 {
  version: string;
  targetKeywords: Record<string, TargetKeywordData>; // 狙いたいキーワードのマスター
  usageTracking: Record<string, KeywordData>; // 記事での使用実績
  tagMaster: Record<string, TagMasterData>; // タグマスター
  metadata: {
    version: string;
    lastUpdated: string;
    totalTargetKeywords: number;
    totalTags: number;
  };
}

/**
 * キーワードデータベースを読み込む（V2対応）
 */
export async function loadKeywordDatabaseV2(): Promise<KeywordDatabaseV2> {
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // V1形式の場合はV2に変換
    if (!parsed.version || parsed.version === '1.0') {
      return {
        version: '2.0',
        targetKeywords: {},
        usageTracking: parsed.globalKeywords || {},
        tagMaster: {},
        metadata: {
          version: '2.0',
          lastUpdated: new Date().toISOString(),
          totalTargetKeywords: 0,
          totalTags: 0,
        },
      };
    }
    
    return parsed as KeywordDatabaseV2;
  } catch (error) {
    // ファイルが存在しない場合は初期データを返す
    return {
      version: '2.0',
      targetKeywords: {},
      usageTracking: {},
      tagMaster: {},
      metadata: {
        version: '2.0',
        lastUpdated: new Date().toISOString(),
        totalTargetKeywords: 0,
        totalTags: 0,
      },
    };
  }
}

/**
 * キーワードデータベースを保存（V2対応）
 */
export async function saveKeywordDatabaseV2(db: KeywordDatabaseV2): Promise<void> {
  db.metadata.lastUpdated = new Date().toISOString();
  db.metadata.totalTargetKeywords = Object.keys(db.targetKeywords).length;
  db.metadata.totalTags = Object.keys(db.tagMaster).length;
  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
}

/**
 * キーワードデータベースを読み込む（後方互換性のため残す）
 */
export async function loadKeywordDatabase(): Promise<KeywordDatabase> {
  try {
    const data = await fs.readFile(KEYWORDS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // V2形式の場合はV1形式に変換
    if (parsed.version === '2.0') {
      return {
        globalKeywords: parsed.usageTracking || {},
        keywordGaps: [],
        analysis: {
          lastAnalyzed: parsed.metadata?.lastUpdated || null,
          totalArticles: 0,
          uniqueKeywords: Object.keys(parsed.usageTracking || {}).length,
        },
      };
    }
    
    return parsed;
  } catch (error) {
    return {
      globalKeywords: {},
      keywordGaps: [],
      analysis: {
        lastAnalyzed: null,
        totalArticles: 0,
        uniqueKeywords: 0,
      },
    };
  }
}

/**
 * キーワードデータベースを保存（後方互換性のため残す）
 */
export async function saveKeywordDatabase(db: KeywordDatabase): Promise<void> {
  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(db, null, 2), 'utf8');
}

/**
 * すべての記事からキーワードを抽出して更新（V2対応）
 */
export async function updateKeywordDatabase(): Promise<KeywordDatabase> {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const dbV2 = await loadKeywordDatabaseV2();
  
  // usageTrackingを更新
  const usageTracking: Record<string, KeywordData> = {};

  for (const post of posts) {
    const keywords = [
      post.seo.primaryKeyword,
      ...post.seo.secondaryKeywords,
    ].filter(Boolean);

    for (const keyword of keywords) {
      if (!usageTracking[keyword]) {
        usageTracking[keyword] = {
          articles: [],
          frequency: 0,
          lastUsed: post.date,
        };
      }

      usageTracking[keyword].articles.push(post.slug);
      usageTracking[keyword].frequency += 1;

      if (new Date(post.date) > new Date(usageTracking[keyword].lastUsed)) {
        usageTracking[keyword].lastUsed = post.date;
      }
    }
  }

  // targetKeywordsのassignedArticlesも更新
  for (const [keyword, data] of Object.entries(dbV2.targetKeywords)) {
    if (usageTracking[keyword]) {
      data.assignedArticles = usageTracking[keyword].articles;
      data.updatedAt = new Date().toISOString();
    }
  }

  dbV2.usageTracking = usageTracking;
  await saveKeywordDatabaseV2(dbV2);

  // V1形式で返す（後方互換性）
  return {
    globalKeywords: usageTracking,
    keywordGaps: [],
    analysis: {
      lastAnalyzed: new Date().toISOString(),
      totalArticles: posts.length,
      uniqueKeywords: Object.keys(usageTracking).length,
    },
  };
}

/**
 * ターゲットキーワード一覧を取得
 */
export async function loadTargetKeywords(): Promise<Record<string, TargetKeywordData>> {
  const db = await loadKeywordDatabaseV2();
  return db.targetKeywords;
}

/**
 * ターゲットキーワードを保存・更新
 */
export async function saveTargetKeyword(keyword: string, data: Partial<TargetKeywordData>): Promise<void> {
  const db = await loadKeywordDatabaseV2();
  
  const now = new Date().toISOString();
  
  if (db.targetKeywords[keyword]) {
    // 更新
    db.targetKeywords[keyword] = {
      ...db.targetKeywords[keyword],
      ...data,
      updatedAt: now,
    };
  } else {
    // 新規作成
    db.targetKeywords[keyword] = {
      priority: 3,
      estimatedPv: 0,
      relatedBusiness: [],
      relatedTags: [],
      currentRank: null,
      rankHistory: [],
      status: 'active',
      assignedArticles: [],
      createdAt: now,
      updatedAt: now,
      ...data,
    } as TargetKeywordData;
  }
  
  await saveKeywordDatabaseV2(db);
}

/**
 * ターゲットキーワードを削除
 */
export async function deleteTargetKeyword(keyword: string): Promise<void> {
  const db = await loadKeywordDatabaseV2();
  delete db.targetKeywords[keyword];
  await saveKeywordDatabaseV2(db);
}

/**
 * 順位履歴を更新
 */
export async function updateRankHistory(
  keyword: string,
  rank: number,
  source: 'manual' | 'api' = 'manual'
): Promise<void> {
  const db = await loadKeywordDatabaseV2();
  
  if (!db.targetKeywords[keyword]) {
    throw new Error(`Keyword "${keyword}" not found in target keywords`);
  }
  
  const entry: RankHistoryEntry = {
    date: new Date().toISOString(),
    rank,
    source,
  };
  
  db.targetKeywords[keyword].rankHistory.push(entry);
  db.targetKeywords[keyword].currentRank = rank;
  db.targetKeywords[keyword].updatedAt = new Date().toISOString();
  
  await saveKeywordDatabaseV2(db);
}

/**
 * 事業別にキーワードを取得
 */
export async function getKeywordsByBusiness(business: BusinessType): Promise<Array<{
  keyword: string;
  data: TargetKeywordData;
}>> {
  const db = await loadKeywordDatabaseV2();
  
  return Object.entries(db.targetKeywords)
    .filter(([, data]) => data.relatedBusiness.includes(business))
    .map(([keyword, data]) => ({ keyword, data }));
}

/**
 * 重要度別にキーワードを取得
 */
export async function getKeywordsByPriority(priority: 1 | 2 | 3 | 4 | 5): Promise<Array<{
  keyword: string;
  data: TargetKeywordData;
}>> {
  const db = await loadKeywordDatabaseV2();
  
  return Object.entries(db.targetKeywords)
    .filter(([, data]) => data.priority === priority)
    .map(([keyword, data]) => ({ keyword, data }))
    .sort((a, b) => b.data.estimatedPv - a.data.estimatedPv);
}

/**
 * 未使用の重要キーワードを提案
 */
export async function suggestUnusedKeywords(limit: number = 10): Promise<Array<{
  keyword: string;
  data: TargetKeywordData;
}>> {
  const db = await loadKeywordDatabaseV2();
  
  return Object.entries(db.targetKeywords)
    .filter(([, data]) => data.status === 'active' && data.assignedArticles.length === 0)
    .sort((a, b) => {
      // 優先度が高い順、同じ優先度ならPVが多い順
      if (b[1].priority !== a[1].priority) {
        return b[1].priority - a[1].priority;
      }
      return b[1].estimatedPv - a[1].estimatedPv;
    })
    .slice(0, limit)
    .map(([keyword, data]) => ({ keyword, data }));
}

/**
 * キーワードの競合をチェック
 */
export async function checkKeywordConflicts(
  keywords: string[]
): Promise<KeywordConflict[]> {
  const db = await loadKeywordDatabase();
  const conflicts: KeywordConflict[] = [];

  for (const keyword of keywords) {
    const data = db.globalKeywords[keyword];
    if (data && data.articles.length > 0) {
      let severity: 'high' | 'medium' | 'low' = 'low';
      
      if (data.frequency >= 3) {
        severity = 'high';
      } else if (data.frequency === 2) {
        severity = 'medium';
      }

      conflicts.push({
        keyword,
        articles: data.articles,
        severity,
      });
    }
  }

  return conflicts;
}

/**
 * キーワードギャップを分析
 * SEO戦略ドキュメントのキーワードと比較
 */
export async function analyzeKeywordGaps(
  targetKeywords: string[]
): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const usedKeywords = Object.keys(db.globalKeywords);

  // 使用されていないキーワードを抽出
  const gaps = targetKeywords.filter(
    keyword => !usedKeywords.includes(keyword)
  );

  return gaps;
}

/**
 * キーワードの使用状況を取得
 */
export async function getKeywordUsage(keyword: string): Promise<KeywordData | null> {
  const db = await loadKeywordDatabase();
  return db.globalKeywords[keyword] || null;
}

/**
 * よく使われているキーワードを取得
 */
export async function getTopKeywords(limit: number = 10): Promise<Array<{
  keyword: string;
  data: KeywordData;
}>> {
  const db = await loadKeywordDatabase();
  const entries = Object.entries(db.globalKeywords);

  entries.sort((a, b) => b[1].frequency - a[1].frequency);

  return entries.slice(0, limit).map(([keyword, data]) => ({
    keyword,
    data,
  }));
}

/**
 * タグマスターを取得
 */
export async function getTagMaster(): Promise<Record<string, TagMasterData>> {
  const db = await loadKeywordDatabaseV2();
  return db.tagMaster;
}

/**
 * タグマスターを更新
 */
export async function updateTagMaster(tag: string, data: Partial<TagMasterData>): Promise<void> {
  const db = await loadKeywordDatabaseV2();
  
  if (db.tagMaster[tag]) {
    db.tagMaster[tag] = {
      ...db.tagMaster[tag],
      ...data,
    };
  } else {
    db.tagMaster[tag] = {
      description: '',
      targetKeywords: [],
      displayName: tag,
      ...data,
    };
  }
  
  await saveKeywordDatabaseV2(db);
}

/**
 * タグマスターを削除
 */
export async function deleteTagMaster(tag: string): Promise<void> {
  const db = await loadKeywordDatabaseV2();
  delete db.tagMaster[tag];
  await saveKeywordDatabaseV2(db);
}

/**
 * キーワードから関連タグを取得
 */
export async function getTagsFromKeyword(keyword: string): Promise<string[]> {
  const db = await loadKeywordDatabaseV2();
  
  // targetKeywordsに登録されている場合
  if (db.targetKeywords[keyword]) {
    return db.targetKeywords[keyword].relatedTags;
  }
  
  // tagMasterから逆引き
  return Object.entries(db.tagMaster)
    .filter(([, data]) => data.targetKeywords.includes(keyword))
    .map(([tag]) => tag);
}

/**
 * 記事に最適なキーワードを提案
 */
export async function suggestKeywordsForArticle(
  title: string,
  content: string,
  existingKeywords: string[] = []
): Promise<string[]> {
  const db = await loadKeywordDatabase();
  const allKeywords = Object.keys(db.globalKeywords);

  // 既存のキーワードから、使用頻度が低いものを優先的に提案
  const suggestions = allKeywords
    .filter(keyword => !existingKeywords.includes(keyword))
    .filter(keyword => {
      // タイトルまたは本文に含まれるキーワード
      return (
        title.toLowerCase().includes(keyword.toLowerCase()) ||
        content.toLowerCase().includes(keyword.toLowerCase())
      );
    })
    .sort((a, b) => {
      // 使用頻度が低い順
      return db.globalKeywords[a].frequency - db.globalKeywords[b].frequency;
    })
    .slice(0, 5);

  return suggestions;
}

/**
 * 事業に関連する未使用キーワードを提案
 */
export async function suggestUnusedKeywordsByBusiness(
  business: BusinessType,
  limit: number = 5
): Promise<Array<{
  keyword: string;
  data: TargetKeywordData;
}>> {
  const db = await loadKeywordDatabaseV2();
  
  return Object.entries(db.targetKeywords)
    .filter(([, data]) => 
      data.relatedBusiness.includes(business) && 
      data.status === 'active' && 
      data.assignedArticles.length === 0
    )
    .sort((a, b) => {
      if (b[1].priority !== a[1].priority) {
        return b[1].priority - a[1].priority;
      }
      return b[1].estimatedPv - a[1].estimatedPv;
    })
    .slice(0, limit)
    .map(([keyword, data]) => ({ keyword, data }));
}
