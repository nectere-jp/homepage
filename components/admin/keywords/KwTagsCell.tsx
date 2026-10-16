"use client";

import { LuX } from "react-icons/lu";
import type { MasterKeyword, OpenPopover } from "./types";

interface KwTagsCellProps {
  kw: MasterKeyword;
  cellPy: string;
  isTagsOpen: boolean;
  openPopover: OpenPopover | null;
  setOpenPopover: (v: OpenPopover | null) => void;
  allTags: string[];
  tagSearchQuery: string;
  setTagSearchQuery: (q: string) => void;
  onPendingEdit: (keyword: string, patch: Partial<MasterKeyword>) => void;
}

export const KwTagsCell = ({
  kw,
  cellPy,
  isTagsOpen,
  setOpenPopover,
  allTags,
  tagSearchQuery,
  setTagSearchQuery,
  onPendingEdit,
}: KwTagsCellProps) => {
  const togglePopover = () => {
    if (!isTagsOpen) setTagSearchQuery("");
    setOpenPopover(isTagsOpen ? null : { keyword: kw.keyword, field: "tags" });
  };

  return (
    <td className={`${cellPy} px-4 align-top relative`}>
      <div
        role="button"
        tabIndex={0}
        onClick={togglePopover}
        onKeyDown={(e) => {
          if (e.key === "Enter") togglePopover();
        }}
        className="flex flex-wrap gap-1 items-center cursor-pointer rounded hover:bg-gray-100/80 px-1 -mx-1 py-0.5"
      >
        {kw.relatedTags.length ? (
          kw.relatedTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">タグを選択</span>
        )}
      </div>
      {isTagsOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[200px] max-w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg py-2 max-h-[240px] overflow-y-auto">
          {kw.relatedTags.length > 0 && (
            <div className="px-2 mb-2">
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                選択中のタグ
              </p>
              <div className="flex flex-wrap gap-1">
                {kw.relatedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPendingEdit(kw.keyword, {
                          relatedTags: kw.relatedTags.filter((t) => t !== tag),
                        });
                      }}
                      className="p-0.5 rounded hover:bg-primary/20 text-primary"
                      title="タグを削除"
                      aria-label={`${tag} を削除`}
                    >
                      <LuX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="検索..."
            value={tagSearchQuery}
            onChange={(e) => setTagSearchQuery(e.target.value)}
            className="mx-2 mb-2 w-[calc(100%-1rem)] px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div className="space-y-0.5">
            {allTags
              .filter((tag) =>
                tag.toLowerCase().includes(tagSearchQuery.toLowerCase()),
              )
              .map((tag) => {
                const selected = kw.relatedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = selected
                        ? kw.relatedTags.filter((t) => t !== tag)
                        : [...kw.relatedTags, tag];
                      onPendingEdit(kw.keyword, { relatedTags: next });
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 ${selected ? "bg-primary/10 text-primary" : "text-gray-700"}`}
                  >
                    {tag}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </td>
  );
};
