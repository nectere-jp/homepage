import type { BusinessType } from "@/lib/blog";
import type {
  KeywordTier,
  WorkflowFlag,
  ClusterAxis,
  ArticleRole,
  TargetReader,
} from "@/lib/keyword-manager";

/** 同趣旨グループ選択用（groupId + 代表ラベル） */
export interface GroupOption {
  groupId: string;
  label: string;
  keywordTier: KeywordTier;
}

/** 編集対象のキーワード（API形に近い） */
export interface TargetKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: number | null;
  status: "active" | "paused" | "achieved";
  assignedArticles?: string[];
  keywordTier?: KeywordTier;
  expectedRank?: number | null;
  cvr?: number | null;
  workflowFlag?: WorkflowFlag;
  clusterAxis?: ClusterAxis;
  articleRole?: ArticleRole;
  targetReader?: TargetReader | null;
  hubArticleSlug?: string | null;
  /** APIから受け取るがモーダルでは編集しない */
  pillarSlug?: string | null;
  parentId?: string | null;
}

/** モーダル内で使うフォームデータの型 */
export interface KeywordFormData {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: string;
  status: "active" | "paused" | "achieved";
  keywordTier: KeywordTier;
  expectedRank: number | string;
  cvr: string;
  workflowFlag: WorkflowFlag;
  clusterAxis: ClusterAxis;
  articleRole: ArticleRole;
  targetReader: TargetReader | null;
  hubArticleSlug: string;
  addToGroupId: string;
  parentId: string;
}

/** 渡された prop をモーダル用の TargetKeyword 形に正規化する（詳細ページはグループ形で keyword が variants[0] にある） */
export function normalizeKeywordProp(prop: TargetKeyword | null): TargetKeyword | null {
  if (!prop || typeof prop !== "object") return null;
  const p = prop as unknown as Record<string, unknown>;
  const variants = p.variants as
    | {
        keyword?: string;
        estimatedPv?: number;
        currentRank?: number | null;
        expectedRank?: number | null;
        cvr?: number | null;
      }[]
    | undefined;
  const v = Array.isArray(variants) ? variants[0] : null;
  const keywordStr =
    (typeof p.keyword === "string" ? p.keyword : null) ??
    (v && typeof v.keyword === "string" ? v.keyword : null) ??
    (typeof p.id === "string" ? p.id : null) ??
    "";
  const tier = (p.keywordTier as KeywordTier) ?? (p.tier as KeywordTier);
  return {
    keyword: keywordStr,
    priority: ((p.priority as number) ?? 3) as 1 | 2 | 3 | 4 | 5,
    estimatedPv: (v?.estimatedPv ?? (p.estimatedPv as number)) ?? 0,
    relatedBusiness: (Array.isArray(p.relatedBusiness) ? p.relatedBusiness : []) as BusinessType[],
    relatedTags: (Array.isArray(p.relatedTags) ? p.relatedTags : []) as string[],
    currentRank: v?.currentRank ?? (p.currentRank as number | null) ?? null,
    status: (p.status as "active" | "paused" | "achieved") ?? "active",
    assignedArticles: p.assignedArticles as string[] | undefined,
    keywordTier: tier,
    expectedRank: v?.expectedRank ?? (p.expectedRank as number | null) ?? null,
    cvr: v?.cvr ?? (p.cvr as number | null) ?? null,
    workflowFlag: p.workflowFlag as WorkflowFlag | undefined,
    clusterAxis: p.clusterAxis as ClusterAxis | undefined,
    articleRole: p.articleRole as ArticleRole | undefined,
    targetReader: (p.targetReader as TargetReader | null | undefined) ?? null,
    hubArticleSlug: p.hubArticleSlug as string | null | undefined,
    pillarSlug: p.pillarSlug as string | null | undefined,
    parentId: p.parentId as string | null | undefined,
  };
}
