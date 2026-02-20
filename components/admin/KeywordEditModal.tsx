"use client";

import { useState, useEffect, useMemo } from "react";
import { LuX, LuStar } from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";
import type { KeywordTier, WorkflowFlag } from "@/lib/keyword-manager";
import {
  BUSINESS_LABELS,
  KEYWORD_TIER_LABELS,
  STATUS_LABELS,
  WORKFLOW_FLAG_LABELS,
} from "@/components/admin/keywords/constants";
import { TagSelector } from "@/components/admin/TagSelector";

/** 同趣旨グループ選択用（groupId + 代表ラベル） */
interface GroupOption {
  groupId: string;
  label: string;
  keywordTier: KeywordTier;
}

/** 編集対象のキーワード（API形に近い） */
interface TargetKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: number | null;
  status: "active" | "paused" | "achieved";
  assignedArticles?: string[];
  keywordTier?: KeywordTier;
  expectedRank?: number | null;
  cvr?: number | null;
  workflowFlag?: WorkflowFlag;
  /** APIから受け取るがモーダルでは編集しない */
  pillarSlug?: string | null;
  parentId?: string | null;
}

/** 渡された prop をモーダル用の TargetKeyword 形に正規化する（詳細ページはグループ形で keyword が variants[0] にある） */
function normalizeKeywordProp(prop: TargetKeyword | null): TargetKeyword | null {
  if (!prop || typeof prop !== "object") return null;
  const p = prop as unknown as Record<string, unknown>;
  const variants = p.variants as { keyword?: string; estimatedPv?: number; currentRank?: number | null; expectedRank?: number | null; cvr?: number | null }[] | undefined;
  const v = Array.isArray(variants) ? variants[0] : null;
  const keywordStr =
    (typeof p.keyword === "string" ? p.keyword : null) ??
    (v && typeof v.keyword === "string" ? v.keyword : null) ??
    (typeof p.id === "string" ? p.id : null) ??
    "";
  const tier = (p.keywordTier as KeywordTier) ?? (p.tier as KeywordTier);
  return {
    keyword: keywordStr,
    priority: ((p.priority as number) ?? 3) as 1 | 2 | 3 | 4 | 5,
    estimatedPv: (v?.estimatedPv ?? (p.estimatedPv as number)) ?? 0,
    relatedBusiness: (Array.isArray(p.relatedBusiness) ? p.relatedBusiness : []) as BusinessType[],
    relatedTags: (Array.isArray(p.relatedTags) ? p.relatedTags : []) as string[],
    currentRank: v?.currentRank ?? (p.currentRank as number | null) ?? null,
    status: (p.status as "active" | "paused" | "achieved") ?? "active",
    assignedArticles: p.assignedArticles as string[] | undefined,
    keywordTier: tier,
    expectedRank: v?.expectedRank ?? (p.expectedRank as number | null) ?? null,
    cvr: v?.cvr ?? (p.cvr as number | null) ?? null,
    workflowFlag: p.workflowFlag as WorkflowFlag | undefined,
    pillarSlug: p.pillarSlug as string | null | undefined,
    parentId: p.parentId as string | null | undefined,
  };
}

interface KeywordEditModalProps {
  keyword: TargetKeyword | null;
  onClose: () => void;
  onSave: () => void;
  initialKeywordTier?: KeywordTier;
  /** 新規ロングテール追加時に親ミドルの groupId */
  initialParentId?: string | null;
  /** 新規で同趣旨グループに追加する場合の groupId（未指定なら新規グループ作成） */
  initialAddToGroupId?: string | null;
}

