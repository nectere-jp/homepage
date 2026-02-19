"use client";

import { LuMenu, LuChevronLeft } from "react-icons/lu";
import type { MasterKeyword } from "./types";
import type { KeywordTier } from "@/lib/keyword-manager";

interface KeywordMoveMenuProps {
  kw: MasterKeyword;
  onDelete: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onTierChange: (keyword: string, newTier: KeywordTier) => void;
  onMoveToMiddle: (
    keyword: string,
    targetMainKeyword: string,
    targetGid: string,
  ) => void;
  onMergeWithKeyword: (keyword: string, targetKeyword: string) => void;
  middleKeywords: MasterKeyword[];
  mergeTargetKeywords: MasterKeyword[];
  /** 同じミドル（同趣旨グループ）内のクラスター一覧。クラスター同士で同趣旨にまとめる候補 */
  clusterKeywordsInSameMiddle?: MasterKeyword[];
  onMergeClusterWithCluster?: (
    sourceKeyword: string,
    targetKeyword: string,
  ) => void;
}

const isCluster = (k: MasterKeyword) =>
  k.keywordTier === "longtail" && (k.pillarSlug ?? null) != null;

export function KeywordMoveMenu({
  kw,
  onDelete,
  isOpen,
  onToggle,
  onClose,
  onTierChange,
  onMoveToMiddle,
  onMergeWithKeyword,
  middleKeywords,
  mergeTargetKeywords,
  clusterKeywordsInSameMiddle = [],
  onMergeClusterWithCluster,
}: KeywordMoveMenuProps) {
  const showClusterMerge =
    isCluster(kw) &&
    clusterKeywordsInSameMiddle.length > 0 &&
    typeof onMergeClusterWithCluster === "function";
  const clusterCandidates = clusterKeywordsInSameMiddle.filter(
    (m) => m.keyword !== kw.keyword,
  );
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
        title="移動・削除"
      >
        <LuMenu className="w-4 h-4" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
          <div className="absolute right-0 top-full z-40 mt-1 bg-white border rounded-lg shadow-lg py-1 w-max min-w-[140px]">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600"
              onClick={() => {
                onClose();
                onDelete();
              }}
            >
              削除
            </button>
            <div className="border-t border-gray-200" />
            {kw.keywordTier === "longtail" && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => onTierChange(kw.keyword, "middle")}
              >
                ミドルに昇格
              </button>
            )}
            {(kw.keywordTier === "middle" || kw.keywordTier === "big") && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => onTierChange(kw.keyword, "longtail")}
              >
                クラスターに降格
              </button>
            )}
            <div className="border-t border-gray-200 relative group/merge">
              <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-default">
                <LuChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                同趣旨でまとめる
              </div>
              <div className="absolute right-full top-0 mr-0.5 py-1 bg-white border rounded-lg shadow-lg min-w-[180px] max-w-[280px] max-h-[240px] overflow-y-auto opacity-0 invisible group-hover/merge:opacity-100 group-hover/merge:visible transition-[opacity,visibility] z-50">
                {mergeTargetKeywords
                  .filter((m) => m.keyword !== kw.keyword)
                  .slice(0, 15)
                  .map((m) => (
                    <button
                      key={m.keyword}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 truncate"
                      onClick={() => {
                        onClose();
                        onMergeWithKeyword(kw.keyword, m.keyword);
                      }}
                    >
                      {m.keyword}
                    </button>
                  ))}
                {mergeTargetKeywords.filter((m) => m.keyword !== kw.keyword)
                  .length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    まとめる相手なし
                  </div>
                )}
              </div>
            </div>
            {showClusterMerge && (
              <div className="border-t border-gray-200 relative group/cluster">
                <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-default">
                  <LuChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                  クラスター同士で同趣旨にまとめる
                </div>
                <div className="absolute right-full top-0 mr-0.5 py-1 bg-white border rounded-lg shadow-lg min-w-[180px] max-w-[280px] max-h-[240px] overflow-y-auto opacity-0 invisible group-hover/cluster:opacity-100 group-hover/cluster:visible transition-[opacity,visibility] z-50">
                  {clusterCandidates.slice(0, 15).map((m) => (
                    <button
                      key={m.keyword}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 truncate"
                      onClick={() => {
                        onClose();
                        onMergeClusterWithCluster?.(kw.keyword, m.keyword);
                      }}
                    >
                      {m.keyword}
                    </button>
                  ))}
                  {clusterCandidates.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      同じミドル内に他クラスターなし
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="border-t border-gray-200 relative group/move">
              <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-default">
                <LuChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                別のミドルに移動
              </div>
              <div className="absolute right-full top-0 mr-0.5 py-1 bg-white border rounded-lg shadow-lg min-w-[180px] max-w-[280px] max-h-[240px] overflow-y-auto opacity-0 invisible group-hover/move:opacity-100 group-hover/move:visible transition-[opacity,visibility] z-50">
                {middleKeywords
                  .filter((m) => m.keyword !== kw.keyword)
                  .slice(0, 15)
                  .map((m) => (
                    <button
                      key={m.keyword}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 truncate"
                      onClick={() =>
                        onMoveToMiddle(
                          kw.keyword,
                          m.keyword,
                          m.groupId ?? m.intentGroupId ?? "",
                        )
                      }
                    >
                      {m.keyword}
                    </button>
                  ))}
                {middleKeywords.filter((m) => m.keyword !== kw.keyword)
                  .length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    移動先なし
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
