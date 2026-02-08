"use client";

import { useEffect, useState, useRef } from "react";
import { LuSearch, LuX, LuChevronDown, LuPlus } from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";

interface Tag {
  tag: string;
  displayName: string;
  description: string;
  usageCount: number;
}

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagSelector({
  selectedTags,
  onChange,
  placeholder = "タグを選択または追加してください",
}: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowAddForm(false);
        setSearchQuery("");
        setNewTagName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/tags");
      if (response.ok) {
        const data = await response.json();
        setAllTags(data.tags || []);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  // 検索フィルター
  const filteredTags = allTags.filter((tag) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tag.tag.toLowerCase().includes(query) ||
      tag.displayName.toLowerCase().includes(query) ||
      tag.description.toLowerCase().includes(query)
    );
  });

  // 選択されていないタグのみ表示
  const availableTags = filteredTags.filter(
    (tag) => !selectedTags.includes(tag.tag),
  );

  const handleSelectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setSearchQuery("");
  };

  const handleRemoveTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    const trimmedTag = newTagName.trim();

    // 既に選択されている場合はスキップ
    if (selectedTags.includes(trimmedTag)) {
      setNewTagName("");
      setShowAddForm(false);
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: trimmedTag,
          displayName: trimmedTag,
          description: "",
        }),
      });

      if (response.ok) {
        // タグ一覧を再取得
        await fetchTags();
        // 新しいタグを選択
        onChange([...selectedTags, trimmedTag]);
        setNewTagName("");
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(error.message || "タグの追加に失敗しました");
      }
    } catch (error) {
      console.error("Failed to add tag:", error);
      alert("タグの追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 選択済みタグの表示 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => {
            const tagInfo = allTags.find((t) => t.tag === tag);
            return (
              <Chip
                key={tag}
                variant="selected"
                size="md"
                className="flex items-center gap-1.5 pr-1"
              >
                <span>{tagInfo?.displayName || tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-primary/20 rounded p-0.5 -mr-0.5 ml-0.5"
                  type="button"
                >
                  <LuX className="w-3 h-3" />
                </button>
              </Chip>
            );
          })}
        </div>
      )}

      {/* ドロップダウン */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-primary transition-colors"
          type="button"
        >
          <span
            className={
              selectedTags.length > 0
                ? "text-gray-900 font-medium"
                : "text-gray-400"
            }
          >
            {selectedTags.length > 0
              ? `${selectedTags.length}個のタグが選択されています`
              : placeholder}
          </span>
          <LuChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showDropdown ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {showDropdown && (
          <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {/* 検索ボックス */}
            <div className="sticky top-0 bg-white p-3 border-b">
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="タグで検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onFocus={() => setShowDropdown(true)}
                />
              </div>
            </div>

            {/* 新規追加フォーム */}
            {showAddForm ? (
              <div className="p-3 border-b bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewTag();
                      } else if (e.key === "Escape") {
                        setShowAddForm(false);
                        setNewTagName("");
                      }
                    }}
                    placeholder="新しいタグ名を入力"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleAddNewTag}
                    disabled={isAdding || !newTagName.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {isAdding ? "追加中..." : "追加"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTagName("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    type="button"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 border-b">
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setSearchQuery("");
                  }}
                  className="w-full px-3 py-2 text-left text-primary hover:bg-primary/5 rounded-lg flex items-center gap-2"
                  type="button"
                >
                  <LuPlus className="w-4 h-4" />
                  <span className="font-medium">新しいタグを追加</span>
                </button>
              </div>
            )}

            {/* タグ一覧 */}
            <div className="divide-y divide-gray-100">
              {availableTags.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery
                    ? "該当するタグがありません"
                    : "すべてのタグが選択されています"}
                </div>
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => handleSelectTag(tag.tag)}
                    className="w-full p-3 text-left transition-colors hover:bg-gray-50"
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {tag.displayName}
                        </div>
                        {tag.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {tag.description}
                          </div>
                        )}
                        {tag.usageCount > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {tag.usageCount}件の記事で使用中
                          </div>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.tag)}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary rounded focus:ring-primary ml-3"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
