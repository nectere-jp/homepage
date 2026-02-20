"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  LuKey,
  LuPlus,
  LuSave,
  LuChevronDown,
  LuChevronRight,
} from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";
import { KeywordEditModal } from "@/components/admin/KeywordEditModal";
import {
  SortableKeywordRow,
  KeywordMoveMenu,
  KeywordsStatsSection,
  ConflictsSection,
  KeywordsFilterSection,
  BUSINESS_LABELS,
  type MasterKeyword,
  type EditingCell,
  type OpenPopover,
  type BusinessCoverage,
  type ConflictKeywordData,
  type KeywordTier,
  type WorkflowFlag,
  type SortByOption,
} from "@/components/admin/keywords";

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
  const [filterKeywordTier, setFilterKeywordTier] = useState<KeywordTier | "">(
    "",
  );
  const [filterWorkflowFlag, setFilterWorkflowFlag] = useState<
    WorkflowFlag | ""
  >("");
  const [closedGroupIds, setClosedGroupIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<MasterKeyword | null>(
    null,
  );
  const [pendingEdits, setPendingEdits] = useState<
    Record<string, Partial<MasterKeyword>>
  >({});
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [openPopover, setOpenPopover] = useState<OpenPopover | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [openMoveMenuKeyword, setOpenMoveMenuKeyword] = useState<string | null>(
    null,
  );
  const [needsCommit, setNeedsCommit] = useState(false);
  const [modalInitial, setModalInitial] = useState<{
    parentId?: string | null;
    keywordTier?: KeywordTier;
    pillarSlug?: string | null;
  } | null>(null);

  const dirty = Object.keys(pendingEdits).length > 0 || needsCommit;

  const getMergedKw = useCallback(
    (kw: MasterKeyword): MasterKeyword => {
      const patch = pendingEdits[kw.keyword];
      if (!patch) return kw;
      return { ...kw, ...patch };
    },
    [pendingEdits],
  );

  /** 同趣旨・同階層のうち1件でも作成済みなら作成済みとして扱う（ミドル⇔ミドルのみ、クラスター⇔クラスターのみ伝播） */
  const effectiveWorkflowFlags = useMemo(() => {
    const map = new Map<string, WorkflowFlag>();
    const mergedList = allKeywords.map((kw) => getMergedKw(kw));
    const isCreated = (m: MasterKeyword) =>
      m.workflowFlag === "created" || (m.assignedArticles?.length ?? 0) > 0;
    const tierGroup = (t?: KeywordTier) =>
      t === "longtail" ? "longtail" : "middle";
    for (const m of mergedList) {
      const base: WorkflowFlag =
        m.workflowFlag ?? (m.assignedArticles?.length ? "created" : "pending");
      if (base === "created") {
        map.set(m.keyword, "created");
        continue;
      }
      const gid = m.intentGroupId ?? m.parentId ?? m.groupId ?? null;
      if (!gid) {
        map.set(m.keyword, base);
        continue;
      }
      const myTier = tierGroup(m.keywordTier);
      const sameGroup = mergedList.filter(
        (o) =>
          (o.intentGroupId ?? o.parentId ?? o.groupId ?? null) === gid &&
          tierGroup(o.keywordTier) === myTier,
      );
      const anyCreated = sameGroup.some((o) => isCreated(o));
      map.set(m.keyword, anyCreated ? "created" : base);
    }
    return map;
  }, [allKeywords, getMergedKw]);

  const onPendingEdit = useCallback(
    (keyword: string, patch: Partial<MasterKeyword>): void => {
      setPendingEdits((prev) => {
        const next = { ...prev };
        const current = next[keyword] ?? {};
        next[keyword] = { ...current, ...patch };
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    fetchKeywordData();
    fetchBusinessCoverage();
    fetchAllKeywords();
  }, []);

  useEffect(() => {
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((d) => {
        const tags = d.tags?.map((t: { tag: string }) => t.tag) ?? [];
        setAllTags(tags);
      })
      .catch(() => {});
  }, []);

  const fetchKeywordData = async () => {
    try {
      const response = await fetch("/api/admin/keywords/analyze");
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
  };

  const fetchBusinessCoverage = async () => {
    try {
      const response = await fetch("/api/admin/keywords/master");
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
  };

  const fetchAllKeywords = async () => {
    try {
      const response = await fetch("/api/admin/keywords/master");
      if (response.ok) {
        const data = await response.json();
        setAllKeywords(data.keywords || []);
      }
    } catch (error) {
      console.error("Failed to fetch all keywords:", error);
    }
  };

  const filteredAndSortedKeywords = useMemo(
    () =>
      allKeywords
        .filter((kw) => {
          if (
            selectedBusiness !== "all" &&
            !kw.relatedBusiness.includes(selectedBusiness)
          )
            return false;
          if (
            searchQuery &&
            !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
          )
            return false;
          if (filterPriority && kw.priority !== filterPriority) return false;
          if (filterStatus && kw.status !== filterStatus) return false;
          if (filterUsage === "used" && kw.assignedArticles.length === 0)
            return false;
          if (filterUsage === "unused" && kw.assignedArticles.length > 0)
            return false;
          const tier = kw.keywordTier ?? "middle";
          if (filterKeywordTier && tier !== filterKeywordTier) return false;
          const flag =
            effectiveWorkflowFlags.get(kw.keyword) ??
            kw.workflowFlag ??
            (kw.assignedArticles?.length ? "created" : "pending");
          if (filterWorkflowFlag && flag !== filterWorkflowFlag) return false;
          return true;
        })
        .sort((a, b) => {
          if (sortBy === "priority") return b.priority - a.priority;
          if (sortBy === "pv") return b.estimatedPv - a.estimatedPv;
          if (sortBy === "businessImpact") {
            const ai = a.businessImpact ?? 0;
            const bi = b.businessImpact ?? 0;
            return bi - ai;
          }
          return a.keyword.localeCompare(b.keyword, "ja");
        }),
    [
      allKeywords,
      selectedBusiness,
      searchQuery,
      filterPriority,
      filterStatus,
      filterUsage,
      filterKeywordTier,
      filterWorkflowFlag,
      sortBy,
      effectiveWorkflowFlags,
    ],
  );

  const groupedByIntent = useMemo(() => {
    const map = new Map<string, MasterKeyword[]>();
    const effectiveGid = (kw: MasterKeyword) => {
      const raw =
        kw.intentGroupId?.trim() ||
        kw.parentId?.trim() ||
        kw.groupId ||
        "_ungrouped";
      return raw || kw.groupId || "_ungrouped";
    };
    for (const kw of filteredAndSortedKeywords) {
      const gid = effectiveGid(kw);
      const arr = map.get(gid) ?? [];
      arr.push(kw);
      map.set(gid, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const tierOrder = (t: KeywordTier | undefined) =>
          t === "big" ? 0 : t === "middle" ? 1 : 2;
        const ta = tierOrder(a.keywordTier);
        const tb = tierOrder(b.keywordTier);
        if (ta !== tb) return ta - tb;
        const oa = a.orderInGroup ?? 0;
        const ob = b.orderInGroup ?? 0;
        if (oa !== ob) return oa - ob;
        return b.priority - a.priority || b.estimatedPv - a.estimatedPv;
      });
    }
    const entries = Array.from(map.entries()).sort(([a], [b]) =>
      a === "_ungrouped" ? 1 : b === "_ungrouped" ? -1 : a.localeCompare(b),
    );
    return entries.map(([gid, kws]) => {
      const middle = kws.filter(
        (k) => k.keywordTier === "middle" || k.keywordTier === "big",
      );
      const longtail = kws.filter((k) => k.keywordTier === "longtail");
      const label =
        gid === "_ungrouped"
          ? "同趣旨未設定"
          : (kws[0]?.mainKeywordInSameIntent ??
            middle[0]?.keyword ??
            kws[0]?.keyword ??
            gid.slice(0, 30));
      return { gid, label, kws, middle, longtail };
    });
  }, [filteredAndSortedKeywords]);

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      const updates = Object.entries(pendingEdits).map(([keyword, patch]) => ({
        keyword,
        estimatedPv: patch.estimatedPv,
        expectedRank: patch.expectedRank,
        cvr: patch.cvr,
        relatedTags: patch.relatedTags,
        workflowFlag: patch.workflowFlag,
        parentId: patch.parentId,
        keywordTier: patch.keywordTier,
        orderInGroup: patch.orderInGroup,
      }));
      const filtered = updates.filter(
        (u) =>
          u.estimatedPv !== undefined ||
          u.expectedRank !== undefined ||
          u.cvr !== undefined ||
          u.relatedTags !== undefined ||
          u.workflowFlag !== undefined ||
          u.parentId !== undefined ||
          u.keywordTier !== undefined ||
          u.orderInGroup !== undefined,
      );
      if (filtered.length > 0) {
        const res = await fetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: filtered }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "一括更新に失敗しました");
        }
      }
      const commitRes = await fetch("/api/admin/keywords/commit", {
        method: "POST",
      });
      if (!commitRes.ok) {
        const err = await commitRes.json().catch(() => ({}));
        throw new Error(err.error || "GitHubコミットに失敗しました");
      }
      setPendingEdits({});
      setNeedsCommit(false);
      setEditingCell(null);
      setOpenPopover(null);
      setTagSearchQuery("");
      await fetchAllKeywords();
      fetchKeywordData();
      fetchBusinessCoverage();
      alert("保存し、GitHubにコミットしました");
    } catch (e) {
      alert(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (keyword: string) => {
    if (!confirm(`「${keyword}」を削除しますか？`)) return;
    try {
      const response = await fetch(
        `/api/admin/keywords/master/${encodeURIComponent(keyword)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setNeedsCommit(true);
        alert("キーワードを削除しました");
        fetchAllKeywords();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete keyword:", error);
      alert("削除に失敗しました");
    }
  };

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
          const res = await fetch("/api/admin/keywords/master/bulk-update", {
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
    [groupedByIntent],
  );

  const handleMergeWithKeyword = useCallback(
    async (sourceKeyword: string, targetKeyword: string) => {
      const source = allKeywords.find((kw) => kw.keyword === sourceKeyword);
      const target = allKeywords.find((kw) => kw.keyword === targetKeyword);
      if (!source || !target?.groupId) return;
      const sourceRootId = source.parentId ?? source.groupId;
      const sameIntentGroup = sourceRootId
        ? allKeywords.filter((k) => (k.parentId ?? k.groupId) === sourceRootId)
        : [source];
      const groupIds = [
        ...new Set(
          sameIntentGroup
            .map((k) => k.groupId)
            .filter((id): id is string => !!id),
        ),
      ];
      const updates = groupIds.map((gid) => {
        const kw = sameIntentGroup.find((k) => k.groupId === gid)!;
        return { keyword: kw.keyword, parentId: target.groupId! };
      });
      setSaving(true);
      try {
        const res = await fetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "一括更新に失敗しました");
        }
        setNeedsCommit(true);
        setOpenMoveMenuKeyword(null);
        await fetchAllKeywords();
        alert("同趣旨でまとめました");
      } catch (e) {
        console.error(e);
        alert("まとめに失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [allKeywords],
  );

  const handleMoveToMiddle = useCallback(
    async (
      keyword: string,
      _targetMainKeyword: string,
      targetGroupId: string,
    ) => {
      try {
        const res = await fetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ keyword, parentId: targetGroupId }],
          }),
        });
        if (res.ok) {
          setNeedsCommit(true);
          setOpenMoveMenuKeyword(null);
          await fetchAllKeywords();
        }
      } catch (e) {
        console.error(e);
      }
    },
    [],
  );

  const handleTierChange = useCallback(
    async (keyword: string, newTier: KeywordTier) => {
      const kw = allKeywords.find((k) => k.keyword === keyword);
      if (!kw) return;
      const rootId = kw.intentGroupId ?? kw.parentId ?? kw.groupId;
      const groupKws = rootId
        ? allKeywords.filter((k) => (k.parentId ?? k.groupId) === rootId)
        : [kw];
      const middleInGroup = groupKws.filter(
        (k) => k.keywordTier === "middle" || k.keywordTier === "big",
      );
      const otherMiddle = middleInGroup.find((k) => k.keyword !== keyword);
      const patch = {
        keyword,
        keywordTier: newTier,
        parentId:
          newTier === "middle"
            ? null
            : (otherMiddle?.groupId ?? middleInGroup[0]?.groupId ?? null),
      };
      try {
        const res = await fetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [patch] }),
        });
        if (res.ok) {
          setNeedsCommit(true);
          setOpenMoveMenuKeyword(null);
          await fetchAllKeywords();
        }
      } catch (e) {
        console.error(e);
      }
    },
    [allKeywords],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {}),
  );

  const middleKeywordsForMove = useMemo(
    () =>
      allKeywords.filter(
        (k) => k.keywordTier === "middle" || k.keywordTier === "big",
      ),
    [allKeywords],
  );

  const isClusterKw = (k: {
    keywordTier?: string;
    pillarSlug?: string | null;
  }) => k.keywordTier === "longtail" && (k.pillarSlug ?? null) != null;

  /** クラスター同士で同趣旨にまとめる候補＝自分以外の全クラスター（他ミドル配下も含む） */
  const allClustersForMerge = useMemo(
    () => allKeywords.filter((k) => isClusterKw(k)),
    [allKeywords],
  );

  const handleMergeClusterWithCluster = useCallback(
    async (sourceKeyword: string, targetKeyword: string) => {
      const source = allKeywords.find((kw) => kw.keyword === sourceKeyword);
      if (!source) return;
      const parentId = source.parentId ?? source.groupId;
      setSaving(true);
      try {
        const res = await fetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ keyword: targetKeyword, parentId }],
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "一括更新に失敗しました");
        }
        setNeedsCommit(true);
        setOpenMoveMenuKeyword(null);
        await fetchAllKeywords();
        alert("クラスター同士で同趣旨にまとめました");
      } catch (e) {
        console.error(e);
        alert("まとめに失敗しました");
      } finally {
        setSaving(false);
      }
    },
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

  const handleDetachFromSameIntent = useCallback(
    async (keyword: string) => {
      setSaving(true);
      try {
        const res = await fetch(
          `/api/admin/keywords/master/${encodeURIComponent(keyword)}/detach`,
          { method: "POST" },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "切り離しに失敗しました");
        }
        setNeedsCommit(true);
        setOpenMoveMenuKeyword(null);
        await fetchAllKeywords();
        fetchKeywordData();
        alert("同趣旨から切り離しました");
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "切り離しに失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const filteredConflicts = selectedBusiness === "all" ? conflicts : conflicts;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
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
        filterKeywordTier={filterKeywordTier}
        onFilterKeywordTierChange={setFilterKeywordTier}
        filterWorkflowFlag={filterWorkflowFlag}
        onFilterWorkflowFlagChange={setFilterWorkflowFlag}
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
              onClick={() => {
                setEditingKeyword(null);
                setModalInitial({ keywordTier: "middle" });
                setShowModal(true);
              }}
              className="px-4 py-2 border border-gray-800 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <LuPlus className="w-4 h-4" />
              キーワードを追加
            </button>
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

        {openPopover && (
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpenPopover(null)}
          />
        )}

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
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 w-[5.5rem] align-middle">
                    PV
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 w-[3.5rem] align-middle">
                    順位
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 align-middle">
                    CTR
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 w-[4.25rem] align-middle">
                    CVR
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 align-middle">
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
                const addMiddleToGroup = () => {
                  setModalInitial({ keywordTier: "middle" });
                  setEditingKeyword(null);
                  setShowModal(true);
                };
                const groupItems = [...middle, ...longtail].map(
                  (k) => k.keyword,
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
                          effectiveWorkflowFlag={getEffectiveFlag(
                            middle[0].keyword,
                          )}
                          leftContent={chevron}
                          tight
                          onAddCluster={() => {
                            setModalInitial({
                              keywordTier: "longtail",
                              parentId: middle[0].groupId ?? gid,
                              pillarSlug:
                                middle[0].assignedArticles?.[0] ?? undefined,
                            });
                            setEditingKeyword(null);
                            setShowModal(true);
                          }}
                          onMoveMenu={
                            <KeywordMoveMenu
                              kw={getMergedKw(middle[0])}
                              onDelete={() => handleDelete(middle[0].keyword)}
                              isOpen={openMoveMenuKeyword === middle[0].keyword}
                              onToggle={() =>
                                setOpenMoveMenuKeyword(
                                  openMoveMenuKeyword === middle[0].keyword
                                    ? null
                                    : middle[0].keyword,
                                )
                              }
                              onClose={() => setOpenMoveMenuKeyword(null)}
                              onTierChange={handleTierChange}
                              onMoveToMiddle={handleMoveToMiddle}
                              onMergeWithKeyword={handleMergeWithKeyword}
                              middleKeywords={middleKeywordsForMove}
                              mergeTargetKeywords={middleKeywordsForMove}
                              clusterKeywordsInSameMiddle={
                                isClusterKw(middle[0])
                                  ? allClustersForMerge.filter(
                                      (k) => k.keyword !== middle[0].keyword,
                                    )
                                  : []
                              }
                              onMergeClusterWithCluster={
                                handleMergeClusterWithCluster
                              }
                              canDetachFromSameIntent={
                                variantCountByGroupId[
                                  middle[0].groupId ?? ""
                                ] >= 2
                              }
                              onDetachFromSameIntent={
                                handleDetachFromSameIntent
                              }
                            />
                          }
                          onEdit={() => {
                            setEditingKeyword(middle[0]);
                            setShowModal(true);
                          }}
                          onDelete={() => handleDelete(middle[0].keyword)}
                          onCreate={() =>
                            router.push(
                              `/admin/claude?keyword=${encodeURIComponent(middle[0].keyword)}`,
                            )
                          }
                          {...baseRowProps}
                        />
                      ) : (
                        <tr>
                          <td className="py-1.5 px-4 align-middle">
                            {chevron}
                          </td>
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
                                onClick={addMiddleToGroup}
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
                            onAddCluster={() => {
                              setModalInitial({
                                keywordTier: "longtail",
                                parentId: kw.parentId ?? gid,
                                pillarSlug:
                                  kw.assignedArticles?.[0] ?? undefined,
                              });
                              setEditingKeyword(null);
                              setShowModal(true);
                            }}
                            onMoveMenu={
                              <KeywordMoveMenu
                                kw={getMergedKw(kw)}
                                onDelete={() => handleDelete(kw.keyword)}
                                isOpen={openMoveMenuKeyword === kw.keyword}
                                onToggle={() =>
                                  setOpenMoveMenuKeyword(
                                    openMoveMenuKeyword === kw.keyword
                                      ? null
                                      : kw.keyword,
                                  )
                                }
                                onClose={() => setOpenMoveMenuKeyword(null)}
                                onTierChange={handleTierChange}
                                onMoveToMiddle={handleMoveToMiddle}
                                onMergeWithKeyword={handleMergeWithKeyword}
                                middleKeywords={middleKeywordsForMove}
                                mergeTargetKeywords={middleKeywordsForMove}
                                clusterKeywordsInSameMiddle={
                                  isClusterKw(kw)
                                    ? allClustersForMerge.filter(
                                        (k) => k.keyword !== kw.keyword,
                                      )
                                    : []
                                }
                                onMergeClusterWithCluster={
                                  handleMergeClusterWithCluster
                                }
                                canDetachFromSameIntent={
                                  variantCountByGroupId[kw.groupId ?? ""] >= 2
                                }
                                onDetachFromSameIntent={
                                  handleDetachFromSameIntent
                                }
                              />
                            }
                            onEdit={() => {
                              setEditingKeyword(kw);
                              setShowModal(true);
                            }}
                            onDelete={() => handleDelete(kw.keyword)}
                            onCreate={() =>
                              router.push(
                                `/admin/claude?keyword=${encodeURIComponent(kw.keyword)}`,
                              )
                            }
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
                            onMoveMenu={
                              <KeywordMoveMenu
                                kw={getMergedKw(kw)}
                                onDelete={() => handleDelete(kw.keyword)}
                                isOpen={openMoveMenuKeyword === kw.keyword}
                                onToggle={() =>
                                  setOpenMoveMenuKeyword(
                                    openMoveMenuKeyword === kw.keyword
                                      ? null
                                      : kw.keyword,
                                  )
                                }
                                onClose={() => setOpenMoveMenuKeyword(null)}
                                onTierChange={handleTierChange}
                                onMoveToMiddle={handleMoveToMiddle}
                                onMergeWithKeyword={handleMergeWithKeyword}
                                middleKeywords={middleKeywordsForMove}
                                mergeTargetKeywords={middleKeywordsForMove}
                                clusterKeywordsInSameMiddle={
                                  isClusterKw(kw)
                                    ? allClustersForMerge.filter(
                                        (k) => k.keyword !== kw.keyword,
                                      )
                                    : []
                                }
                                onMergeClusterWithCluster={
                                  handleMergeClusterWithCluster
                                }
                                canDetachFromSameIntent={
                                  variantCountByGroupId[kw.groupId ?? ""] >= 2
                                }
                                onDetachFromSameIntent={
                                  handleDetachFromSameIntent
                                }
                              />
                            }
                            onEdit={() => {
                              setEditingKeyword(kw);
                              setShowModal(true);
                            }}
                            onDelete={() => handleDelete(kw.keyword)}
                            onCreate={() =>
                              router.push(
                                `/admin/claude?keyword=${encodeURIComponent(kw.keyword)}`,
                              )
                            }
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
          initialKeywordTier={modalInitial?.keywordTier}
          initialParentId={modalInitial?.parentId}
        />
      )}
    </div>
  );
}
