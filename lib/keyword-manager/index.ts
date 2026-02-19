/**
 * キーワードマスターの永続化と問い合わせ（V4）。
 * content/keywords.json の読み書き、記事からの使用状況更新、
 * 競合・同趣旨・ピラークラスター等の取得を提供する。
 */

// 型
export type { BusinessType } from './types';
export type {
  KeywordData,
  KeywordConflict,
  RankHistoryEntry,
  KeywordTier,
  WorkflowFlag,
  TargetKeywordData,
  TagMasterData,
  KeywordVariant,
  KeywordGroupData,
  KeywordDatabaseV4,
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

// クエリ・同趣旨・ピラー
export {
  getKeywordsByBusiness,
  getKeywordsByPriority,
  suggestUnusedKeywords,
  getSameIntentKeywordIds,
  checkSameIntentConflicts,
  getPillarClusterStructure,
  getDisplayLabelForPrimaryKeyword,
} from './queries';
