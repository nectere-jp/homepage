"use client";

import { useState, useEffect } from "react";
import { LuMenu, LuChevronDown, LuChevronUp } from "react-icons/lu";
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
  /** 同趣旨に他キーワードがいる場合のみ true（同趣旨から切り離すを表示） */
  canDetachFromSameIntent?: boolean;
  onDetachFromSameIntent?: (keyword: string) => void;
}

type Submenu = "merge" | "clusterMerge" | "move";

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
  canDetachFromSameIntent = false,
  onDetachFromSameIntent,
}: KeywordMoveMenuProps) {
  const [openSubmenu, setOpenSubmenu] = useState<Submenu | null>(null);

  // メニューが閉じたらサブメニューもリセット
  useEffect(() => {
    if (!isOpen) setOpenSubmenu(null);
  }, [isOpen]);

  const toggleSubmenu = (name: Submenu) =>
    setOpenSubmenu((prev) => (prev === name ? null : name));

  const showClusterMerge =
    isCluster(kw) &&
    clusterKeywordsInSameMiddle.length > 0 &&
    typeof onMergeClusterWithCluster === "function";
  const clusterCandidates = clusterKeywordsInSameMiddle.filter(
    (m) => m.keyword !== kw.keyword,
  );
  const mergeTargets = mergeTargetKeywords.filter(
    (m) => m.keyword !== kw.keyword,
  );
  const moveTargets = middleKeywords.filter((m) => m.keyword !== kw.keyword);

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
        <div className="absolute right-0 top-full z-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-64">
          {/* 削除 */}
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

          {/* 昇格 / 降格 */}
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

          {/* 同趣旨から切り離す */}
          {canDetachFromSameIntent && onDetachFromSameIntent && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => {
                onClose();
                onDetachFromSameIntent(kw.keyword);
              }}
            >
              同趣旨から切り離す
            </button>
          )}

          <div className="border-t border-gray-200" />

          {/* 同趣旨でまとめる（アコーディオン） */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => toggleSubmenu("merge")}
          >
            <span>同趣旨でまとめる</span>
            {openSubmenu === "merge" ? (
              <LuChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            ) : (
              <LuChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
          </button>
          {openSubmenu === "merge" && (
            <div className="border-t border-gray-100 bg-gray-50 max-h-48 overflow-y-auto">
              {mergeTargets.length > 0 ? (
                mergeTargets.slice(0, 20).map((m) => (
                  <button
                    key={m.keyword}
                    type="button"
                    className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-200 truncate block"
                    onClick={() => {
                      onClose();
                      onMergeWithKeyword(kw.keyword, m.keyword);
                    }}
                    title={m.keyword}
                  >
                    {m.keyword}
                  </button>
                ))
              ) : (
                <p className="px-4 py-2 text-xs text-gray-400">
                  まとめる相手なし
                </p>
              )}
            </div>
          )}

          {/* クラスター同士で同趣旨にまとめる（アコーディオン） */}
          {showClusterMerge && (
            <>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => toggleSubmenu("clusterMerge")}
              >
                <span className="leading-tight">
                  クラスター同士で
                  <br />
                  同趣旨にまとめる
                </span>
                {openSubmenu === "clusterMerge" ? (
                  <LuChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                ) : (
                  <LuChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
              </button>
              {openSubmenu === "clusterMerge" && (
                <div className="border-t border-gray-100 bg-gray-50 max-h-48 overflow-y-auto">
                  {clusterCandidates.length > 0 ? (
                    clusterCandidates.slice(0, 20).map((m) => (
                      <button
                        key={m.keyword}
                        type="button"
                        className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-200 truncate block"
                        onClick={() => {
                          onClose();
                          onMergeClusterWithCluster?.(kw.keyword, m.keyword);
                        }}
                        title={m.keyword}
                      >
                        {m.keyword}
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-xs text-gray-400">
                      同じミドル内に他クラスターなし
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* 別のミドルに移動（アコーディオン） */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => toggleSubmenu("move")}
          >
            <span>別のミドルに移動</span>
            {openSubmenu === "move" ? (
              <LuChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            ) : (
              <LuChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
          </button>
          {openSubmenu === "move" && (
            <div className="border-t border-gray-100 bg-gray-50 max-h-48 overflow-y-auto">
              {moveTargets.length > 0 ? (
                moveTargets.slice(0, 20).map((m) => (
                  <button
                    key={m.keyword}
                    type="button"
                    className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-200 truncate block"
                    onClick={() =>
                      onMoveToMiddle(
                        kw.keyword,
                        m.keyword,
                        m.groupId ?? m.intentGroupId ?? "",
                      )
                    }
                    title={m.keyword}
                  >
                    {m.keyword}
                  </button>
                ))
              ) : (
                <p className="px-4 py-2 text-xs text-gray-400">移動先なし</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
