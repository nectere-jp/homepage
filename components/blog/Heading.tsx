import { ReactNode } from "react";

// グローバルカウンターでユニークなIDを保証
let headingCounter = 0;

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}

export function Heading({ level, children }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // テキストコンテンツから ID を生成
  const text =
    typeof children === "string" ? children : extractTextFromChildren(children);

  // 日本語対応のID生成
  let id = text
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, "") // 日本語を保持
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // 先頭と末尾のハイフンを削除

  // IDが空の場合はカウンターを使用
  if (!id) {
    id = `heading-${headingCounter++}`;
  }

  return <Tag id={id}>{children}</Tag>;
}

function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }

  if (children && typeof children === "object" && "props" in children) {
    return extractTextFromChildren((children as any).props.children);
  }

  return "";
}
