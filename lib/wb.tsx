import React from "react";

/**
 * "/" で区切られた各フレーズを whitespace-nowrap span で囲む。
 * フレーズ間でのみ改行が発生し、フレーズ内での改行を防ぐ。
 *
 * 例: wb("料金にご納得いただけたら、/一度ご相談ください。")
 */
export function wb(text: string): React.ReactNode {
  const parts = text.split("/");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <span key={i} className="whitespace-nowrap">
      {part}
    </span>
  ));
}
