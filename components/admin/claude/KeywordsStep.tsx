"use client";

import { LuSparkles } from "react-icons/lu";
import { KeywordSelector } from "@/components/admin/KeywordSelector";
import type { BusinessType, ClusterAxis, ArticleRole, TargetReader } from "@/lib/blog";
import type { Volume } from "./constants";
import {
  CLUSTER_AXIS_OPTIONS,
  ARTICLE_ROLE_OPTIONS,
  TARGET_READER_OPTIONS,
  VOLUME_OPTIONS,
} from "./constants";
import { ConflictWarnings } from "./ConflictWarnings";

interface KeywordsStepProps {
  // keyword state
  primaryKeyword: string;
  secondaryKeywords: string;
  coOccurrenceWords: string;
  onKeywordSelect: (primary: string, secondary: string[], relatedBusiness: BusinessType[]) => void;
  onCoOccurrenceChange: (v: string) => void;

  // conflict state
  conflicts: any[];
  intentGroupConflicts: any[];
  cannibalizeRisks: any[];

  // article config
  clusterAxis: ClusterAxis;
  onClusterAxisChange: (v: ClusterAxis) => void;
  articleRole: ArticleRole;
  onArticleRoleChange: (v: ArticleRole) => void;
  targetReader: TargetReader;
  onTargetReaderChange: (v: TargetReader) => void;
  volume: Volume;
  onVolumeChange: (v: Volume) => void;
  hubSlug: string;
  onHubSlugChange: (v: string) => void;
  selectedAuthor: string;
  onSelectedAuthorChange: (v: string) => void;

  // actions
  loading: boolean;
  onGenerateDeepDive: () => void;
}

export function KeywordsStep({
  primaryKeyword,
  secondaryKeywords: _secondaryKeywords,
  coOccurrenceWords,
  onKeywordSelect,
  onCoOccurrenceChange,
  conflicts,
  intentGroupConflicts,
  cannibalizeRisks,
  clusterAxis,
  onClusterAxisChange,
  articleRole,
  onArticleRoleChange,
  targetReader,
  onTargetReaderChange,
  volume,
  onVolumeChange,
  hubSlug,
  onHubSlugChange,
  selectedAuthor,
  onSelectedAuthorChange,
  loading,
  onGenerateDeepDive,
}: KeywordsStepProps) {
  return (
    <div className="space-y-6">
      {/* キーワード選択カード */}
      <div className="bg-white rounded-2xl shadow-soft-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ステップ 1: キーワードを選択
        </h2>
        <div className="space-y-4">
          <KeywordSelector
            onSelect={onKeywordSelect}
            initialKeyword={primaryKeyword}
          />

          {/* カニバリチェック */}
          <ConflictWarnings
            conflicts={conflicts}
            intentGroupConflicts={intentGroupConflicts}
            cannibalizeRisks={cannibalizeRisks}
          />

          {/* 共起語 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              共起語（任意）
            </label>
            <p className="text-sm text-gray-600 mb-2">
              ラッコキーワード等で得た、読者が一緒に求めやすい語をカンマまたは改行で入力
            </p>
            <textarea
              value={coOccurrenceWords}
              onChange={(e) => onCoOccurrenceChange(e.target.value)}
              placeholder="例: 両立, 時間, スケジュール"
              className="w-full min-h-[80px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
            />
          </div>
        </div>
      </div>

      {/* 記事設定カード（4軸クラスター） */}
      <div className="bg-white rounded-2xl shadow-soft-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">記事設定</h2>
        <p className="text-sm text-gray-500 mb-5">
          キーワード選択時に自動入力されます。必要に応じて変更してください。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* クラスター軸 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              クラスター軸
            </label>
            <div className="flex flex-wrap gap-2">
              {CLUSTER_AXIS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onClusterAxisChange(opt.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    clusterAxis === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 記事種別 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              記事種別
            </label>
            <div className="flex gap-3">
              {ARTICLE_ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onArticleRoleChange(opt.value);
                    // ハブ記事に切り替えたら自動で重量に
                    if (opt.value === "hub") onVolumeChange("heavy");
                  }}
                  className={`flex-1 px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                    articleRole === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 対象読者 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              対象読者
            </label>
            <div className="flex gap-2">
              {TARGET_READER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTargetReaderChange(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    targetReader === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 文字数ボリューム */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              文字数ボリューム
            </label>
            <div className="flex flex-col gap-2">
              {VOLUME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onVolumeChange(opt.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                    volume === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ハブ記事スラッグ（子記事のみ表示） */}
        {articleRole === "child" && (
          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              ハブ記事スラッグ（任意）
            </label>
            <p className="text-xs text-gray-500 mb-2">
              この子記事をリンクさせるハブ記事の slug を入力すると、内部リンクが自動挿入されます
            </p>
            <input
              type="text"
              value={hubSlug}
              onChange={(e) => onHubSlugChange(e.target.value)}
              placeholder="例: baseball-study-time-axis-hub"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        {/* 著者 */}
        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            著者
          </label>
          <select
            value={selectedAuthor}
            onChange={(e) => onSelectedAuthorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="中村龍人">中村龍人</option>
            <option value="Nectere編集部">Nectere編集部</option>
          </select>
        </div>
      </div>

      {/* 生成ボタン */}
      <button
        onClick={onGenerateDeepDive}
        disabled={loading || !primaryKeyword}
        className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
      >
        <LuSparkles className="w-5 h-5" />
        {loading ? "AI生成中..." : "深掘りを生成"}
      </button>
    </div>
  );
}
