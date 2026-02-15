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

/** キーワードの階層（ビッグ/ミドル/ロングテール） */
export type KeywordTier = 'big' | 'middle' | 'longtail';

/** ワークフローフラグ（MECE） */
export type WorkflowFlag =
  | 'pending'   // 待ち
  | 'to_create' // 要作成
  | 'created'   // 作成済み
  | 'needs_update' // 要更新
  | 'skip';    // 対応しない

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

  // V3 拡張フィールド
  keywordTier?: KeywordTier; // ビッグ/ミドル/ロングテール
  expectedRank?: number | null; // 予想検索順位（1〜100）
  cvr?: number | null; // コンバージョン率（0〜1）
  intentGroupId?: string | null; // 同じ趣旨のワードをまとめるグループID
  workflowFlag?: WorkflowFlag; // ワークフローフラグ
  pillarSlug?: string | null; // 所属ピラーページの slug（クラスターのみ）
}

/** Google Organic SERP CTR 曲線（First Page Sage 2026 等を参考） */
const CTR_BY_RANK: Record<number, number> = {
  1: 0.398,
  2: 0.187,
  3: 0.102,
  4: 0.072,
  5: 0.051,
  6: 0.044,
  7: 0.03,
  8: 0.021,
  9: 0.019,
  10: 0.016,
};

/**
 * 検索順位から CTR を算出（Google Organic SERP CTR 曲線）
 * 11位以降は指数減衰で近似
 */
export function getCTRByRank(rank: number): number {
  if (rank < 1) return 0;
  if (rank <= 10) return CTR_BY_RANK[rank] ?? 0;
  // 11位以降: 0.016 * 0.85^(rank-10) で近似
  return 0.016 * Math.pow(0.85, rank - 10);
}

/**
 * 事業インパクトを算出（estimatedPv × CTR × CVR）
 * 単位: 想定コンバージョン数/月
 */
