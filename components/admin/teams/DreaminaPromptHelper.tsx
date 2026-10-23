"use client";

import { useState } from "react";

const DREAMINA_PROMPT = `1枚目の人物に、2枚目のユニフォームを適用してください。背景は透明。`;

const REFERENCE_IMAGE_PATH = "/images/nobilva/hero_transparent.png";

export const DreaminaPromptHelper = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DREAMINA_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <details className="rounded-lg bg-gray-50 border border-gray-200 group">
      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-gray-700 select-none flex items-center gap-1.5">
        <span className="text-gray-400 group-open:rotate-90 transition-transform">▶</span>
        dreamina で生成する
      </summary>
      <div className="px-3 pb-3 pt-1 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-xs font-medium rounded hover:bg-gray-100"
          >
            {copied ? "✓ コピー済" : "プロンプトをコピー"}
          </button>
          <a
            href={REFERENCE_IMAGE_PATH}
            download="hero_reference.png"
            className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-xs font-medium rounded hover:bg-gray-100"
          >
            参照画像をダウンロード
          </a>
          <span className="text-[11px] text-gray-500">
            + チームのユニフォーム写真 を dreamina に渡す
          </span>
        </div>
        <pre className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap font-mono leading-relaxed">
{DREAMINA_PROMPT}
        </pre>
      </div>
    </details>
  );
};
