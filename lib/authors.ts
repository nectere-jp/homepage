/** 管理画面の著者選択で使う author 一覧 */
export const AUTHOR_OPTIONS = [
  { value: "中村龍人", label: "中村龍人" },
  { value: "Nectere編集部", label: "Nectere編集部" },
] as const;

export type AuthorValue = (typeof AUTHOR_OPTIONS)[number]["value"];

export const DEFAULT_AUTHOR: AuthorValue = "中村龍人";
