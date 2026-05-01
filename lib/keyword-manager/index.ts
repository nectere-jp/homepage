/**
 * キーワードマスターの永続化と問い合わせ（V5）。
 * content/keywords.json の読み書き、記事からの使用状況更新、
 * 競合・同趣旨・4軸クラスタ構造等の取得を提供する。
 */

// 型
export type { BusinessType, ClusterAxis, ArticleRole } from './types';
export type {
  KeywordData,
  KeywordConflict,
  RankHistoryEntry,
  ArticleStatus,
  WorkflowFlag,
  KeywordTier,
  TargetKeywordData,
  TagMasterData,
  KeywordVariant,
  KeywordGroupData,
  KeywordDatabaseV5,
  SameIntentConflict,
} from './types';

// 計算ヘルパー（keyword-calc）
export { getCTRByRank, calculateBusinessImpact } from '../keyword-calc';

// ストレージ
export { loadKeywordDatabase, saveKeywordDatabase } from './storage';

// グループ CRUD・検索
export {
  loadKeywordGroups,
  getGroupByVariantKeyword,
  getGroupByIdOrVariant,
  getRepresentativeKeyword,
  saveKeywordGroup,
  saveKeywordGroupsBulk,
  deleteKeywordGroup,
  updateVariantRank,
  updateRankHistory,
  resolveGroupDefaults,
} from './groups';

// 使用状況・タグ・提案
export {
  updateKeywordDatabase,
  checkKeywordConflicts,
  analyzeKeywordGaps,
  getKeywordUsage,
  getTopKeywords,
  getTagMaster,
  updateTagMaster,
  deleteTagMaster,
  getTagsFromKeyword,
  suggestKeywordsForArticle,
  suggestUnusedKeywordsByBusiness,
} from './usage';

// クエリ・同趣旨・クラスタ軸構造
export {
  getKeywordsByBusiness,
  getKeywordsByPriority,
  suggestUnusedKeywords,
  getSameIntentKeywordIds,
  checkSameIntentConflicts,
  getClusterAxisStructure,
  getPillarClusterStructure,
  getDisplayLabelForPrimaryKeyword,
} from './queries';
