"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/admin/Modal";
import type {
  KeywordTier,
  WorkflowFlag,
  ClusterAxis,
  ArticleRole,
  TargetReader,
} from "@/lib/keyword-manager";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "@/lib/toast";
import { BasicFields } from "./BasicFields";
import { GroupSelector } from "./GroupSelector";
import { V5Fields } from "./V5Fields";
import { normalizeKeywordProp } from "./types";
import type { KeywordFormData, TargetKeyword } from "./types";

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
  const keyword = useMemo(() => normalizeKeywordProp(keywordProp), [keywordProp]);
  const isNew = !keyword;
  const [formData, setFormData] = useState<KeywordFormData>({
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
      (keyword?.assignedArticles?.length ? "created" : "pending")) as WorkflowFlag,
    clusterAxis: (keyword?.clusterAxis ?? "other") as ClusterAxis,
    articleRole: (keyword?.articleRole ?? "child") as ArticleRole,
    targetReader: (keyword?.targetReader ?? null) as TargetReader | null,
    hubArticleSlug: keyword?.hubArticleSlug ?? "",
    addToGroupId: (isNew ? initialAddToGroupId ?? "" : "") as string,
    parentId: (keyword?.parentId ?? (isNew ? initialParentId ?? "" : "")) as string,
  });
  const [saving, setSaving] = useState(false);

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
          (keyword.assignedArticles?.length ? "created" : "pending")) as WorkflowFlag,
        clusterAxis: (keyword.clusterAxis ?? "other") as ClusterAxis,
        articleRole: (keyword.articleRole ?? "child") as ArticleRole,
        targetReader: (keyword.targetReader ?? null) as TargetReader | null,
        hubArticleSlug: keyword.hubArticleSlug ?? "",
      }));
    } else if (
      initialKeywordTier !== undefined ||
      initialParentId !== undefined ||
      initialAddToGroupId !== undefined
    ) {
      setFormData((prev) => ({
        ...prev,
        ...(initialKeywordTier != null && { keywordTier: initialKeywordTier }),
        ...(initialParentId != null && initialParentId !== "" && { parentId: initialParentId }),
        ...(initialAddToGroupId != null && initialAddToGroupId !== "" && { addToGroupId: initialAddToGroupId }),
      }));
    }
  }, [keyword, initialKeywordTier, initialParentId, initialAddToGroupId]);

  const handleFormChange = (patch: Partial<KeywordFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
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
        currentRank: formData.currentRank ? parseInt(formData.currentRank) : null,
        estimatedPv: parseInt(formData.estimatedPv.toString()),
        keywordTier: formData.keywordTier,
        expectedRank: !isNaN(er) ? er : null,
        cvr: cvrNum != null && !isNaN(cvrNum) ? cvrNum : null,
        workflowFlag: formData.workflowFlag,
        clusterAxis: formData.clusterAxis,
        articleRole: formData.articleRole,
        targetReader: formData.targetReader || undefined,
        hubArticleSlug: formData.hubArticleSlug || null,
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

      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(isNew ? "キーワードを登録しました" : "キーワードを更新しました");
        onSave();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "保存に失敗しました");
      }
    } catch (error) {
      console.error("Failed to save keyword:", error);
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isNew ? "新規キーワード登録" : "キーワード編集"}
      size="3xl"
    >
      {/* フォーム */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <BasicFields formData={formData} isNew={isNew} onChange={handleFormChange} />
        <GroupSelector isNew={isNew} formData={formData} onChange={handleFormChange} />
        <V5Fields formData={formData} onChange={handleFormChange} />

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
    </Modal>
  );
}
