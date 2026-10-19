"use client";

import { useCallback, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { adminFetch } from "@/lib/admin-fetch";
import { SortableKeywordRow } from "./KeywordTableRow";
import { KeywordMoveMenu } from "./KeywordMoveMenu";
import type {
  MasterKeyword,
  EditingCell,
  OpenPopover,
  KeywordTier,
  ArticleStatus,
} from "./types";

/** groupedByIntent の 1 グループ */
export interface KeywordsTableGroup {
  gid: string;
  label: string;
  middle: MasterKeyword[];
  longtail: MasterKeyword[];
}

export interface KeywordsTableProps {
  groupedByIntent: KeywordsTableGroup[];
  getMergedKw: (kw: MasterKeyword) => MasterKeyword;
  effectiveWorkflowFlags: Map<string, ArticleStatus>;
  pendingEdits: Record<string, Partial<MasterKeyword>>;

  // 開閉状態
  closedGroupIds: Set<string>;
  setClosedGroupIds: (updater: (prev: Set<string>) => Set<string>) => void;

  // インライン編集ポップオーバー
  editingCell: EditingCell | null;
  setEditingCell: (next: EditingCell | null) => void;
  openPopover: OpenPopover | null;
  setOpenPopover: (v: OpenPopover | null) => void;
  openMoveMenuKeyword: string | null;
  setOpenMoveMenuKeyword: (next: string | null) => void;
  handleToggleMoveMenu: (keyword: string) => void;

  // タグ候補
  allTags: string[];
  tagSearchQuery: string;
  setTagSearchQuery: (q: string) => void;

  // 編集差分
  onPendingEdit: (keyword: string, patch: Partial<MasterKeyword>) => void;
  onRevertPendingEdit: (keyword: string) => void;

  // 移動/マージ 系ハンドラ
  middleKeywordsForMove: MasterKeyword[];
  allClustersForMerge: MasterKeyword[];
  variantCountByGroupId: Record<string, number>;
  handleTierChange: (keyword: string, newTier: KeywordTier) => void;
  handleMoveToMiddle: (
    keyword: string,
    targetMainKeyword: string,
    targetGroupId: string,
  ) => void;
  handleMergeWithKeyword: (source: string, target: string) => void;
  handleMergeClusterWithCluster: (source: string, target: string) => void;
  handleDetachFromSameIntent: (keyword: string) => void;

  // 行アクション
  handleDelete: (keyword: string) => void;
  onEditKeyword: (kw: MasterKeyword) => void;
  onCreateFromKeyword: (keyword: string) => void;
  onAddClusterToGroup: (parentId: string) => void;
  onAddMiddleToGroup: () => void;

  // DnD 後の並び替えコミット (optimistic ではなくサーバー更新 + 再取得)
  setNeedsCommit: (v: boolean) => void;
  fetchAllKeywords: () => Promise<void> | void;
}

/** `child` かつ `hubArticleSlug` を持つ = クラスターキーワード */
const isClusterKw = (k: {
  articleRole?: string;
  hubArticleSlug?: string | null;
}) => k.articleRole === "child" && (k.hubArticleSlug ?? null) != null;

/**
 * キーワードマスターのメインテーブル。
 * DnD コンテキスト + 軸ごとのグループ + ハブ/チャイルドの階層表示を担当。
 */
export function KeywordsTable(props: KeywordsTableProps) {
  const {
    groupedByIntent,
    getMergedKw,
    effectiveWorkflowFlags,
    pendingEdits,
    closedGroupIds,
    setClosedGroupIds,
    editingCell,
    setEditingCell,
    openPopover,
    setOpenPopover,
    openMoveMenuKeyword,
    setOpenMoveMenuKeyword,
    handleToggleMoveMenu,
    allTags,
    tagSearchQuery,
    setTagSearchQuery,
    onPendingEdit,
    onRevertPendingEdit,
    middleKeywordsForMove,
    allClustersForMerge,
    variantCountByGroupId,
    handleTierChange,
    handleMoveToMiddle,
    handleMergeWithKeyword,
    handleMergeClusterWithCluster,
    handleDetachFromSameIntent,
    handleDelete,
    onEditKeyword,
    onCreateFromKeyword,
    onAddClusterToGroup,
    onAddMiddleToGroup,
    setNeedsCommit,
    fetchAllKeywords,
  } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {}),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      for (const { middle, longtail } of groupedByIntent) {
        const all = [...middle, ...longtail];
        const fromIdx = all.findIndex((k) => k.keyword === activeId);
        if (fromIdx < 0) continue;
        const overIdx = all.findIndex((k) => k.keyword === overId);
        if (overIdx < 0) continue;
        const newOrder = [...all];
        const [removed] = newOrder.splice(fromIdx, 1);
        newOrder.splice(overIdx, 0, removed);
        const updates = newOrder.map((kw, i) => ({
          keyword: kw.keyword,
          orderInGroup: i,
        }));
        try {
          const res = await adminFetch("/api/admin/keywords/master/bulk-update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
          });
          if (res.ok) {
            setNeedsCommit(true);
            await fetchAllKeywords();
          }
        } catch (e) {
          console.error("Failed to reorder:", e);
        }
        return;
      }
    },
    [groupedByIntent, setNeedsCommit, fetchAllKeywords],
  );

  const baseRowProps = {
    onPendingEdit,
    editingCell,
    setEditingCell,
    openPopover,
    setOpenPopover,
    allTags,
    tagSearchQuery,
    setTagSearchQuery,
  };

  const renderMoveMenu = (kw: MasterKeyword): ReactNode => (
    <KeywordMoveMenu
      kw={getMergedKw(kw)}
      onDelete={() => handleDelete(kw.keyword)}
      isOpen={openMoveMenuKeyword === kw.keyword}
      onToggle={() => handleToggleMoveMenu(kw.keyword)}
      onClose={() => setOpenMoveMenuKeyword(null)}
      onTierChange={handleTierChange}
      onMoveToMiddle={handleMoveToMiddle}
      onMergeWithKeyword={handleMergeWithKeyword}
      middleKeywords={middleKeywordsForMove}
      mergeTargetKeywords={middleKeywordsForMove}
      clusterKeywordsInSameMiddle={
        isClusterKw(kw)
          ? allClustersForMerge.filter((k) => k.keyword !== kw.keyword)
          : []
      }
      onMergeClusterWithCluster={handleMergeClusterWithCluster}
      canDetachFromSameIntent={
        variantCountByGroupId[kw.groupId ?? ""] >= 2
      }
      onDetachFromSameIntent={handleDetachFromSameIntent}
    />
  );

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      {/* overflow を付けないことでタグ・フラグなどのドロップダウンがカードからはみ出して表示される */}
      <div className="min-h-[300px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 w-12 align-middle" />
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 align-middle">
                キーワード
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 align-middle">
                タグ
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 min-w-[7rem] w-28 align-middle">
                フラグ
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-600 w-[4.5rem] align-middle">
                PV
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-600 w-[3rem] align-middle">
                順位
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-600 w-[3.5rem] align-middle">
                CTR
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-600 w-[3.5rem] align-middle">
                CVR
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-600 w-[5rem] align-middle whitespace-nowrap">
                問合せ見込み
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 align-middle min-w-[7.5rem] whitespace-nowrap">
                操作
              </th>
            </tr>
          </thead>
          {groupedByIntent.map(({ gid, label, middle, longtail }) => {
            const isOpen = !closedGroupIds.has(gid);
            const toggle = () =>
              setClosedGroupIds((prev) => {
                const next = new Set(prev);
                if (next.has(gid)) next.delete(gid);
                else next.add(gid);
                return next;
              });
            const chevron = (
              <button
                type="button"
                onClick={toggle}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-expanded={isOpen}
                aria-controls={`keyword-group-${gid}`}
              >
                {isOpen ? (
                  <LuChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <LuChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
            );
            const groupItems = [...middle, ...longtail].map((k) => k.keyword);
            const getEffectiveFlag = (keyword: string) =>
              effectiveWorkflowFlags.get(keyword);
            return (
              <SortableContext
                key={gid}
                items={groupItems}
                strategy={verticalListSortingStrategy}
              >
                <tbody
                  id={`keyword-group-${gid}`}
                  className="bg-white border-b border-gray-200"
                >
                  {middle.length > 0 ? (
                    <SortableKeywordRow
                      id={middle[0].keyword}
                      kw={getMergedKw(middle[0])}
                      effectiveWorkflowFlag={getEffectiveFlag(middle[0].keyword)}
                      leftContent={chevron}
                      tight
                      onAddCluster={() =>
                        onAddClusterToGroup(middle[0].groupId ?? gid)
                      }
                      onMoveMenu={renderMoveMenu(middle[0])}
                      onEdit={() => onEditKeyword(middle[0])}
                      onDelete={() => handleDelete(middle[0].keyword)}
                      onCreate={() => onCreateFromKeyword(middle[0].keyword)}
                      hasPendingEdit={!!pendingEdits[middle[0].keyword]}
                      onRevertEdit={() => onRevertPendingEdit(middle[0].keyword)}
                      {...baseRowProps}
                    />
                  ) : (
                    <tr>
                      <td className="py-1.5 px-4 align-middle">{chevron}</td>
                      <td colSpan={9} className="py-1.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={toggle}
                            className="text-left text-gray-600 hover:text-gray-900"
                          >
                            {label}
                          </button>
                          <button
                            type="button"
                            onClick={onAddMiddleToGroup}
                            className="text-xs text-primary hover:underline whitespace-nowrap"
                            title="このグループにキーワードを追加"
                          >
                            ＋ミドル
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {isOpen &&
                    middle.slice(1).map((kw) => (
                      <SortableKeywordRow
                        key={kw.keyword}
                        id={kw.keyword}
                        kw={getMergedKw(kw)}
                        effectiveWorkflowFlag={getEffectiveFlag(kw.keyword)}
                        tight
                        onAddCluster={() =>
                          onAddClusterToGroup(kw.parentId ?? gid)
                        }
                        onMoveMenu={renderMoveMenu(kw)}
                        onEdit={() => onEditKeyword(kw)}
                        onDelete={() => handleDelete(kw.keyword)}
                        onCreate={() => onCreateFromKeyword(kw.keyword)}
                        hasPendingEdit={!!pendingEdits[kw.keyword]}
                        onRevertEdit={() => onRevertPendingEdit(kw.keyword)}
                        {...baseRowProps}
                      />
                    ))}
                  {isOpen &&
                    longtail.map((kw) => (
                      <SortableKeywordRow
                        key={kw.keyword}
                        id={kw.keyword}
                        kw={getMergedKw(kw)}
                        effectiveWorkflowFlag={getEffectiveFlag(kw.keyword)}
                        indent
                        tight
                        onMoveMenu={renderMoveMenu(kw)}
                        onEdit={() => onEditKeyword(kw)}
                        onDelete={() => handleDelete(kw.keyword)}
                        onCreate={() => onCreateFromKeyword(kw.keyword)}
                        hasPendingEdit={!!pendingEdits[kw.keyword]}
                        onRevertEdit={() => onRevertPendingEdit(kw.keyword)}
                        {...baseRowProps}
                      />
                    ))}
                </tbody>
              </SortableContext>
            );
          })}
        </table>
      </div>
    </DndContext>
  );
}
