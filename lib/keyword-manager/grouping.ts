import type { BusinessType } from "@/lib/blog";
import type {
  MasterKeyword,
  ClusterAxis,
  ArticleStatus,
  SortByOption,
} from "@/components/admin/keywords";
import { CLUSTER_AXIS_LABELS } from "@/components/admin/keywords";

/** フィルタ条件 */
export interface KeywordFilterOptions {
  selectedBusiness: BusinessType | "all";
  searchQuery: string;
  filterPriority: number | "";
  filterStatus: string;
  filterUsage: "all" | "used" | "unused";
  filterClusterAxis: ClusterAxis | "";
  filterArticleStatus: ArticleStatus | "";
  effectiveWorkflowFlags: Map<string, ArticleStatus>;
  sortBy: SortByOption;
}

/** 検索・フィルタ・ソートを適用した一覧を返す */
export function filterAndSortKeywords(
  allKeywords: MasterKeyword[],
  opts: KeywordFilterOptions,
): MasterKeyword[] {
  const {
    selectedBusiness,
    searchQuery,
    filterPriority,
    filterStatus,
    filterUsage,
    filterClusterAxis,
    filterArticleStatus,
    effectiveWorkflowFlags,
    sortBy,
  } = opts;
  return allKeywords
    .filter((kw) => {
      if (
        selectedBusiness !== "all" &&
        !kw.relatedBusiness.includes(selectedBusiness)
      )
        return false;
      if (
        searchQuery &&
        !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (filterPriority && kw.priority !== filterPriority) return false;
      if (filterStatus && kw.status !== filterStatus) return false;
      if (filterUsage === "used" && kw.assignedArticles.length === 0)
        return false;
      if (filterUsage === "unused" && kw.assignedArticles.length > 0)
        return false;
      if (filterClusterAxis && kw.clusterAxis !== filterClusterAxis)
        return false;
      if (filterArticleStatus) {
        const status = effectiveWorkflowFlags.get(kw.keyword) ?? "pending";
        if (status !== filterArticleStatus) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return b.priority - a.priority;
      if (sortBy === "pv") return b.estimatedPv - a.estimatedPv;
      if (sortBy === "businessImpact") {
        const ai = a.businessImpact ?? 0;
        const bi = b.businessImpact ?? 0;
        return bi - ai;
      }
      return a.keyword.localeCompare(b.keyword, "ja");
    });
}

/** clusterAxis ごとに分解したグループ */
export interface IntentGroup {
  gid: string;
  label: string;
  kws: MasterKeyword[];
  middle: MasterKeyword[];
  longtail: MasterKeyword[];
}

/**
 * V5: clusterAxis ごとにグループ化（ハブ先頭、子記事が後続）
 */
export function groupKeywordsByIntent(
  filteredAndSortedKeywords: MasterKeyword[],
): IntentGroup[] {
  const AXIS_ORDER: ClusterAxis[] = [
    "career",
    "time",
    "self",
    "relationship",
    "other",
  ];

  const axisMap = new Map<string, MasterKeyword[]>();
  for (const kw of filteredAndSortedKeywords) {
    const axis = kw.clusterAxis ?? "other";
    const arr = axisMap.get(axis) ?? [];
    arr.push(kw);
    axisMap.set(axis, arr);
  }

  for (const arr of axisMap.values()) {
    arr.sort((a, b) => {
      const roleOrder = (r: string | undefined) => (r === "hub" ? 0 : 1);
      const ra = roleOrder(a.articleRole);
      const rb = roleOrder(b.articleRole);
      if (ra !== rb) return ra - rb;
      const oa = a.orderInGroup ?? 0;
      const ob = b.orderInGroup ?? 0;
      if (oa !== ob) return oa - ob;
      return b.priority - a.priority || b.estimatedPv - a.estimatedPv;
    });
  }

  const axes = [
    ...AXIS_ORDER,
    ...Array.from(axisMap.keys()).filter(
      (a) => !AXIS_ORDER.includes(a as ClusterAxis),
    ),
  ];

  return axes
    .filter((axis) => axisMap.has(axis))
    .map((axis) => {
      const kws = axisMap.get(axis)!;
      const middle = kws.filter((k) => k.articleRole === "hub");
      const longtail = kws.filter((k) => k.articleRole !== "hub");
      const label = CLUSTER_AXIS_LABELS[axis as ClusterAxis] ?? axis;
      return { gid: axis, label, kws, middle, longtail };
    });
}
