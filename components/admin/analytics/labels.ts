// ラベル定義（Nobilva アナリティクスで利用する固定文言のみ）

export const PAGE_LABELS: Record<string, string> = {
  "/ja/services/nobilva": "LP",
  "/ja/services/nobilva/diagnosis": "診断",
  "/ja/services/nobilva/for-teams": "チーム導入",
  "/ja/services/nobilva/how-it-works": "使い方",
  "/ja/services/nobilva/faq": "FAQ",
};

export const SECTION_LABELS: Record<string, string> = {
  hero: "ヒーロー",
  empathy: "共感",
  concerns: "6つの悩み",
  "three-pillars": "三本柱",
  "day-flow": "1日の流れ",
  results: "実績",
  "year-roadmap": "年間ロードマップ",
  pricing: "料金",
  comparison: "競合比較",
  "coach-message": "コーチメッセージ",
  "career-path": "進路ガイド",
  "team-referral": "チーム導入",
  faq: "FAQ",
  articles: "お役立ち記事",
  "final-cta": "最終CTA",
};

export const FUNNEL_LABELS: Record<string, string> = {
  start: "開始",
  basics: "基本情報",
  student: "生徒情報",
  concerns: "お悩み",
  career: "進路",
  source: "きっかけ",
  schedule: "日程選択",
  confirm: "確認",
  complete: "完了",
};

export const PAGE_FUNNEL_LABELS: Record<string, string> = {
  site_visit: "サイト訪問",
  lp_view: "LP 閲覧",
  blog_view: "ブログ閲覧",
  subpage_view: "サブページ閲覧",
  cta_click: "CTA クリック",
  diagnosis_page: "診断ページ到達",
  diagnosis_start: "診断開始",
  diagnosis_step: "ステップ",
  diagnosis_complete: "診断完了",
};

export const TARGET_PATH_OPTIONS = [
  { value: "/ja/services/nobilva", label: "Nobilva LP" },
  { value: "/ja/services/nobilva/diagnosis", label: "診断フォーム直行" },
  { value: "/ja/services/nobilva/for-teams", label: "チーム導入ページ" },
];
