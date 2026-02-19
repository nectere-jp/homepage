/**
 * キーワードマスター用の型定義（V4: グループ + バリアント）
 */
import type { BusinessType } from '../blog';

export type { BusinessType } from '../blog';

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

/** キーワードの階層（ビッグ/ミドル/ロングテール） */
export type KeywordTier = 'big' | 'middle' | 'longtail';

/** ワークフローフラグ（MECE） */
export type WorkflowFlag =
  | 'pending'
  | 'to_create'
  | 'created'
  | 'needs_update'
  | 'skip';

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
  keywordTier?: KeywordTier;
  expectedRank?: number | null;
  cvr?: number | null;
  workflowFlag?: WorkflowFlag;
  pillarSlug?: string | null;
  intentGroupId?: string | null;
  mainKeywordInSameIntent?: string | null;
  orderInGroup?: number | null;
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
}

export interface KeywordGroupData {
  id: string;
  tier: KeywordTier;
  parentId: string | null;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  assignedArticles: string[];
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'paused' | 'achieved';
  workflowFlag?: WorkflowFlag;
  createdAt: string;
  updatedAt: string;
  variants: KeywordVariant[];
}

export interface KeywordDatabaseV4 {
  version: '4.0';
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
