/**
 * ComparisonCautionBlock - 比較表の下の注意・ポイント案内
 *
 * オンライン個別の料金表示に関する注意と、比較時のポイントを
 * 見出し・説明文・チェックリストで表示する。
 */

import { addSoftBreaks } from "@/utils/softBreak";

export interface ComparisonCautionBlockProps {
  heading: string;
  paragraph: string;
  items: string[];
}

function CheckIcon() {
  return (
    <span className="flex flex-shrink-0 w-6 h-6 items-center justify-center text-nobilva-accent" aria-hidden>
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 角丸の四角枠 */}
        <rect x="2" y="2" width="20" height="20" rx="3" />
        {/* チェック（右上端が枠から少しはみ出す） */}
        <path d="M6 13 L10 17 L23 4" />
      </svg>
    </span>
  );
}

export function ComparisonCautionBlock({
  heading,
  paragraph,
  items,
}: ComparisonCautionBlockProps) {
  return (
    <div className="mt-10 md:mt-14 max-w-3xl mx-auto">
      <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-4 md:mb-5">
        <span aria-hidden>⚠️ </span>
        {addSoftBreaks(heading)}
        <span aria-hidden> ⚠️</span>
      </h3>
      <p className="text-sm md:text-base text-gray-700 text-center leading-relaxed mb-6 md:mb-8 whitespace-pre-line break-keep">
        {addSoftBreaks(paragraph)}
      </p>
      <div className="rounded-2xl bg-nobilva-light/60 border border-nobilva-main/20 p-5 md:p-6 max-w-xl mx-auto">
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 items-center">
              <CheckIcon />
              <span className="text-sm md:text-base text-gray-800 whitespace-pre-line flex-1 min-w-0">
                {addSoftBreaks(item)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
