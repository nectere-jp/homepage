"use client";

import type { MasterKeyword, ArticleStatus } from "./types";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  CLUSTER_AXIS_LABELS,
  CLUSTER_AXIS_COLORS,
  TARGET_READER_LABELS,
  TARGET_READER_COLORS,
} from "./constants";

interface KwBadgesProps {
  kw: MasterKeyword;
  flag: ArticleStatus;
  isFlagOpen: boolean;
  onToggleFlagPopover: () => void;
}

export const KwBadges = ({ kw, flag, isFlagOpen, onToggleFlagPopover }: KwBadgesProps) => {
  return (
    <div className="flex flex-col gap-1">
      {/* 記事ステータス（クリックで変更） */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleFlagPopover}
        onKeyDown={(e) => {
          if (e.key === "Enter") onToggleFlagPopover();
        }}
        className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-gray-300 ${ARTICLE_STATUS_COLORS[flag]}`}
        aria-expanded={isFlagOpen}
      >
        {ARTICLE_STATUS_LABELS[flag]}
      </div>
      {/* クラスター軸バッジ */}
      {kw.clusterAxis && (
        <span
          className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${CLUSTER_AXIS_COLORS[kw.clusterAxis]}`}
        >
          {CLUSTER_AXIS_LABELS[kw.clusterAxis]}
          {kw.articleRole === "hub" && " ハブ"}
        </span>
      )}
      {/* 対象読者バッジ */}
      {kw.targetReader && (
        <span
          className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${TARGET_READER_COLORS[kw.targetReader]}`}
        >
          {TARGET_READER_LABELS[kw.targetReader]}
        </span>
      )}
    </div>
  );
};
