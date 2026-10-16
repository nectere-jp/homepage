"use client";

import { useEffect, useMemo, useState } from "react";
import { LuPlus, LuSearch, LuTrash2, LuPencil } from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatCard } from "@/components/admin/StatCard";
import { TagFormModal, type TagFormData } from "@/components/admin/TagFormModal";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { toast } from "@/lib/toast";

interface Tag {
  tag: string;
  displayName: string;
  description: string;
  usageCount: number;
  usedInArticles: string[];
}

type ModalState = { mode: "add" } | { mode: "edit"; tag: Tag } | null;

const EMPTY_DATA: TagFormData = { tag: "", displayName: "", description: "" };

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const confirm = useConfirm();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await adminFetch("/api/admin/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter(
      (t) =>
        t.tag.toLowerCase().includes(query) ||
        t.displayName.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query),
    );
  }, [tags, searchQuery]);

  const handleDelete = async (tag: string) => {
    const ok = await confirm({
      title: `「${tag}」を削除しますか？`,
      description: "この操作は取り消せません。",
      confirmLabel: "削除",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const response = await adminFetch(
        `/api/admin/tags/${encodeURIComponent(tag)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        toast.success("タグを削除しました");
        fetchTags();
      } else {
        const error = await response.json();
        toast.error(error.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
      toast.error("削除に失敗しました");
    }
  };

  const handleSave = async (data: TagFormData) => {
    if (!data.tag.trim()) {
      toast.error("タグ名を入力してください");
      return;
    }
    const isEdit = modal?.mode === "edit";

    try {
      const url = isEdit
        ? `/api/admin/tags/${encodeURIComponent((modal as { mode: "edit"; tag: Tag }).tag.tag)}`
        : "/api/admin/tags";
      const method = isEdit ? "PUT" : "POST";
      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: data.tag.trim(),
          displayName: data.displayName.trim() || data.tag.trim(),
          description: data.description.trim(),
        }),
      });
      if (response.ok) {
        toast.success(isEdit ? "タグを更新しました" : "タグを作成しました");
        setModal(null);
        fetchTags();
      } else {
        const error = await response.json();
        toast.error(error.message || "保存に失敗しました");
      }
    } catch (error) {
      console.error("Failed to save tag:", error);
      toast.error("保存に失敗しました");
    }
  };

  if (loading) return <LoadingSpinner size="md" label="" />;

  const modalInitial: TagFormData =
    modal?.mode === "edit"
      ? {
          tag: modal.tag.tag,
          displayName: modal.tag.displayName,
          description: modal.tag.description,
        }
      : EMPTY_DATA;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">タグ管理</h1>
        <p className="mt-2 text-gray-600">
          記事で使用するタグを管理します。タグの作成、編集、削除ができます。
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="総タグ数" value={tags.length} />
        <StatCard
          label="使用中タグ"
          value={tags.filter((t) => t.usageCount > 0).length}
        />
        <StatCard
          label="未使用タグ"
          value={tags.filter((t) => t.usageCount === 0).length}
        />
      </div>

      {/* 検索と追加 */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タグで検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <AdminButton onClick={() => setModal({ mode: "add" })} size="md">
            <LuPlus className="w-5 h-5" />
            新しいタグを追加
          </AdminButton>
        </div>
      </div>

      {/* タグ一覧 */}
      <div className="bg-white rounded-2xl shadow-soft-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">タグ一覧</h2>
          <p className="text-sm text-gray-600 mt-1">
            全 {filteredTags.length} タグ
          </p>
        </div>
        {filteredTags.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {searchQuery ? "該当するタグがありません" : "タグがありません"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTags.map((tag) => (
              <div
                key={tag.tag}
                className="py-3 px-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">
                      {tag.displayName}
                    </span>
                    {tag.tag !== tag.displayName && (
                      <span className="text-xs text-gray-500">({tag.tag})</span>
                    )}
                    {tag.usageCount > 0 ? (
                      <Chip variant="tag" size="sm">
                        {tag.usageCount}件で使用中
                      </Chip>
                    ) : (
                      <Chip variant="success" size="sm">
                        未使用
                      </Chip>
                    )}
                  </div>
                  {tag.description && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {tag.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setModal({ mode: "edit", tag })}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    title="編集"
                  >
                    <LuPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.tag)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <LuTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TagFormModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        mode={modal?.mode === "edit" ? "edit" : "add"}
        initial={modalInitial}
        onSave={handleSave}
      />
    </div>
  );
}
