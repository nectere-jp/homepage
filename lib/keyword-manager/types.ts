/**
 * キーワードマスター用の型定義（V5: 4軸クラスタ + ハブ/子記事）
 */
import type { BusinessType, ClusterAxis, ArticleRole } from '../blog';

export type { BusinessType, ClusterAxis, ArticleRole } from '../blog';

export interface KeywordData {
  articles: string[];
  frequency: number;
  lastUsed: string;
}

export interface KeywordConflict {
  keyword: string;
  articles: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface RankHistoryEntry {
  date: string;
  rank: number;
  source: 'manual' | 'api';
}

/** 記事のワークフローステータス（Part B の6段階） */
export type ArticleStatus =
  | 'pending'      // 未着手
  | 'planning'     // 企画中（Part C 記入中）
  | 'writing'      // 執筆中
  | 'published'    // 公開済み
  | 'needs_update' // リライト待ち
  | 'archived';    // アーカイブ

/**
 * @deprecated V4 互換用。V5 では articleStatus を使用。
 */
export type WorkflowFlag =
  | 'pending'
  | 'to_create'
  | 'created'
  | 'needs_update'
  | 'skip';

/**
 * @deprecated V4 互換用。V5 では clusterAxis/articleRole を使用。
 */
export type KeywordTier = 'big' | 'middle' | 'longtail';

export interface TargetKeywordData {
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: number | null;
  rankHistory: RankHistoryEntry[];
  status: 'active' | 'paused' | 'achieved';
  assignedArticles: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  clusterAxis?: ClusterAxis;
  articleRole?: ArticleRole;
  articleStatus?: ArticleStatus;
  hubArticleSlug?: string | null;
  expectedRank?: number | null;
  cvr?: number | null;
}

export interface TagMasterData {
  description: string;
  targetKeywords: string[];
  displayName: string;
}

export interface KeywordVariant {
  keyword: string;
  estimatedPv?: number;
  currentRank?: number | null;
  rankHistory?: RankHistoryEntry[];
  cvr?: number | null;
  expectedRank?: number | null;
  orderInGroup?: number;
}

export interface KeywordGroupData {
  id: string;
  clusterAxis: ClusterAxis;
  articleRole: ArticleRole;
  articleStatus?: ArticleStatus;
  /** 子記事の場合、対応するハブ記事のスラッグ */
  hubArticleSlug?: string | null;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  assignedArticles: string[];
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'paused' | 'achieved';
  createdAt: string;
  updatedAt: string;
  variants: KeywordVariant[];
}

export interface KeywordDatabaseV5 {
  version: '5.0';
  keywordGroups: Record<string, KeywordGroupData>;
  usageTracking: Record<string, KeywordData>;
  tagMaster: Record<string, TagMasterData>;
  metadata: {
    version: string;
    lastUpdated: string;
    totalTargetKeywords: number;
    totalTags: number;
  };
}

export interface SameIntentConflict {
  sameIntentKey: string;
  keywords: string[];
  existingArticles: string[];
  message: string;
}
