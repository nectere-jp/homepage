import type { ClusterAxis, ArticleRole, TargetReader } from "@/lib/blog";

export type ArticleStep = "keywords" | "deepDive" | "outline" | "content";

export type Volume = "light" | "standard" | "heavy";

export interface DraftData {
  step: ArticleStep;
  primaryKeyword: string;
  secondaryKeywords: string;
  coOccurrenceWords: string;
  clusterAxis: ClusterAxis;
  articleRole: ArticleRole;
  targetReader: TargetReader;
  volume: Volume;
  hubSlug: string;
  deepDiveText: string;
  userFeedbackOnDeepDive: string;
  outline: any;
  content: string;
}

export const STORAGE_KEY = "claude-article-draft";

export const CLUSTER_AXIS_OPTIONS: { value: ClusterAxis; label: string }[] = [
  { value: "time",         label: "時間軸" },
  { value: "career",       label: "進路軸" },
  { value: "self",         label: "自己認識軸" },
  { value: "relationship", label: "関係性軸" },
  { value: "other",        label: "その他" },
];

export const ARTICLE_ROLE_OPTIONS: { value: ArticleRole; label: string; desc: string }[] = [
  { value: "hub",   label: "ハブ記事",  desc: "軸のエントリーポイント（6000-8000字）" },
  { value: "child", label: "子記事",    desc: "特定キーワードに絞った記事（2000-5000字）" },
];

export const TARGET_READER_OPTIONS: { value: TargetReader; label: string }[] = [
  { value: "parent",  label: "保護者向け" },
  { value: "student", label: "生徒向け" },
  { value: "both",    label: "両方向け" },
];

export const VOLUME_OPTIONS: { value: Volume; label: string }[] = [
  { value: "light",    label: "軽量（2000〜3000字）" },
  { value: "standard", label: "標準（3000〜5000字）" },
  { value: "heavy",    label: "重量（6000〜8000字）" },
];
