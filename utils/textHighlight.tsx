import React from 'react';

interface HighlightConfig {
  text: string;
  color?: string;
}

/**
 * テキスト内の指定された文字列をハイライトする汎用関数
 * @param text ハイライトする元のテキスト
 * @param highlightConfig ハイライト設定（翻訳ファイルから取得）
 * @param defaultColor デフォルトのカラークラス（highlightConfigにcolorがない場合）
 * @returns ハイライトされたReact要素
 */
export function highlightText(
  text: string,
  highlightConfig: HighlightConfig | null | undefined,
  defaultColor: string = 'text-nobilva-accent'
): React.ReactNode {
  if (!highlightConfig || !highlightConfig.text) {
    return text;
  }

  const highlightText = highlightConfig.text;
  const colorClass = highlightConfig.color 
    ? `text-${highlightConfig.color}` 
    : defaultColor;

  // テキストを分割
  const parts = text.split(highlightText);
  
  if (parts.length < 2) {
    // ハイライト対象が見つからない場合はそのまま返す
    return text;
  }

  // ハイライト部分を含めて要素を構築
  const elements: React.ReactNode[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      elements.push(<React.Fragment key={`text-${i}`}>{parts[i]}</React.Fragment>);
    }
    if (i < parts.length - 1) {
      elements.push(
        <span key={`highlight-${i}`} className={colorClass}>
          {highlightText}
        </span>
      );
    }
  }

  return <>{elements}</>;
}
