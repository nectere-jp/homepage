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
  LuUndo2,
  LuChevronDown,
  LuChevronRight,
  LuClipboard,
  LuCheck,
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
  CLUSTER_AXIS_LABELS,
  type MasterKeyword,
  type EditingCell,
  type OpenPopover,
  type BusinessCoverage,
  type ConflictKeywordData,
  type KeywordTier,
  type ClusterAxis,
  type ArticleStatus,
  type SortByOption,
} from "@/components/admin/keywords";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";

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
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [modalInitial, setModalInitial] = useState<{
    parentId?: string | null;
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

  /** ポップオーバーを開くとき移動メニューを閉じる */
  const handleSetOpenPopover = useCallback((v: OpenPopover | null) => {
    setOpenMoveMenuKeyword(null);
    setOpenPopover(v);
  }, []);

  /** 移動メニューをトグルするときポップオーバーを閉じる */
  const handleToggleMoveMenu = useCallback((keyword: string) => {
    setOpenPopover(null);
    setOpenMoveMenuKeyword((prev) => (prev === keyword ? null : keyword));
  }, []);

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

  const onRevertPendingEdit = useCallback((keyword: string): void => {
    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[keyword];
      return next;
    });
    setEditingCell((prev) => (prev?.keyword === keyword ? null : prev));
  }, []);

  useEffect(() => {
    fetchKeywordData();
    fetchBusinessCoverage();
    fetchAllKeywords();
  }, []);

  useEffect(() => {
    adminFetch("/api/admin/tags")
      .then((r) => r.json())
      .then((d) => {
        const tags = d.tags?.map((t: { tag: string }) => t.tag) ?? [];
        setAllTags(tags);
      })
      .catch(() => {});
  }, []);

  const fetchKeywordData = async () => {
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
  };

  const fetchBusinessCoverage = async () => {
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
  };

  const fetchAllKeywords = async () => {
    try {
      const response = await adminFetch("/api/admin/keywords/master");
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
          if (filterClusterAxis && kw.clusterAxis !== filterClusterAxis) return false;
          if (filterArticleStatus) {
            const status = effectiveWorkflowFlags.get(kw.keyword) ?? "pending";
            if (status !== filterArticleStatus) return false;
          }
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
      filterClusterAxis,
      filterArticleStatus,
      sortBy,
      effectiveWorkflowFlags,
    ],
  );

  const groupedByIntent = useMemo(() => {
    // V5: clusterAxis ごとにグループ化（ハブ先頭、子記事が後続）
    const AXIS_ORDER: ClusterAxis[] = [
      "career",
      "time",
      "self",
      "relationship",
      "other",
    ];

    const axisMap = new Map<string, MasterKeyword[]>();
    for (const kw of filteredAndSortedKeywords) {
      const axis = kw.clusterAxis ?? "other";
      const arr = axisMap.get(axis) ?? [];
      arr.push(kw);
      axisMap.set(axis, arr);
    }

    for (const arr of axisMap.values()) {
      arr.sort((a, b) => {
        const roleOrder = (r: string | undefined) => (r === "hub" ? 0 : 1);
        const ra = roleOrder(a.articleRole);
        const rb = roleOrder(b.articleRole);
        if (ra !== rb) return ra - rb;
        const oa = a.orderInGroup ?? 0;
        const ob = b.orderInGroup ?? 0;
        if (oa !== ob) return oa - ob;
        return b.priority - a.priority || b.estimatedPv - a.estimatedPv;
      });
    }

    const axes = [
      ...AXIS_ORDER,
      ...Array.from(axisMap.keys()).filter(
        (a) => !AXIS_ORDER.includes(a as ClusterAxis),
      ),
    ];

    return axes
      .filter((axis) => axisMap.has(axis))
      .map((axis) => {
        const kws = axisMap.get(axis)!;
        const middle = kws.filter((k) => k.articleRole === "hub");
        const longtail = kws.filter((k) => k.articleRole !== "hub");
        const label =
          CLUSTER_AXIS_LABELS[axis as ClusterAxis] ?? axis;
        return { gid: axis, label, kws, middle, longtail };
      });
  }, [filteredAndSortedKeywords]);

  const handleCopyForLLM = async () => {
    const roleLabel = (r?: string) => (r === "hub" ? "ハブ" : "チャイルド");

    // キーワードセクション
    const kwLines: string[] = [
      `## キーワード一覧（${filteredAndSortedKeywords.length}件）`,
      "",
    ];
    for (const { label, middle, longtail } of groupedByIntent) {
      kwLines.push(`### ${label}`);
      for (const kw of middle) {
        const merged = getMergedKw(kw);
        const parts = [`**[${roleLabel(merged.articleRole)}] ${merged.keyword}**`];
        if (merged.estimatedPv) parts.push(`月間PV: ${merged.estimatedPv.toLocaleString()}`);
        if (merged.expectedRank) parts.push(`期待順位: ${merged.expectedRank}位`);
        if (merged.cvr != null) parts.push(`CVR: ${merged.cvr}%`);
        kwLines.push(parts.join(" | "));
        if (merged.relatedTags?.length) kwLines.push(`  タグ: ${merged.relatedTags.join(", ")}`);
        if (merged.assignedArticles?.length) kwLines.push(`  記事: ${merged.assignedArticles.join(", ")}`);
      }
      for (const kw of longtail) {
        const merged = getMergedKw(kw);
        const parts = [`  - ${merged.keyword}`];
        if (merged.estimatedPv) parts.push(`月間PV: ${merged.estimatedPv.toLocaleString()}`);
        if (merged.expectedRank) parts.push(`期待順位: ${merged.expectedRank}位`);
        kwLines.push(parts.join(" | "));
      }
      kwLines.push("");
    }

    // 記事セクション
    let postLines: string[] = [];
    try {
      const res = await adminFetch("/api/admin/posts?includeDrafts=true");
      if (res.ok) {
        const data = await res.json();
        const posts: Array<{
          title: string;
          slug: string;
          description: string;
          tags: string[];
          published: boolean;
          seo: { primaryKeyword?: string; secondaryKeywords?: string[] };
        }> = data.posts ?? [];
        postLines = [
          `## 記事一覧（${posts.length}件）`,
          "",
          ...posts.flatMap((p) => {
            const lines = [`### ${p.title}${p.published === false ? " [下書き]" : ""}`];
            lines.push(`- URL: /ja/blog/${p.slug}`);
            if (p.seo.primaryKeyword) lines.push(`- メインキーワード: ${p.seo.primaryKeyword}`);
            if (p.seo.secondaryKeywords?.length) lines.push(`- サブキーワード: ${p.seo.secondaryKeywords.join(", ")}`);
            if (p.tags?.length) lines.push(`- タグ: ${p.tags.join(", ")}`);
            if (p.description) lines.push(`- 概要: ${p.description}`);
            return [...lines, ""];
          }),
        ];
      }
    } catch {
      // 記事取得失敗は無視してキーワードだけコピー
    }

    const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    const text = [
      `# サイト現況スナップショット（${today}）`,
      "",
      kwLines.join("\n"),
      postLines.join("\n"),
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

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
        articleStatus: patch.articleStatus,
        orderInGroup: patch.orderInGroup,
      }));
      const filtered = updates.filter(
        (u) =>
          u.estimatedPv !== undefined ||
          u.expectedRank !== undefined ||
          u.cvr !== undefined ||
          u.relatedTags !== undefined ||
          u.articleStatus !== undefined ||
          u.orderInGroup !== undefined,
      );
      if (filtered.length > 0) {
        const res = await adminFetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: filtered }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "一括更新に失敗しました");
        }
      }
      const commitRes = await adminFetch("/api/admin/keywords/commit", {
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
      const response = await adminFetch(
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
      setOpenMoveMenuKeyword(null);
      setSaving(true);
      try {
        const res = await adminFetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "一括更新に失敗しました");
        }
        setNeedsCommit(true);
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
      setOpenMoveMenuKeyword(null);
      try {
        const res = await adminFetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ keyword, parentId: targetGroupId }],
          }),
        });
        if (res.ok) {
          setNeedsCommit(true);
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
      setOpenMoveMenuKeyword(null);
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
        const res = await adminFetch("/api/admin/keywords/master/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [patch] }),
        });
        if (res.ok) {
          setNeedsCommit(true);
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
    () => allKeywords.filter((k) => k.articleRole === "hub"),
    [allKeywords],
  );

  const isClusterKw = (k: {
    articleRole?: string;
    hubArticleSlug?: string | null;
  }) => k.articleRole === "child" && (k.hubArticleSlug ?? null) != null;

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
      setOpenMoveMenuKeyword(null);
      setSaving(true);
      try {
        const res = await adminFetch("/api/admin/keywords/master/bulk-update", {
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
      setOpenMoveMenuKeyword(null);
      setSaving(true);
      try {
        const res = await adminFetch(
          `/api/admin/keywords/master/${encodeURIComponent(keyword)}/detach`,
          { method: "POST" },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "切り離しに失敗しました");
        }
        setNeedsCommit(true);
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
      <LoadingSpinner />
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
                onClick={() => {
                  setPendingEdits({});
                  setEditingCell(null);
                }}
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
                const addMiddleToGroup = () => {
                  setModalInitial({});
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
                  setOpenPopover: handleSetOpenPopover,
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
                              parentId: middle[0].groupId ?? gid,
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
                                handleToggleMoveMenu(middle[0].keyword)
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
                          hasPendingEdit={!!pendingEdits[middle[0].keyword]}
                          onRevertEdit={() => onRevertPendingEdit(middle[0].keyword)}
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
                                parentId: kw.parentId ?? gid,
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
                                  handleToggleMoveMenu(kw.keyword)
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
                            onMoveMenu={
                              <KeywordMoveMenu
                                kw={getMergedKw(kw)}
                                onDelete={() => handleDelete(kw.keyword)}
                                isOpen={openMoveMenuKeyword === kw.keyword}
                                onToggle={() =>
                                  handleToggleMoveMenu(kw.keyword)
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
