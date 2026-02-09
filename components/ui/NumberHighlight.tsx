"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { addSoftBreaks } from "@/utils/softBreak";

interface NumberHighlightProps {
  text: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * テキスト内の数字を強調表示するコンポーネント
 * 数字とその後の単位（%、h、点、位、ヶ月、→数字など）を含むパターンを検出
 */
export function NumberHighlight({
  text,
  className,
  highlightClassName = "text-2xl md:text-3xl font-bold text-nobilva-accent inline",
}: NumberHighlightProps) {
  // 改行を処理: \nを<br />に変換
  const lines = text.split("\n");

  return (
    <span className={className}>
      {lines.map((line, lineIndex) => {
        // 数字とその後の単位（%、h、点、位、ヶ月、→数字など）を含むパターンを検出
        // 例: "54%", "13ヶ月", "23点", "500位", "3h→14.5h", "470%"
        const pattern =
          /(\d+(?:\.\d+)?(?:%|ヶ月|点|位|h(?:\s*→\s*\d+(?:\.\d+)?h)?))/g;
        const parts: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        let match;
        let key = 0;

        while ((match = pattern.exec(line)) !== null) {
          // マッチ前のテキストを追加（addSoftBreaksを適用）
          if (match.index > lastIndex) {
            const beforeText = line.substring(lastIndex, match.index);
            parts.push(
              <React.Fragment key={`before-${key}`}>
                {addSoftBreaks(beforeText)}
              </React.Fragment>
            );
          }
          // マッチした数字部分を強調して追加（左右にスペースを追加、改行しない）
          parts.push(
            <span
              key={key++}
              className={highlightClassName}
              style={{ whiteSpace: "nowrap" }}
            >
              {" "}
              {match[0]}{" "}
            </span>,
          );
          lastIndex = pattern.lastIndex;
        }

        // 残りのテキストを追加（addSoftBreaksを適用）
        if (lastIndex < line.length) {
          const remainingText = line.substring(lastIndex);
          parts.push(
            <React.Fragment key={`remaining-${key}`}>
              {addSoftBreaks(remainingText)}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {parts.length > 0 ? <>{parts}</> : line}
          </React.Fragment>
        );
      })}
    </span>
  );
}
