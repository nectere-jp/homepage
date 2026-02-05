import React from 'react';

const ZERO_WIDTH_SPACE = '\u200B';

/**
 * テキスト内のゼロ幅スペース（\u200B）を<wbr>タグに変換する関数
 * これにより、改行が必要な場合にその位置で改行できるようになります
 * @param text 変換するテキストまたはReact要素
 * @returns ゼロ幅スペースが<wbr>タグに変換されたReact要素
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

  // 文字列の場合
  if (!text.includes(ZERO_WIDTH_SPACE)) {
    return text;
  }

  // ゼロ幅スペースで分割して、<wbr>タグを挿入
  const parts = text.split(ZERO_WIDTH_SPACE);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      elements.push(<React.Fragment key={`text-${i}`}>{parts[i]}</React.Fragment>);
    }
    if (i < parts.length - 1) {
      elements.push(<wbr key={`wbr-${i}`} />);
    }
  }

  return <>{elements}</>;
}
