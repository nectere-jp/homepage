"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LuGripVertical,
  LuPencil,
  LuPlus,
  LuStar,
  LuX,
} from "react-icons/lu";
import { getCTRByRank, calculateBusinessImpact } from "@/lib/keyword-calc";
import type { MasterKeyword, EditingCell, OpenPopover } from "./types";
import type { WorkflowFlag } from "@/lib/keyword-manager";
import {
  WORKFLOW_FLAG_LABELS,
  WORKFLOW_FLAG_COLORS,
} from "./constants";

export interface KeywordTableRowProps {
  kw: MasterKeyword;
  leftContent?: ReactNode;
  indent?: boolean;
  tight?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCreate: () => void;
  onPendingEdit: (keyword: string, patch: Partial<MasterKeyword>) => void;
  editingCell: EditingCell | null;
  setEditingCell: (v: EditingCell | null) => void;
  openPopover: OpenPopover | null;
  setOpenPopover: (v: OpenPopover | null) => void;
  allTags: string[];
  tagSearchQuery: string;
  setTagSearchQuery: (q: string) => void;
  sortableRef?: (node: HTMLTableRowElement | null) => void;
  dragListeners?: Record<string, unknown>;
  dragAttributes?: object;
  onAddCluster?: () => void;
  onMoveMenu?: ReactNode;
  trStyle?: React.CSSProperties;
  /** 表示用。同趣旨のいずれかが作成済みのとき全件を作成済み表示する場合に渡す */
  effectiveWorkflowFlag?: WorkflowFlag;
}

