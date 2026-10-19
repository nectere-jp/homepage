"use client";

import { LuTriangleAlert } from "react-icons/lu";

interface ConflictWarningsProps {
  conflicts: any[];
  intentGroupConflicts: any[];
  cannibalizeRisks: any[];
}

export function ConflictWarnings({
  conflicts: _conflicts,
  intentGroupConflicts: _intentGroupConflicts,
  cannibalizeRisks,
}: ConflictWarningsProps) {
  if (!cannibalizeRisks || cannibalizeRisks.length === 0) return null;

  const highRisks = cannibalizeRisks.filter((r: any) => r.risk === "high");
  const mediumRisks = cannibalizeRisks.filter((r: any) => r.risk === "medium");
  const siblings = cannibalizeRisks.filter((r: any) => r.type === "sibling" && r.risk === "low");

  return (
    <div className="space-y-3">
      {/* 高リスク: 完全一致 or 類似度75%以上 */}
      {highRisks.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
            <LuTriangleAlert className="w-5 h-5" />
            カニバリ高リスク（{highRisks.length}件）
          </h4>
          <ul className="space-y-2">
            {highRisks.map((r: any) => (
              <li key={r.groupId} className="text-sm text-red-700 border-l-2 border-red-300 pl-3">
                <span className="font-medium">「{r.keyword}」</span>
                {r.type === "exact" && <span className="ml-1 text-xs bg-red-100 px-1.5 py-0.5 rounded">完全一致</span>}
                {r.type === "similar" && <span className="ml-1 text-xs bg-red-100 px-1.5 py-0.5 rounded">類似度 {Math.round((r.similarity ?? 0) * 100)}%</span>}
                {r.assignedArticles.length > 0 ? (
                  <span className="block mt-1 text-xs text-red-600">
                    記事: {r.assignedArticles.map((slug: string) => r.articleTitles?.[slug] ?? slug).join(", ")}
                    {r.articleStatus && <span className="ml-1 opacity-75">({r.articleStatus})</span>}
                  </span>
                ) : (
                  <span className="block mt-1 text-xs text-red-600">
                    記事未作成（{r.articleStatus ?? "pending"}）— 同時に計画中の可能性あり
                  </span>
                )}
                {r.sameHub && <span className="block text-xs text-red-500 mt-0.5">同じハブ配下 — キーワードの差別化が必要</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 中リスク: 類似度50-74% */}
      {mediumRisks.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <LuTriangleAlert className="w-5 h-5" />
            類似キーワード注意（{mediumRisks.length}件）
          </h4>
          <ul className="space-y-2">
            {mediumRisks.map((r: any) => (
              <li key={r.groupId} className="text-sm text-amber-700 border-l-2 border-amber-300 pl-3">
                <span className="font-medium">「{r.keyword}」</span>
                {r.similarity != null && <span className="ml-1 text-xs bg-amber-100 px-1.5 py-0.5 rounded">類似度 {Math.round(r.similarity * 100)}%</span>}
                {r.assignedArticles.length > 0 ? (
                  <span className="block mt-1 text-xs text-amber-600">
                    記事: {r.assignedArticles.map((slug: string) => r.articleTitles?.[slug] ?? slug).join(", ")}
                  </span>
                ) : (
                  <span className="block mt-1 text-xs text-amber-600">記事未作成（{r.articleStatus ?? "pending"}）</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 兄弟記事一覧 */}
      {siblings.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-bold text-blue-800 mb-2">
            同じハブ配下の兄弟キーワード（{siblings.length}件）
          </h4>
          <ul className="space-y-1">
            {siblings.map((r: any) => (
              <li key={r.groupId} className="text-sm text-blue-700 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  r.articleStatus === "published" ? "bg-green-500" :
                  r.articleStatus === "writing" ? "bg-yellow-500" : "bg-gray-400"
                }`} />
                <span>「{r.keyword}」</span>
                <span className="text-xs text-blue-500">
                  {r.articleStatus === "published" ? "公開済" :
                   r.articleStatus === "writing" ? "執筆中" : "未着手"}
                </span>
                {r.assignedArticles.length > 0 && (
                  <span className="text-xs text-blue-400 truncate">
                    {r.assignedArticles.map((slug: string) => r.articleTitles?.[slug] ?? slug).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
