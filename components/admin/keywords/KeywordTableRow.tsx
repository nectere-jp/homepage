"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LuGripVertical, LuStar } from "react-icons/lu";
import { getCTRByRank, calculateBusinessImpact } from "@/lib/keyword-calc";
import type { MasterKeyword, EditingCell, OpenPopover, ArticleStatus } from "./types";
import { EditableNumberCell } from "./EditableNumberCell";
import { KwTagsCell } from "./KwTagsCell";
import { KwStatusCell } from "./KwStatusCell";
import { KwActionsCell } from "./KwActionsCell";

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
  /** 表示用の記事ステータス（グループから解決済み） */
  effectiveWorkflowFlag?: ArticleStatus;
  /** 未保存の変更がある場合 true */
  hasPendingEdit?: boolean;
  /** 未保存の変更を元に戻すコールバック */
  onRevertEdit?: () => void;
}

export function KeywordTableRow({
  kw,
  leftContent,
  indent,
  tight,
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
  hasPendingEdit,
  onRevertEdit,
}: KeywordTableRowProps) {
  const flag: ArticleStatus =
    effectiveWorkflowFlag ??
    kw.articleStatus ??
    (kw.assignedArticles?.length ? "published" : "pending");
  const cellPy = tight ? "py-1.5" : "py-3";
  const isEditingPv =
    editingCell?.keyword === kw.keyword && editingCell?.field === "estimatedPv";
  const isEditingRank =
    editingCell?.keyword === kw.keyword && editingCell?.field === "expectedRank";
  const isEditingCvr =
    editingCell?.keyword === kw.keyword && editingCell?.field === "cvr";
  const isTagsOpen =
    openPopover?.keyword === kw.keyword && openPopover?.field === "tags";
  const isFlagOpen =
    openPopover?.keyword === kw.keyword && openPopover?.field === "articleStatus";

  const rank = kw.expectedRank ?? kw.currentRank ?? null;
  const displayCTR =
    rank != null && rank >= 1 ? Math.round(getCTRByRank(rank) * 10000) / 100 : null;
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
      <td className={`${cellPy} px-4 align-top ${indent ? "pl-8 border-l-2 border-gray-200" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/keywords/master/${encodeURIComponent(kw.keyword)}`}
            className="font-medium text-gray-900 hover:text-primary hover:underline"
          >
            {kw.keyword}
          </Link>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <LuStar
                key={i}
                className={`w-3.5 h-3.5 ${i <= kw.priority ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </td>
      <KwTagsCell
        kw={kw}
        cellPy={cellPy}
        isTagsOpen={isTagsOpen}
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        allTags={allTags}
        tagSearchQuery={tagSearchQuery}
        setTagSearchQuery={setTagSearchQuery}
        onPendingEdit={onPendingEdit}
      />
      <KwStatusCell
        kw={kw}
        cellPy={cellPy}
        flag={flag}
        isFlagOpen={isFlagOpen}
        setOpenPopover={setOpenPopover}
        onPendingEdit={onPendingEdit}
      />
      <td className={`${cellPy} px-2 align-top text-sm text-gray-700 tabular-nums w-[4.5rem]`}>
        <EditableNumberCell
          isEditing={isEditingPv}
          defaultValue={String(kw.estimatedPv)}
          displayValue={kw.estimatedPv.toLocaleString()}
          width="w-[4.5rem]"
          onStartEdit={() => setEditingCell({ keyword: kw.keyword, field: "estimatedPv" })}
          onCommit={(raw) =>
            handleNumberBlur(
              "estimatedPv",
              raw,
              (s) => {
                const n = parseInt(s, 10);
                return Number.isFinite(n) && n >= 0 ? n : null;
              },
              (n) => ({ estimatedPv: n }),
            )
          }
        />
      </td>
      <td className={`${cellPy} px-2 align-top text-sm text-gray-700 tabular-nums w-[3rem]`}>
        <EditableNumberCell
          isEditing={isEditingRank}
          defaultValue={kw.expectedRank != null ? String(kw.expectedRank) : ""}
          displayValue={kw.expectedRank != null ? `${kw.expectedRank}位` : "—"}
          width="w-[3rem]"
          onStartEdit={() => setEditingCell({ keyword: kw.keyword, field: "expectedRank" })}
          onCommit={(raw) =>
            handleNumberBlur(
              "expectedRank",
              raw,
              (s) => {
                if (!s.trim()) return null;
                const n = parseInt(s, 10);
                return Number.isFinite(n) && n >= 1 ? n : null;
              },
              (n) => ({ expectedRank: n }),
              true,
            )
          }
        />
      </td>
      <td className={`${cellPy} px-2 align-top text-sm text-gray-700 tabular-nums w-[3.5rem]`}>
        <div className="min-h-[28px] flex items-center">
          {displayCTR != null ? `${displayCTR}%` : "—"}
        </div>
      </td>
      <td className={`${cellPy} px-2 align-top text-sm text-gray-700 tabular-nums w-[3.5rem]`}>
        <EditableNumberCell
          isEditing={isEditingCvr}
          defaultValue={kw.cvr != null ? (kw.cvr * 100).toFixed(2) : ""}
          displayValue={kw.cvr != null ? `${(kw.cvr * 100).toFixed(2)}%` : "—"}
          width="w-[3.5rem]"
          onStartEdit={() => setEditingCell({ keyword: kw.keyword, field: "cvr" })}
          onCommit={(raw) =>
            handleNumberBlur(
              "cvr",
              raw,
              (s) => {
                if (!s.trim()) return null;
                const n = parseFloat(s);
                return Number.isFinite(n) && n >= 0 ? n / 100 : null;
              },
              (n) => ({ cvr: n }),
              true,
            )
          }
        />
      </td>
      <td className={`${cellPy} px-2 align-top text-sm text-gray-700 tabular-nums w-[5rem]`}>
        <div className="min-h-[28px] flex items-center">
          {displayBusinessImpact > 0 ? displayBusinessImpact : "—"}
        </div>
      </td>
      <KwActionsCell
        kw={kw}
        cellPy={cellPy}
        hasPendingEdit={hasPendingEdit}
        onRevertEdit={onRevertEdit}
        onAddCluster={onAddCluster}
        onCreate={onCreate}
        onMoveMenu={onMoveMenu}
      />
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
