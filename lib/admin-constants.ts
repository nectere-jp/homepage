import type { BusinessType } from "./blog";

/** 事業種別の表示ラベル（管理画面共通） */
export const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: "翻訳",
  "web-design": "Web制作",
  print: "印刷",
  nobilva: "Nobilva",
  teachit: "Teachit",
};

/** お問い合わせ種別ラベル（管理画面共通） */
export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  translation: "翻訳について",
  webDesign: "ホームページ制作について",
  print: "印刷物制作について",
  nobilva: "Nobilva（学習支援）について",
  "nobilva-diagnosis": "Nobilva 無料学習面談",
  teachit: "Teach It（教育アプリ）について",
  interview: "取材のご依頼",
  other: "その他",
};

/** お問い合わせ対応ステータスラベル */
export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  new: "新規",
  in_progress: "対応中",
  resolved: "完了",
};

/** お問い合わせ対応ステータスカラー */
export const INQUIRY_STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-500 text-white",
  in_progress: "bg-yellow-500 text-white",
  resolved: "bg-green-500 text-white",
};