export function KeywordTableRow({
  kw,
  leftContent,
  indent,
  tight,
  onEdit,
  onDelete,
  onCreate,
  onPendingEdit,
  editingCell,
  setEditingCell,
  openPopover,
  setOpenPopover,
  allTags,
  tagSearchQuery,
  setTagSearchQuery,
  sortableRef,
  dragListeners,
  dragAttributes,
  onAddCluster,
  onMoveMenu,
  trStyle,
  effectiveWorkflowFlag,
}: KeywordTableRowProps) {
  const flag: WorkflowFlag =
    effectiveWorkflowFlag ??
    kw.workflowFlag ??
    (kw.assignedArticles?.length ? "created" : "pending");
  const cellPy = tight ? "py-1.5" : "py-3";
  const isEditingPv =
    editingCell?.keyword === kw.keyword && editingCell?.field === "estimatedPv";
  const isEditingRank =
    editingCell?.keyword === kw.keyword &&
    editingCell?.field === "expectedRank";
  const isEditingCvr =
    editingCell?.keyword === kw.keyword && editingCell?.field === "cvr";
  const isTagsOpen =
    openPopover?.keyword === kw.keyword && openPopover?.field === "tags";
  const isFlagOpen =
    openPopover?.keyword === kw.keyword &&
    openPopover?.field === "workflowFlag";

  const rank = kw.expectedRank ?? kw.currentRank ?? null;
  const displayCTR =
    rank != null && rank >= 1
      ? Math.round(getCTRByRank(rank) * 10000) / 100
      : null;
  const displayBusinessImpact = calculateBusinessImpact({
    estimatedPv: kw.estimatedPv,
    expectedRank: kw.expectedRank ?? kw.currentRank ?? undefined,
    cvr: kw.cvr,
  });

  const handleNumberBlur = (
    field: "estimatedPv" | "expectedRank" | "cvr",
    raw: string,
    parse: (s: string) => number | null,
    toPatch: (n: number) => Partial<MasterKeyword>,
    allowNull?: boolean,
  ) => {
    const n = parse(raw);
    if (n !== null) onPendingEdit(kw.keyword, toPatch(n));
    else if (allowNull) onPendingEdit(kw.keyword, { [field]: null });
    setEditingCell(null);
  };

  const grip = (
    <span
      className="inline-flex cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 p-0.5 rounded"
      title="ドラッグして順序変更・移動"
      aria-label="ドラッグして順序変更・移動"
      {...(dragListeners ?? {})}
      {...(dragAttributes ?? {})}
    >
      <LuGripVertical className="w-5 h-5" />
    </span>
  );

  return (
    <tr
      ref={sortableRef}
      style={trStyle}
      className={`hover:bg-gray-50/50 ${tight ? "border-b-0" : "border-b border-gray-100 last:border-b-0"}`}
    >
      <td className={`${cellPy} px-4 align-top whitespace-nowrap`}>
        <div className="flex items-center gap-0.5">
          {leftContent}
          {grip}
        </div>
      </td>
      <td
        className={`${cellPy} px-4 align-top ${indent ? "pl-8 border-l-2 border-gray-200" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/keywords/master/${encodeURIComponent(kw.keyword)}`}
            className="font-medium text-gray-900 hover:text-primary hover:underline"
          >
            {kw.keyword}
          </Link>
          <div className="flex gap-0.5">
            {[...Array(kw.priority)].map((_, i) => (
              <LuStar
                key={i}
                className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
        </div>
      </td>
      <td className={`${cellPy} px-4 align-top relative`}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isTagsOpen) setTagSearchQuery("");
            setOpenPopover(
              isTagsOpen ? null : { keyword: kw.keyword, field: "tags" },
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!isTagsOpen) setTagSearchQuery("");
              setOpenPopover(
                isTagsOpen ? null : { keyword: kw.keyword, field: "tags" },
              );
            }
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
                            relatedTags: kw.relatedTags.filter(
                              (t) => t !== tag,
                            ),
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
      <td className={`${cellPy} px-4 align-top min-w-[7rem] relative`}>
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            setOpenPopover(
              isFlagOpen
                ? null
                : { keyword: kw.keyword, field: "workflowFlag" },
            )
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            setOpenPopover(
              isFlagOpen
                ? null
                : { keyword: kw.keyword, field: "workflowFlag" },
            )
          }
          className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-gray-300 ${WORKFLOW_FLAG_COLORS[flag]}`}
        >
          {WORKFLOW_FLAG_LABELS[flag]}
        </div>
        {isFlagOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-lg p-1.5">
            <div className="flex flex-col gap-0.5">
              {(
                Object.entries(WORKFLOW_FLAG_LABELS) as [WorkflowFlag, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPendingEdit(kw.keyword, { workflowFlag: val });
                    setOpenPopover(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:opacity-90 transition-opacity min-h-[32px] flex items-center ${WORKFLOW_FLAG_COLORS[val]}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </td>
      <td
        className={`${cellPy} px-4 align-top text-sm text-gray-700 tabular-nums w-[5.5rem]`}
      >
        <div className="min-h-[28px] flex items-center w-[5.5rem]">
          {isEditingPv ? (
            <input
              type="text"
              defaultValue={kw.estimatedPv}
              className="w-full max-w-[5rem] h-7 px-2 py-1 box-border border border-gray-300 rounded text-sm tabular-nums"
              autoFocus
              onBlur={(e) =>
                handleNumberBlur(
                  "estimatedPv",
                  e.target.value,
                  (s) => {
                    const n = parseInt(s, 10);
                    return Number.isFinite(n) && n >= 0 ? n : null;
                  },
                  (n) => ({ estimatedPv: n }),
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() =>
                setEditingCell({ keyword: kw.keyword, field: "estimatedPv" })
              }
              className="text-left w-full min-h-[28px] flex items-center py-0.5 -mx-1 px-1 rounded hover:bg-gray-100 cursor-pointer"
            >
              {kw.estimatedPv.toLocaleString()}
            </button>
          )}
        </div>
      </td>
      <td
        className={`${cellPy} px-4 align-top text-sm text-gray-700 tabular-nums w-[3.5rem]`}
      >
        <div className="min-h-[28px] flex items-center w-[3.5rem]">
          {isEditingRank ? (
            <input
              type="text"
              defaultValue={kw.expectedRank ?? ""}
              placeholder="—"
              className="w-full max-w-[3rem] h-7 px-2 py-1 box-border border border-gray-300 rounded text-sm tabular-nums"
              autoFocus
              onBlur={(e) =>
                handleNumberBlur(
                  "expectedRank",
                  e.target.value,
                  (s) => {
                    if (!s.trim()) return null;
                    const n = parseInt(s, 10);
                    return Number.isFinite(n) && n >= 1 ? n : null;
                  },
                  (n) => ({ expectedRank: n }),
                  true,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() =>
                setEditingCell({ keyword: kw.keyword, field: "expectedRank" })
              }
              className="text-left w-full min-h-[28px] flex items-center py-0.5 -mx-1 px-1 rounded hover:bg-gray-100 cursor-pointer"
            >
              {kw.expectedRank != null ? `${kw.expectedRank}位` : "—"}
            </button>
          )}
        </div>
      </td>
      <td
        className={`${cellPy} px-4 align-top text-sm text-gray-700 tabular-nums`}
      >
        <div className="min-h-[28px] flex items-center">
          {displayCTR != null ? `${displayCTR}%` : "—"}
        </div>
      </td>
      <td
        className={`${cellPy} px-4 align-top text-sm text-gray-700 tabular-nums w-[4.25rem]`}
      >
        <div className="min-h-[28px] flex items-center w-[4.25rem]">
          {isEditingCvr ? (
            <input
              type="text"
              defaultValue={kw.cvr != null ? (kw.cvr * 100).toFixed(2) : ""}
              placeholder="—"
              className="w-full max-w-[3.75rem] h-7 px-2 py-1 box-border border border-gray-300 rounded text-sm tabular-nums"
              autoFocus
              onBlur={(e) =>
                handleNumberBlur(
                  "cvr",
                  e.target.value,
                  (s) => {
                    if (!s.trim()) return null;
                    const n = parseFloat(s);
                    return Number.isFinite(n) && n >= 0 ? n / 100 : null;
                  },
                  (n) => ({ cvr: n }),
                  true,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() =>
                setEditingCell({ keyword: kw.keyword, field: "cvr" })
              }
              className="text-left w-full min-h-[28px] flex items-center py-0.5 -mx-1 px-1 rounded hover:bg-gray-100 cursor-pointer"
            >
              {kw.cvr != null ? `${(kw.cvr * 100).toFixed(2)}%` : "—"}
            </button>
          )}
        </div>
      </td>
      <td
        className={`${cellPy} px-4 align-top text-sm text-gray-700 tabular-nums`}
      >
        <div className="min-h-[28px] flex items-center">
          {displayBusinessImpact > 0 ? displayBusinessImpact : "—"}
        </div>
      </td>
      <td className={`${cellPy} px-4 align-top min-w-[7.5rem]`}>
        <div className="flex flex-nowrap gap-1 items-center">
          {(kw.keywordTier === "middle" || kw.keywordTier === "big") &&
            onAddCluster && (
              <button
                type="button"
                onClick={onAddCluster}
                className="p-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="クラスター（ロングテール）を追加"
              >
                <LuPlus className="w-4 h-4" />
              </button>
            )}
          <button
            type="button"
            onClick={onCreate}
            disabled={kw.assignedArticles.length > 0}
            className="p-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={
              kw.assignedArticles.length > 0
                ? "記事あり（詳細から編集）"
                : "記事を作成"
            }
          >
            <LuPencil className="w-4 h-4" />
          </button>
          {onMoveMenu}
        </div>
      </td>
    </tr>
  );
}

interface SortableKeywordRowProps extends KeywordTableRowProps {
  id: string;
}

export function SortableKeywordRow({ id, ...props }: SortableKeywordRowProps) {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 1, opacity: 0.9 } : undefined),
  };
  return (
    <KeywordTableRow
      {...props}
      sortableRef={setNodeRef}
      dragListeners={listeners}
      dragAttributes={attributes}
      trStyle={style}
    />
  );
}
