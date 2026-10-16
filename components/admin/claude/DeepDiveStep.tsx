"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LuSparkles } from "react-icons/lu";

interface DeepDiveStepProps {
  deepDiveText: string;
  userFeedbackOnDeepDive: string;
  onUserFeedbackChange: (v: string) => void;
  axisLabel: string;
  roleLabel: string;
  readerLabel: string;
  loading: boolean;
  primaryKeyword: string;
  onBack: () => void;
  onGenerateDeepDive: () => void;
  onGenerateOutline: () => void;
}

export function DeepDiveStep({
  deepDiveText,
  userFeedbackOnDeepDive,
  onUserFeedbackChange,
  axisLabel,
  roleLabel,
  readerLabel,
  loading,
  primaryKeyword,
  onBack,
  onGenerateDeepDive,
  onGenerateOutline,
}: DeepDiveStepProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        ステップ 2: 検索意図・マズロー深掘り
      </h2>
      {/* 記事設定サマリ */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">{axisLabel}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">{roleLabel}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">{readerLabel}</span>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        5W1Hとマズローの欲求五段階に基づく深掘り結果です。必要に応じて補足・修正を追記してからアウトラインを生成してください。
      </p>

      {deepDiveText ? (
        <>
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">深掘り結果</h3>
            <div className="prose prose-sm max-w-none text-gray-700 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{deepDiveText}</ReactMarkdown>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-base font-bold text-gray-900 mb-2">
              補足・修正（任意）
            </label>
            <textarea
              value={userFeedbackOnDeepDive}
              onChange={(e) => onUserFeedbackChange(e.target.value)}
              placeholder="深掘り結果へのコメントや修正したい点を入力。アウトライン設計に反映されます。"
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              戻る
            </button>
            <button
              onClick={onGenerateOutline}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
            >
              <LuSparkles className="w-5 h-5" />
              {loading ? "AI生成中..." : "アウトラインを生成"}
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            戻る
          </button>
          <button
            onClick={onGenerateDeepDive}
            disabled={loading || !primaryKeyword}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <LuSparkles className="w-5 h-5" />
            {loading ? "生成中..." : "深掘りを生成"}
          </button>
        </div>
      )}
    </div>
  );
}