export function KeywordEditModal({
  keyword: keywordProp,
  onClose,
  onSave,
  initialKeywordTier,
  initialParentId,
  initialAddToGroupId,
}: KeywordEditModalProps) {
  const keyword = normalizeKeywordProp(keywordProp);
  const isNew = !keyword;
  const [formData, setFormData] = useState({
    keyword: keyword?.keyword ?? "",
    priority: keyword?.priority ?? 3,
    estimatedPv: keyword?.estimatedPv ?? 0,
    relatedBusiness: keyword?.relatedBusiness ?? [],
    relatedTags: keyword?.relatedTags ?? [],
    currentRank: keyword?.currentRank?.toString() ?? "",
    status: keyword?.status ?? "active",
    keywordTier: (keyword?.keywordTier ?? (isNew ? initialKeywordTier : undefined) ?? "middle") as KeywordTier,
    expectedRank: keyword?.expectedRank ?? keyword?.currentRank ?? "",
    cvr: keyword?.cvr != null ? String(keyword.cvr * 100) : "",
    workflowFlag: (keyword?.workflowFlag ||
      (keyword?.assignedArticles?.length
        ? "created"
        : "pending")) as WorkflowFlag,
    addToGroupId: (isNew ? initialAddToGroupId ?? "" : "") as string,
    parentId: (keyword?.parentId ?? (isNew ? initialParentId ?? "" : "")) as string,
  });
  const [saving, setSaving] = useState(false);
  const [groupsForSelect, setGroupsForSelect] = useState<GroupOption[]>([]);

  useEffect(() => {
    if (keyword) {
      setFormData((prev) => ({
        ...prev,
        keyword: keyword.keyword ?? "",
        priority: keyword.priority ?? 3,
        estimatedPv: keyword.estimatedPv ?? 0,
        relatedBusiness: keyword.relatedBusiness ?? [],
        relatedTags: keyword.relatedTags ?? [],
        currentRank: keyword.currentRank?.toString() ?? "",
        status: keyword.status ?? "active",
        keywordTier: (keyword.keywordTier ?? "middle") as KeywordTier,
        expectedRank: keyword.expectedRank ?? keyword.currentRank ?? "",
        cvr: keyword.cvr != null ? String(keyword.cvr * 100) : "",
        workflowFlag: (keyword.workflowFlag ||
          (keyword.assignedArticles?.length
            ? "created"
            : "pending")) as WorkflowFlag,
      }));
    } else if (initialKeywordTier !== undefined || initialParentId !== undefined || initialAddToGroupId !== undefined) {
      setFormData((prev) => ({
        ...prev,
        ...(initialKeywordTier != null && { keywordTier: initialKeywordTier }),
        ...(initialParentId != null && initialParentId !== "" && { parentId: initialParentId }),
        ...(initialAddToGroupId != null && initialAddToGroupId !== "" && { addToGroupId: initialAddToGroupId }),
      }));
    }
  }, [keyword, initialKeywordTier, initialParentId, initialAddToGroupId]);

  useEffect(() => {
    if (!isNew) return;
    fetch("/api/admin/keywords/master")
      .then((r) => r.json())
      .then((data) => {
        const list = data.keywords as Array<{
          groupId?: string;
          intentGroupId?: string;
          keyword?: string;
          mainKeywordInSameIntent?: string;
          keywordTier?: string;
        }>;
        if (!Array.isArray(list)) return;
        // 同趣旨（intentGroupId）ごとに1オプションにし、代表はルートの groupId を使う（重複表示を防ぐ）
        const byIntentId = new Map<string, GroupOption>();
        for (const row of list) {
          const gid = typeof row.groupId === "string" ? row.groupId.trim() : "";
          const intentId = (typeof row.intentGroupId === "string" ? row.intentGroupId.trim() : gid) || gid;
          if (!gid) continue;
          const isRoot = gid === intentId;
          const label = row.mainKeywordInSameIntent ?? row.keyword ?? gid;
          const keywordTier = (row.keywordTier ?? "middle") as KeywordTier;
          if (!byIntentId.has(intentId)) {
            byIntentId.set(intentId, { groupId: gid, label, keywordTier });
          } else if (isRoot) {
            // 既に子で登録されている場合は、ルートの行で上書き（代表は親ミドルにしたい）
            byIntentId.set(intentId, { groupId: gid, label, keywordTier });
          }
        }
        const options = Array.from(byIntentId.values()).sort((a, b) =>
          a.label.localeCompare(b.label, "ja"),
        );
        setGroupsForSelect(options);
      })
      .catch(() => {});
  }, [isNew]);

  const middleGroupOptions = useMemo(
    () => groupsForSelect.filter((g) => g.keywordTier === "middle" || g.keywordTier === "big"),
    [groupsForSelect],
  );

  const handleBusinessToggle = (business: BusinessType) => {
    setFormData((prev) => ({
      ...prev,
      relatedBusiness: prev.relatedBusiness.includes(business)
        ? prev.relatedBusiness.filter((b) => b !== business)
        : [...prev.relatedBusiness, business],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cvrNum = formData.cvr ? parseFloat(formData.cvr) / 100 : null;
      const er = parseInt(String(formData.expectedRank), 10);
      const data: Record<string, unknown> = {
        ...formData,
        relatedTags: formData.relatedTags,
        currentRank: formData.currentRank
          ? parseInt(formData.currentRank)
          : null,
        estimatedPv: parseInt(formData.estimatedPv.toString()),
        keywordTier: formData.keywordTier,
        expectedRank: !isNaN(er) ? er : null,
        cvr: cvrNum != null && !isNaN(cvrNum) ? cvrNum : null,
        workflowFlag: formData.workflowFlag,
      };
      // ロングテールで親を指定した場合は新規ロングテールとして作成（同趣旨追加にしない）
      if (isNew && formData.keywordTier === "longtail" && formData.parentId) {
        data.parentId = formData.parentId;
      } else if (isNew && formData.addToGroupId) {
        data.addToGroupId = formData.addToGroupId;
      }

      const url = isNew
        ? "/api/admin/keywords/master"
        : `/api/admin/keywords/master/${encodeURIComponent(formData.keyword)}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(isNew ? "キーワードを登録しました" : "キーワードを更新しました");
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "保存に失敗しました");
      }
    } catch (error) {
      console.error("Failed to save keyword:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const renderPrioritySelector = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, priority: p as any }))
            }
            className={`p-3 rounded-lg border-2 transition-all ${
              formData.priority === p
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex gap-0.5">
              {[...Array(p)].map((_, i) => (
                <LuStar
                  key={i}
                  className={`w-5 h-5 ${
                    formData.priority >= p
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {isNew ? "新規キーワード登録" : "キーワード編集"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LuX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* キーワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キーワード <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isNew}
              value={formData.keyword ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, keyword: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              placeholder="例: 野球 勉強 両立"
            />
            {!isNew && (
              <p className="mt-1 text-sm text-gray-500">
                キーワードは編集できません
              </p>
            )}
          </div>

          {/* 重要度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              重要度 <span className="text-red-500">*</span>
            </label>
            {renderPrioritySelector()}
          </div>

          {/* 想定PV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              想定月間PV数
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedPv}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedPv: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: 5000"
            />
          </div>

          {/* 関連事業 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              関連事業 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleBusinessToggle(key as BusinessType)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.relatedBusiness.includes(key as BusinessType)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 関連タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              関連タグ
            </label>
            <TagSelector
              selectedTags={formData.relatedTags}
              onChange={(tags) =>
                setFormData((prev) => ({ ...prev, relatedTags: tags }))
              }
              placeholder="タグを選択または追加してください"
            />
          </div>

          {/* キーワード階層 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キーワード階層
            </label>
            <div className="flex gap-2">
              {(["big", "middle", "longtail"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, keywordTier: tier }))
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.keywordTier === tier
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {KEYWORD_TIER_LABELS[tier]}
                </button>
              ))}
            </div>
          </div>

          {/* 新規時: 同趣旨のキーワードグループ（任意）・親ミドル */}
          {isNew && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  同趣旨のキーワードグループ（任意）
                </label>
                <select
                  value={formData.addToGroupId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      addToGroupId: e.target.value,
                      ...(e.target.value ? { parentId: "" } : {}),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="">新規グループとして作成</option>
                  {groupsForSelect.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  選択すると、このキーワードはそのグループのバリアントとして追加されます
                </p>
              </div>
              {formData.keywordTier === "longtail" && !formData.addToGroupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    親となるミドルキーワード
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="">指定しない</option>
                    {middleGroupOptions.map((g) => (
                      <option key={g.groupId} value={g.groupId}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* 予想検索順位・CVR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                予想検索順位
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.expectedRank}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expectedRank: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: 5"
              />
              <p className="mt-1 text-xs text-gray-500">
                CTRは自動算出されます
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVR（%）
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.cvr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cvr: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例: 2"
              />
            </div>
          </div>

          {/* 現在の順位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現在の検索順位（実測）
            </label>
            <input
              type="number"
              min="1"
              value={formData.currentRank}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentRank: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: 15"
            />
          </div>

          {/* ワークフローフラグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ワークフローフラグ
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(WORKFLOW_FLAG_LABELS) as [WorkflowFlag, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      workflowFlag: val,
                    }))
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.workflowFlag === val
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <div className="flex gap-2">
              {(
                Object.entries(STATUS_LABELS) as [
                  "active" | "paused" | "achieved",
                  string,
                ][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: val,
                    }))
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.status === val
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                !formData.keyword ||
                (!formData.addToGroupId && formData.relatedBusiness.length === 0)
              }
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "保存中..." : isNew ? "登録" : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
