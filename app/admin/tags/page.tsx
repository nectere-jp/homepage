"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuPlus,
  LuSearch,
  LuTrash2,
  LuPencil,
  LuFileText,
} from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";

interface Tag {
  tag: string;
  displayName: string;
  description: string;
  usageCount: number;
  usedInArticles: string[];
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    tag: "",
    displayName: "",
    description: "",
  });

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tags, searchQuery]);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/tags");
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

  const applyFilters = () => {
    let filtered = [...tags];

    // 検索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tag) =>
          tag.tag.toLowerCase().includes(query) ||
          tag.displayName.toLowerCase().includes(query) ||
          tag.description.toLowerCase().includes(query),
      );
    }

    setFilteredTags(filtered);
  };

  const handleDelete = async (tag: string) => {
    if (!confirm(`「${tag}」を削除しますか？`)) return;

    try {
      const response = await fetch(
        `/api/admin/tags/${encodeURIComponent(tag)}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        alert("タグを削除しました");
        fetchTags();
      } else {
        const error = await response.json();
        alert(error.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
      alert("削除に失敗しました");
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      tag: tag.tag,
      displayName: tag.displayName,
      description: tag.description,
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setEditingTag(null);
    setFormData({
      tag: "",
      displayName: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.tag.trim()) {
      alert("タグ名を入力してください");
      return;
    }

    try {
      const url = editingTag
        ? `/api/admin/tags/${encodeURIComponent(editingTag.tag)}`
        : "/api/admin/tags";
      const method = editingTag ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: formData.tag.trim(),
          displayName: formData.displayName.trim() || formData.tag.trim(),
          description: formData.description.trim(),
        }),
      });

      if (response.ok) {
        alert(editingTag ? "タグを更新しました" : "タグを作成しました");
        setShowEditModal(false);
        setShowAddModal(false);
        fetchTags();
      } else {
        const error = await response.json();
        alert(error.message || "保存に失敗しました");
      }
    } catch (error) {
      console.error("Failed to save tag:", error);
      alert("保存に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">タグ管理</h1>
        <p className="text-gray-600">
          記事で使用するタグを管理します。タグの作成、編集、削除ができます。
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft-lg p-6">
          <div className="text-sm text-gray-600 mb-1">総タグ数</div>
          <p className="text-3xl font-bold text-gray-900">{tags.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft-lg p-6">
          <div className="text-sm text-gray-600 mb-1">使用中タグ</div>
          <p className="text-3xl font-bold text-gray-900">
            {tags.filter((t) => t.usageCount > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-soft-lg p-6">
          <div className="text-sm text-gray-600 mb-1">未使用タグ</div>
          <p className="text-3xl font-bold text-gray-900">
            {tags.filter((t) => t.usageCount === 0).length}
          </p>
        </div>
      </div>

      {/* 検索と追加 */}
      <div className="bg-white rounded-xl shadow-soft-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タグで検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <LuPlus className="w-5 h-5" />
            新しいタグを追加
          </button>
        </div>
      </div>

      {/* タグ一覧 */}
      <div className="bg-white rounded-xl shadow-soft-lg overflow-hidden">
        {filteredTags.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchQuery ? "該当するタグがありません" : "タグがありません"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTags.map((tag) => (
              <div
                key={tag.tag}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {tag.displayName}
                      </h3>
                      {tag.tag !== tag.displayName && (
                        <span className="text-sm text-gray-500">
                          ({tag.tag})
                        </span>
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
                      <p className="text-gray-600 mb-2">{tag.description}</p>
                    )}
                    {tag.usedInArticles.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <LuFileText className="w-4 h-4" />
                        <span>
                          使用記事: {tag.usedInArticles.slice(0, 5).join(", ")}
                          {tag.usedInArticles.length > 5 &&
                            ` 他${tag.usedInArticles.length - 5}件`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(tag)}
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {showEditModal && editingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">タグを編集</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ名（変更不可）
                </label>
                <input
                  type="text"
                  value={formData.tag}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                新しいタグを追加
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value })
                  }
                  placeholder="例: 野球"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="表示名を入力（未入力の場合はタグ名が使用されます）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="タグの説明を入力"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
