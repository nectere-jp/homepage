"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuKey,
  LuPlus,
  LuSave,
  LuUndo2,
  LuClipboard,
  LuCheck,
} from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";
import { KeywordEditModal } from "@/components/admin/KeywordEditModal";
import {
  KeywordsStatsSection,
  ConflictsSection,
  KeywordsFilterSection,
  KeywordsTable,
  useKeywordMutations,
  BUSINESS_LABELS,
  type MasterKeyword,
  type EditingCell,
  type OpenPopover,
  type BusinessCoverage,
  type ConflictKeywordData,
  type ClusterAxis,
  type ArticleStatus,
  type SortByOption,
} from "@/components/admin/keywords";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { copyKeywordsForLLM } from "@/lib/keyword-manager/llm-snapshot";
import {
  filterAndSortKeywords,
  groupKeywordsByIntent,
} from "@/lib/keyword-manager/grouping";

export default function KeywordsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    totalArticles: number;
    uniqueKeywords: number;
  } | null>(null);
  const [conflicts, setConflicts] = useState<ConflictKeywordData[]>([]);
  const [businessCoverage, setBusinessCoverage] = useState<BusinessCoverage[]>(
    [],
  );
  const [selectedBusiness, setSelectedBusiness] = useState<
    BusinessType | "all"
  >("all");
  const [allKeywords, setAllKeywords] = useState<MasterKeyword[]>([]);
  const [sortBy, setSortBy] = useState<SortByOption>("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterUsage, setFilterUsage] = useState<"all" | "used" | "unused">(
    "all",
  );
  const [filterClusterAxis, setFilterClusterAxis] = useState<ClusterAxis | "">(
    "",
  );
  const [filterArticleStatus, setFilterArticleStatus] = useState<
    ArticleStatus | ""
  >("");
  const [closedGroupIds, setClosedGroupIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<MasterKeyword | null>(
    null,
  );
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [openPopover, setOpenPopover] = useState<OpenPopover | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [openMoveMenuKeyword, setOpenMoveMenuKeyword] = useState<string | null>(
    null,
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [modalInitial, setModalInitial] = useState<{
    parentId?: string | null;
  } | null>(null);

  const fetchKeywordData = useCallback(async () => {
    try {
      const response = await adminFetch("/api/admin/keywords/analyze");
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setConflicts(data.conflicts || []);
      }
    } catch (error) {
      console.error("Failed to fetch keyword data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBusinessCoverage = useCallback(async () => {
    try {
      const response = await adminFetch("/api/admin/keywords/master");
      if (response.ok) {
        const data = await response.json();
        const keywords = data.keywords || [];
        const coverage: BusinessCoverage[] = Object.entries(
          BUSINESS_LABELS,
        ).map(([key, label]) => {
          const business = key as BusinessType;
          const total = keywords.filter((kw: MasterKeyword) =>
            kw.relatedBusiness.includes(business),
          ).length;
          const used = keywords.filter(
            (kw: MasterKeyword) =>
              kw.relatedBusiness.includes(business) &&
              kw.assignedArticles.length > 0,
          ).length;
          return {
            business,
            label,
            total,
            used,
            percentage: total > 0 ? Math.round((used / total) * 100) : 0,
          };
        });
        setBusinessCoverage(coverage);
      }
    } catch (error) {
      console.error("Failed to fetch business coverage:", error);
    }
  }, []);

  const fetchAllKeywords = useCallback(async () => {
    try {
      const response = await adminFetch("/api/admin/keywords/master");
      if (response.ok) {
        const data = await response.json();
        setAllKeywords(data.keywords || []);
      }
    } catch (error) {
      console.error("Failed to fetch all keywords:", error);
    }
  }, []);

  useEffect(() => {
    fetchKeywordData();
    fetchBusinessCoverage();
    fetchAllKeywords();
  }, [fetchKeywordData, fetchBusinessCoverage, fetchAllKeywords]);

  useEffect(() => {
    adminFetch("/api/admin/tags")
      .then((r) => r.json())
      .then((d) => {
        const tags = d.tags?.map((t: { tag: string }) => t.tag) ?? [];
        setAllTags(tags);
      })
      .catch(() => {});
  }, []);

  // ポップオーバーを開くとき移動メニューを閉じる
  const handleSetOpenPopover = useCallback((v: OpenPopover | null) => {
    setOpenMoveMenuKeyword(null);
    setOpenPopover(v);
  }, []);

  // 移動メニューをトグルするときポップオーバーを閉じる
  const handleToggleMoveMenu = useCallback((keyword: string) => {
    setOpenPopover(null);
    setOpenMoveMenuKeyword((prev) => (prev === keyword ? null : keyword));
  }, []);

  const mutations = useKeywordMutations({
    allKeywords,
    fetchAllKeywords,
    fetchKeywordData,
    fetchBusinessCoverage,
    setEditingCell,
    setOpenPopover: (v) => setOpenPopover(v),
    setOpenMoveMenuKeyword,
    setTagSearchQuery,
  });

  const {
    pendingEdits,
    saving,
    setNeedsCommit,
    dirty,
    onPendingEdit,
    onRevertPendingEdit,
    revertAll,
    handleSave,
    handleDelete,
    handleMergeWithKeyword,
    handleMoveToMiddle,
    handleTierChange,
    handleMergeClusterWithCluster,
    handleDetachFromSameIntent,
  } = mutations;

  const getMergedKw = useCallback(
    (kw: MasterKeyword): MasterKeyword => {
      const patch = pendingEdits[kw.keyword];
      if (!patch) return kw;
      return { ...kw, ...patch };
    },
    [pendingEdits],
  );

  const effectiveWorkflowFlags = useMemo(() => {
    const map = new Map<string, ArticleStatus>();
    for (const kw of allKeywords) {
      const merged = getMergedKw(kw);
      const status: ArticleStatus =
        merged.articleStatus ??
        ((merged.assignedArticles?.length ?? 0) > 0 ? "published" : "pending");
      map.set(merged.keyword, status);
    }
    return map;
  }, [allKeywords, getMergedKw]);

  const filteredAndSortedKeywords = useMemo(
    () =>
      filterAndSortKeywords(allKeywords, {
        selectedBusiness,
        searchQuery,
        filterPriority,
        filterStatus,
        filterUsage,
        filterClusterAxis,
        filterArticleStatus,
        effectiveWorkflowFlags,
        sortBy,
      }),
    [
      allKeywords,
      selectedBusiness,
      searchQuery,
      filterPriority,
      filterStatus,
      filterUsage,
      filterClusterAxis,
      filterArticleStatus,
      sortBy,
      effectiveWorkflowFlags,
    ],
  );

  const groupedByIntent = useMemo(
    () => groupKeywordsByIntent(filteredAndSortedKeywords),
    [filteredAndSortedKeywords],
  );

  const middleKeywordsForMove = useMemo(
    () => allKeywords.filter((k) => k.articleRole === "hub"),
    [allKeywords],
  );

  const isClusterKw = (k: {
    articleRole?: string;
    hubArticleSlug?: string | null;
  }) => k.articleRole === "child" && (k.hubArticleSlug ?? null) != null;

  // クラスター同士で同趣旨にまとめる候補＝自分以外の全クラスター（他ミドル配下も含む）
  const allClustersForMerge = useMemo(
    () => allKeywords.filter((k) => isClusterKw(k)),
    [allKeywords],
  );

  const variantCountByGroupId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const kw of allKeywords) {
      const gid = kw.groupId ?? "";
      if (gid) map[gid] = (map[gid] ?? 0) + 1;
    }
    return map;
  }, [allKeywords]);

  const handleCopyForLLM = useCallback(async () => {
    await copyKeywordsForLLM({
      groupedByIntent,
      getMergedKw,
      totalCount: filteredAndSortedKeywords.length,
    });
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 2000);
  }, [groupedByIntent, getMergedKw, filteredAndSortedKeywords.length]);

  const filteredConflicts = conflicts;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">キーワード管理</h1>
        <p className="mt-2 text-gray-600">SEO最適化とキーワード分析</p>
      </div>

      <KeywordsStatsSection
        analysis={analysis}
        conflictsCount={conflicts.length}
        businessCoverage={businessCoverage}
        selectedBusiness={selectedBusiness}
        onBusinessChange={setSelectedBusiness}
      />

      <ConflictsSection conflicts={filteredConflicts} />

      <KeywordsFilterSection
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filterPriority={filterPriority}
        onFilterPriorityChange={setFilterPriority}
        filterClusterAxis={filterClusterAxis}
        onFilterClusterAxisChange={setFilterClusterAxis}
        filterArticleStatus={filterArticleStatus}
        onFilterArticleStatusChange={setFilterArticleStatus}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterUsage={filterUsage}
        onFilterUsageChange={setFilterUsage}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <div className="bg-white rounded-2xl shadow-soft-lg">
        <div className="p-6 border-b flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LuKey className="w-6 h-6 text-gray-600" />
              キーワード一覧
              {selectedBusiness !== "all" && (
                <span className="text-base font-normal text-gray-600">
                  （{BUSINESS_LABELS[selectedBusiness as BusinessType]}）
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              全 {filteredAndSortedKeywords.length}{" "}
              キーワード（同趣旨でグループ表示）
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyForLLM}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1.5"
              title="現在のキーワード一覧と記事概要をクリップボードにコピー（LLM貼り付け用）"
            >
              {copyStatus === "copied" ? (
                <LuCheck className="w-4 h-4 text-green-600" />
              ) : (
                <LuClipboard className="w-4 h-4" />
              )}
              {copyStatus === "copied" ? "コピーしました" : "LLM用にコピー"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingKeyword(null);
                setModalInitial({});
                setShowModal(true);
              }}
              className="px-4 py-2 border border-gray-800 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <LuPlus className="w-4 h-4" />
              キーワードを追加
            </button>
            {Object.keys(pendingEdits).length > 0 && (
              <button
                type="button"
                onClick={revertAll}
                className="px-4 py-2 border border-amber-400 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                <LuUndo2 className="w-4 h-4" />
                全て戻す
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <LuSave className="w-5 h-5" />
              {saving ? "保存中..." : "保存してコミット"}
            </button>
          </div>
        </div>

        {(openPopover || openMoveMenuKeyword) && (
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={() => {
              setOpenPopover(null);
              setOpenMoveMenuKeyword(null);
            }}
          />
        )}

        <KeywordsTable
          groupedByIntent={groupedByIntent}
          getMergedKw={getMergedKw}
          effectiveWorkflowFlags={effectiveWorkflowFlags}
          pendingEdits={pendingEdits}
          closedGroupIds={closedGroupIds}
          setClosedGroupIds={setClosedGroupIds}
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          openPopover={openPopover}
          setOpenPopover={handleSetOpenPopover}
          openMoveMenuKeyword={openMoveMenuKeyword}
          setOpenMoveMenuKeyword={setOpenMoveMenuKeyword}
          handleToggleMoveMenu={handleToggleMoveMenu}
          allTags={allTags}
          tagSearchQuery={tagSearchQuery}
          setTagSearchQuery={setTagSearchQuery}
          onPendingEdit={onPendingEdit}
          onRevertPendingEdit={onRevertPendingEdit}
          middleKeywordsForMove={middleKeywordsForMove}
          allClustersForMerge={allClustersForMerge}
          variantCountByGroupId={variantCountByGroupId}
          handleTierChange={handleTierChange}
          handleMoveToMiddle={handleMoveToMiddle}
          handleMergeWithKeyword={handleMergeWithKeyword}
          handleMergeClusterWithCluster={handleMergeClusterWithCluster}
          handleDetachFromSameIntent={handleDetachFromSameIntent}
          handleDelete={handleDelete}
          onEditKeyword={(kw) => {
            setEditingKeyword(kw);
            setShowModal(true);
          }}
          onCreateFromKeyword={(keyword) =>
            router.push(
              `/admin/claude?keyword=${encodeURIComponent(keyword)}`,
            )
          }
          onAddClusterToGroup={(parentId) => {
            setModalInitial({ parentId });
            setEditingKeyword(null);
            setShowModal(true);
          }}
          onAddMiddleToGroup={() => {
            setModalInitial({});
            setEditingKeyword(null);
            setShowModal(true);
          }}
          setNeedsCommit={setNeedsCommit}
          fetchAllKeywords={fetchAllKeywords}
        />
      </div>

      {showModal && (
        <KeywordEditModal
          keyword={editingKeyword}
          onClose={() => {
            setShowModal(false);
            setModalInitial(null);
          }}
          onSave={() => {
            setShowModal(false);
            setModalInitial(null);
            fetchAllKeywords();
            fetchKeywordData();
            fetchBusinessCoverage();
          }}
          initialParentId={modalInitial?.parentId}
        />
      )}
    </div>
  );
}
