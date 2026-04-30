import type { KeywordTier, WorkflowFlag, ArticleStatus, ClusterAxis } from "@/lib/keyword-manager";
import { BUSINESS_LABELS } from "@/lib/admin-constants";

export { BUSINESS_LABELS };

export const STATUS_LABELS = {
  active: "稼働中",
  paused: "一時停止",
  achieved: "達成",
} as const;

export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  achieved: "bg-blue-100 text-blue-800",
} as const;

/** V5: 記事ステータスラベル */
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  pending:      "未着手",
  planning:     "企画中",
  writing:      "執筆中",
  published:    "公開済み",
  needs_update: "要リライト",
  archived:     "アーカイブ",
};

/** V5: 記事ステータスカラー */
export const ARTICLE_STATUS_COLORS: Record<ArticleStatus, string> = {
  pending:      "bg-gray-100 text-gray-700",
  planning:     "bg-blue-100 text-blue-700",
  writing:      "bg-amber-100 text-amber-800",
  published:    "bg-green-100 text-green-700",
  needs_update: "bg-yellow-100 text-yellow-800",
  archived:     "bg-slate-100 text-slate-500",
};

/** V5: クラスター軸ラベル */
export const CLUSTER_AXIS_LABELS: Record<ClusterAxis, string> = {
  time:         "時間軸",
  career:       "進路軸",
  self:         "自己認識軸",
  relationship: "関係性軸",
  other:        "その他",
};

/** V5: クラスター軸カラー */
export const CLUSTER_AXIS_COLORS: Record<ClusterAxis, string> = {
  time:         "bg-sky-100 text-sky-700",
  career:       "bg-violet-100 text-violet-700",
  self:         "bg-emerald-100 text-emerald-700",
  relationship: "bg-rose-100 text-rose-700",
  other:        "bg-gray-100 text-gray-600",
};

/** @deprecated V4互換 */
export const WORKFLOW_FLAG_LABELS: Record<WorkflowFlag, string> = {
  pending: "待ち",
  to_create: "要作成",
  created: "作成済み",
  needs_update: "要更新",
  skip: "対応しない",
};

/** @deprecated V4互換 */
export const WORKFLOW_FLAG_COLORS: Record<WorkflowFlag, string> = {
  pending: "bg-gray-100 text-gray-700",
  to_create: "bg-amber-100 text-amber-800",
  created: "bg-green-100 text-green-700",
  needs_update: "bg-yellow-100 text-yellow-800",
  skip: "bg-slate-100 text-slate-600",
};

/** @deprecated V4互換 */
export const KEYWORD_TIER_LABELS: Record<KeywordTier, string> = {
  big: "ビッグ",
  middle: "ミドル",
  longtail: "ロングテール",
};
