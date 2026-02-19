import type { BusinessType } from "@/lib/blog";
import type { KeywordTier, WorkflowFlag } from "@/lib/keyword-manager";

/** 分析APIの競合キーワード1件 */
export interface ConflictKeywordData {
  keyword: string;
  data: {
    articles: string[];
    frequency: number;
    lastUsed: string;
  };
}

/** 事業別のキーワード達成率 */
export interface BusinessCoverage {
  business: BusinessType;
  label: string;
  total: number;
  used: number;
  percentage: number;
}

/** マスターキーワード（API取得形 + 表示用） */
export interface MasterKeyword {
  keyword: string;
  groupId?: string;
  parentId?: string | null;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  assignedArticles: string[];
  status: "active" | "paused" | "achieved";
  currentRank: number | null;
  createdAt: string;
  updatedAt: string;
  keywordTier?: KeywordTier;
  expectedRank?: number | null;
  cvr?: number | null;
  businessImpact?: number | null;
  ctr?: number | null;
  /** 表示用。同趣旨 = parentId ?? groupId（APIで導出） */
  intentGroupId?: string | null;
  mainKeywordInSameIntent?: string | null;
  workflowFlag?: WorkflowFlag;
  pillarSlug?: string | null;
  orderInGroup?: number | null;
}

/** 編集中のセル位置 */
export type EditingCell = {
  keyword: string;
  field: "estimatedPv" | "expectedRank" | "cvr";
};

/** 開いているポップオーバー */
export type OpenPopover = { keyword: string; field: "tags" | "workflowFlag" };

export type { KeywordTier, WorkflowFlag };
