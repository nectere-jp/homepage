"use client";

import type { MasterKeyword, OpenPopover, ArticleStatus } from "./types";
import { ARTICLE_STATUS_LABELS, ARTICLE_STATUS_COLORS } from "./constants";
import { KwBadges } from "./KwBadges";

interface KwStatusCellProps {
  kw: MasterKeyword;
  cellPy: string;
  flag: ArticleStatus;
  isFlagOpen: boolean;
  setOpenPopover: (v: OpenPopover | null) => void;
  onPendingEdit: (keyword: string, patch: Partial<MasterKeyword>) => void;
}

export const KwStatusCell = ({
  kw,
  cellPy,
  flag,
  isFlagOpen,
  setOpenPopover,
  onPendingEdit,
}: KwStatusCellProps) => {
  const toggleFlagPopover = () =>
    setOpenPopover(isFlagOpen ? null : { keyword: kw.keyword, field: "articleStatus" });

  return (
    <td className={`${cellPy} px-4 align-top min-w-[7.5rem] relative`}>
      <KwBadges kw={kw} flag={flag} isFlagOpen={isFlagOpen} onToggleFlagPopover={toggleFlagPopover} />
      {isFlagOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-lg p-1.5">
          <div className="flex flex-col gap-0.5">
            {(Object.entries(ARTICLE_STATUS_LABELS) as [ArticleStatus, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPendingEdit(kw.keyword, { articleStatus: val });
                  setOpenPopover(null);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:opacity-90 transition-opacity min-h-[32px] flex items-center ${ARTICLE_STATUS_COLORS[val]}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </td>
  );
};
