"use client";

import { LuSparkles } from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";
import { BlogImageSection } from "@/components/admin/BlogImageSection";
import type { ClusterAxis } from "@/lib/blog";

interface OutlineStepProps {
  outline: any;
  mainKeywordRepresentative: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  axisLabel: string;
  roleLabel: string;
  readerLabel: string;
  clusterAxis: ClusterAxis;
  content: string;

  revisionRequest: string;
  onRevisionRequestChange: (v: string) => void;

  loading: boolean;
  onBack: () => void;
  onGenerateContent: () => void;
  onUpdateOutline: () => void;
}

export function OutlineStep({
  outline,
  mainKeywordRepresentative,
  primaryKeyword,
  secondaryKeywords,
  axisLabel,
  roleLabel,
  readerLabel,
  clusterAxis,
  content,
  revisionRequest,
  onRevisionRequestChange,
  loading,
  onBack,
  onGenerateContent,
  onUpdateOutline,
}: OutlineStepProps) {
  if (!outline) return null;

  return (
    <>
      {/* キーワード＋記事設定バッジ */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(mainKeywordRepresentative || primaryKeyword) && (
          <Chip variant="keyword" size="lg">
            {mainKeywordRepresentative || primaryKeyword}
          </Chip>
        )}
        {secondaryKeywords &&
          secondaryKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
            .map((keyword: string, index: number) => (
              <Chip key={index} variant="keyword-secondary" size="lg">
                {keyword}
              </Chip>
            ))}
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium self-center">{axisLabel}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium self-center">{roleLabel}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium self-center">{readerLabel}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: アウトライン確認 */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            ステップ 3: アウトラインを確認
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">タイトル</h3>
              <p className="text-lg">{outline.title}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">導入文</h3>
              <p className="text-gray-700">{outline.introduction}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">セクション構成</h3>
              <div className="space-y-3">
                {outline.sections.map((section: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">{section.heading}</h4>
                    <ul className="space-y-1 ml-4">
                      {section.subheadings.map((sub: string, subIndex: number) => (
                        <li key={subIndex} className="text-sm text-gray-700">• {sub}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">まとめ</h3>
              <p className="text-gray-700">{outline.conclusion}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              戻る
            </button>
            <button
              onClick={onGenerateContent}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
            >
              <LuSparkles className="w-5 h-5" />
              {loading ? "AI執筆中..." : "本文を生成"}
            </button>
          </div>
        </div>

        {/* 右側: アウトライン修正 */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-soft-lg p-6 h-fit">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <LuSparkles className="w-5 h-5 text-gray-600" />
            アウトラインを修正
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            修正したい点を入力してください。AIがアウトラインを更新します。
          </p>
          <textarea
            value={revisionRequest}
            onChange={(e) => onRevisionRequestChange(e.target.value)}
            placeholder="例: タイトルをもっと具体的にしてください。セクション3に実例を追加してください。"
            className="w-full min-h-[200px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
          />
          <button
            onClick={onUpdateOutline}
            disabled={loading || !revisionRequest.trim()}
            className="w-full mt-4 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
          >
            <LuSparkles className="w-5 h-5" />
            {loading ? "更新中..." : "アウトラインを更新"}
          </button>
        </div>
      </div>

      {/* Nanobanana 画像（サムネプロンプト生成用。本文画像は記事保存後に編集画面で操作） */}
      <div className="mt-6">
        <BlogImageSection
          content={content}
          topic={outline?.title || primaryKeyword}
          clusterAxis={clusterAxis}
          mode="preview"
        />
      </div>
    </>
  );
}
