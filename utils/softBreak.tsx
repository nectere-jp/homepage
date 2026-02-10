import React from 'react';

/**
 * テキスト内のゼロ幅スペース（\u200B）をそのまま返す関数
 * U+200B は Unicode の改行許可ポイントとして Safari 含む各ブラウザで扱われるため、
 * <wbr> に変換せず文字列のまま返す（Safari で keep-all + wbr が効かない問題の回避）
 * @param text 変換するテキストまたはReact要素
 * @returns ゼロ幅スペースを含むテキスト、または再帰処理されたReact要素
 */
export function addSoftBreaks(
  text: string | React.ReactNode
): React.ReactNode {
  // React要素の場合は文字列に変換して処理
  if (typeof text !== 'string') {
    // React要素の場合は、そのまま返すか、再帰的に処理
    if (React.isValidElement(text)) {
      // 子要素を再帰的に処理
      if (typeof text.props.children === 'string') {
        return React.cloneElement(text, {
          ...text.props,
          children: addSoftBreaks(text.props.children),
        });
      } else if (Array.isArray(text.props.children)) {
        return React.cloneElement(text, {
          ...text.props,
          children: text.props.children.map((child: React.ReactNode, index: number) => (
            <React.Fragment key={index}>{addSoftBreaks(child)}</React.Fragment>
          )),
        });
      }
    }
    return text;
  }

  // 文字列の場合: ゼロ幅スペースはそのまま返す（Safari で改行が効くように）
  return text;
}
