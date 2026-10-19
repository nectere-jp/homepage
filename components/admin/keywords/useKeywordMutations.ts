"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "@/lib/toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { MasterKeyword, EditingCell, KeywordTier } from "./types";

/**
 * キーワードの編集/保存/削除/移動/マージ/切り離し等の mutation を一括提供する hook。
 *
 * state:
 * - pendingEdits: 行ごとのローカル編集差分
 * - saving: 保存中フラグ
 * - needsCommit: ローカル mutation 後に GitHub commit が必要かどうか
 *
 * 呼び出し元から渡すのは `allKeywords`（最新状態）と、再フェッチ用のコールバック群。
 */
export function useKeywordMutations(opts: {
  allKeywords: MasterKeyword[];
  fetchAllKeywords: () => Promise<void> | void;
  fetchKeywordData: () => Promise<void> | void;
  fetchBusinessCoverage: () => Promise<void> | void;
  setEditingCell: Dispatch<SetStateAction<EditingCell | null>>;
  setOpenPopover: (next: null) => void;
  setOpenMoveMenuKeyword: (next: string | null) => void;
  setTagSearchQuery: (next: string) => void;
}) {
  const {
    allKeywords,
    fetchAllKeywords,
    fetchKeywordData,
    fetchBusinessCoverage,
    setEditingCell,
    setOpenPopover,
    setOpenMoveMenuKeyword,
    setTagSearchQuery,
  } = opts;

  const confirm = useConfirm();

  const [pendingEdits, setPendingEdits] = useState<
    Record<string, Partial<MasterKeyword>>
  >({});
  const [saving, setSaving] = useState(false);
  const [needsCommit, setNeedsCommit] = useState(false);

  const dirty = Object.keys(pendingEdits).length > 0 || needsCommit;

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

  const onRevertPendingEdit = useCallback(
    (keyword: string): void => {
      setPendingEdits((prev) => {
        const next = { ...prev };
        delete next[keyword];
        return next;
      });
      setEditingCell((prev) => (prev?.keyword === keyword ? null : prev));
    },
    [setEditingCell],
  );

  const revertAll = useCallback(() => {
    setPendingEdits({});
    setEditingCell(null);
  }, [setEditingCell]);

  const handleSave = useCallback(async () => {
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
      await fetchKeywordData();
      await fetchBusinessCoverage();
      toast.success("保存し、GitHubにコミットしました");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [
    dirty,
    pendingEdits,
    fetchAllKeywords,
    fetchKeywordData,
    fetchBusinessCoverage,
    setEditingCell,
    setOpenPopover,
    setTagSearchQuery,
  ]);

  const handleDelete = useCallback(
    async (keyword: string) => {
      const ok = await confirm({
        title: `「${keyword}」を削除しますか？`,
        confirmLabel: "削除",
        variant: "danger",
      });
      if (!ok) return;
      try {
        const response = await adminFetch(
          `/api/admin/keywords/master/${encodeURIComponent(keyword)}`,
          { method: "DELETE" },
        );
        if (response.ok) {
          setNeedsCommit(true);
          toast.success("キーワードを削除しました");
          await fetchAllKeywords();
        } else {
          toast.error("削除に失敗しました");
        }
      } catch (error) {
        console.error("Failed to delete keyword:", error);
        toast.error("削除に失敗しました");
      }
    },
    [confirm, fetchAllKeywords],
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
        toast.success("同趣旨でまとめました");
      } catch (e) {
        console.error(e);
        toast.error("まとめに失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [allKeywords, fetchAllKeywords, setOpenMoveMenuKeyword],
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
    [fetchAllKeywords, setOpenMoveMenuKeyword],
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
    [allKeywords, fetchAllKeywords, setOpenMoveMenuKeyword],
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
        toast.success("クラスター同士で同趣旨にまとめました");
      } catch (e) {
        console.error(e);
        toast.error("まとめに失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [allKeywords, fetchAllKeywords, setOpenMoveMenuKeyword],
  );

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
        await fetchKeywordData();
        toast.success("同趣旨から切り離しました");
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "切り離しに失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [fetchAllKeywords, fetchKeywordData, setOpenMoveMenuKeyword],
  );

  return {
    // state
    pendingEdits,
    setPendingEdits,
    saving,
    needsCommit,
    setNeedsCommit,
    dirty,
    // edit helpers
    onPendingEdit,
    onRevertPendingEdit,
    revertAll,
    // mutations
    handleSave,
    handleDelete,
    handleMergeWithKeyword,
    handleMoveToMiddle,
    handleTierChange,
    handleMergeClusterWithCluster,
    handleDetachFromSameIntent,
  };
}
