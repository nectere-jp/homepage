import type { KeywordTier, WorkflowFlag } from "@/lib/keyword-manager";
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

export const WORKFLOW_FLAG_LABELS: Record<WorkflowFlag, string> = {
  pending: "待ち",
  to_create: "要作成",
  created: "作成済み",
  needs_update: "要更新",
  skip: "対応しない",
};

export const WORKFLOW_FLAG_COLORS: Record<WorkflowFlag, string> = {
  pending: "bg-gray-100 text-gray-700",
  to_create: "bg-amber-100 text-amber-800",
  created: "bg-green-100 text-green-700",
  needs_update: "bg-yellow-100 text-yellow-800",
  skip: "bg-slate-100 text-slate-600",
};

export const KEYWORD_TIER_LABELS: Record<KeywordTier, string> = {
  big: "ビッグ",
  middle: "ミドル",
  longtail: "ロングテール",
};