export function calculateBusinessImpact(kw: {
  estimatedPv: number;
  expectedRank?: number | null;
  cvr?: number | null;
}): number {
  const rank = kw.expectedRank ?? null;
  const cvr = kw.cvr ?? 0;

  if (rank == null || rank < 1 || cvr <= 0) return 0;

  const ctr = getCTRByRank(rank);
  return Math.round(kw.estimatedPv * ctr * cvr);
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
    } else {
      // 記事で使われなくなった場合は空にする
      data.assignedArticles = [];
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

export interface IntentGroupConflict {
  intentGroupId: string;
  keywords: string[];
  existingArticles: string[];
  message: string;
}

/**
 * 意図グループの競合をチェック
 * 同一 intentGroupId のミドルワードが複数記事に分散している場合に警告
 */
export async function checkIntentGroupConflicts(
  keywords: string[]
): Promise<IntentGroupConflict[]> {
  const db = await loadKeywordDatabaseV2();
  const conflicts: IntentGroupConflict[] = [];
  const seenGroups = new Set<string>();

  for (const keyword of keywords) {
    const data = db.targetKeywords[keyword];
    if (!data?.intentGroupId) continue;

    const groupId = data.intentGroupId;
    if (seenGroups.has(groupId)) continue;
    seenGroups.add(groupId);

    // 同一意図グループ内の全キーワードを取得
    const groupKeywords = Object.entries(db.targetKeywords)
      .filter(([, d]) => d.intentGroupId === groupId)
      .map(([kw]) => kw);

    // このグループに紐づく記事（primary または secondary で使用）を集める
    const articlesByKeyword = new Map<string, string[]>();
    for (const kw of groupKeywords) {
      const kwData = db.targetKeywords[kw];
      if (kwData?.assignedArticles?.length) {
        articlesByKeyword.set(kw, kwData.assignedArticles);
      }
    }

    const allArticles = [...new Set(
      Array.from(articlesByKeyword.values()).flat()
    )];

    // 同一グループで複数記事に分散している場合は警告
    if (allArticles.length > 1) {
      conflicts.push({
        intentGroupId: groupId,
        keywords: groupKeywords,
        existingArticles: allArticles,
        message: `意図グループ「${groupId}」のキーワードが ${allArticles.length} 件の記事に分散しています。1ピラーページにまとめることを推奨します。`,
      });
    }
  }

  return conflicts;
}

/**
 * ピラー→クラスター構造を取得
 */
export async function getPillarClusterStructure(): Promise<{
  pillars: Array<{
    slug: string;
    title?: string;
    keywords: string[];
    clusters: string[];
  }>;
  orphans: string[]; // pillarSlug 未設定のクラスターキーワード
}> {
  const db = await loadKeywordDatabaseV2();
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const slugToTitle = new Map(posts.map((p) => [p.slug, p.title]));

  const pillarMap = new Map<
    string,
    { keywords: string[]; clusters: string[] }
  >();
  const orphans: string[] = [];

  for (const [keyword, data] of Object.entries(db.targetKeywords)) {
    const tier = data.keywordTier ?? 'middle';
    const pillarSlug = data.pillarSlug ?? null;

    if (tier === 'longtail' && pillarSlug) {
      const entry = pillarMap.get(pillarSlug) ?? {
        keywords: [],
        clusters: [],
      };
      entry.clusters.push(keyword);
      pillarMap.set(pillarSlug, entry);
    } else if (tier === 'longtail' && !pillarSlug) {
      orphans.push(keyword);
    } else if (tier === 'middle' || tier === 'big') {
      for (const slug of data.assignedArticles ?? []) {
        const entry = pillarMap.get(slug) ?? {
          keywords: [],
          clusters: [],
        };
        if (!entry.keywords.includes(keyword)) {
          entry.keywords.push(keyword);
        }
        pillarMap.set(slug, entry);
      }
    }
  }

  const pillars = Array.from(pillarMap.entries()).map(([slug, { keywords, clusters }]) => ({
    slug,
    title: slugToTitle.get(slug),
    keywords,
    clusters,
  }));

  return { pillars, orphans };
}

export interface IntentGroupInfo {
  id: string;
  keywords: string[];
}

/**
 * 意図グループ一覧を取得
 */
export async function getIntentGroups(): Promise<IntentGroupInfo[]> {
  const db = await loadKeywordDatabaseV2();
  const groupMap = new Map<string, string[]>();

  for (const [keyword, data] of Object.entries(db.targetKeywords)) {
    const gid = data.intentGroupId;
    if (!gid) continue;
    const list = groupMap.get(gid) ?? [];
    list.push(keyword);
    groupMap.set(gid, list);
  }

  return Array.from(groupMap.entries()).map(([id, keywords]) => ({
    id,
    keywords,
  }));
}

/**
 * キーワードの意図グループを更新
 */
export async function updateKeywordIntentGroup(
  keyword: string,
  intentGroupId: string | null
): Promise<void> {
  await saveTargetKeyword(keyword, { intentGroupId });
}

/**
 * 複数キーワードを意図グループに割り当て
 */
export async function assignKeywordsToIntentGroup(
  intentGroupId: string,
  keywords: string[]
): Promise<void> {
  for (const keyword of keywords) {
    await saveTargetKeyword(keyword, { intentGroupId });
  }
}

/**
 * キーワードの補正データを取得（workflowFlag などデフォルト適用）
 */
export function resolveKeywordDefaults(
  keyword: string,
  data: TargetKeywordData
): TargetKeywordData {
  const hasArticles = (data.assignedArticles?.length ?? 0) > 0;
  return {
    ...data,
    keywordTier: data.keywordTier ?? 'middle',
    workflowFlag:
      data.workflowFlag ??
      (hasArticles ? 'created' : 'pending'),
    expectedRank: data.expectedRank ?? data.currentRank ?? null,
  };
}
