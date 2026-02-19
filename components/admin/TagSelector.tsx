"use client";

import { useEffect, useState, useRef } from "react";
import { LuSearch, LuX, LuPlus } from "react-icons/lu";
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
    <div className="space-y-2">
      {/* 選択済みタグ + タグを選ぶボタン（1行でコンパクトに） */}
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedTags.map((tag) => {
          const tagInfo = allTags.find((t) => t.tag === tag);
          return (
            <Chip
              key={tag}
              variant="selected"
              size="sm"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-sm">{tagInfo?.displayName || tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-primary/20 rounded p-0.5 -mr-0.5 ml-0.5"
                type="button"
              >
                <LuX className="w-2.5 h-2.5" />
              </button>
            </Chip>
          );
        })}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3 py-1.5 text-sm text-primary border border-primary/50 rounded-lg hover:bg-primary/5 transition-colors inline-flex items-center gap-1.5"
            type="button"
          >
            タグを選ぶ
            {selectedTags.length > 0 && (
              <span className="text-primary/80">({selectedTags.length})</span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute z-10 mt-1.5 left-0 min-w-[280px] max-w-md bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {/* 検索ボックス */}
              <div className="sticky top-0 bg-white p-2 border-b">
                <div className="relative">
                  <LuSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="タグで検索..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>
              </div>

              {/* 新規追加フォーム */}
              {showAddForm ? (
                <div className="p-2 border-b bg-gray-50">
                  <div className="flex gap-1.5 flex-wrap">
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
                      placeholder="新しいタグ名"
                      className="flex-1 min-w-[120px] px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleAddNewTag}
                      disabled={isAdding || !newTagName.trim()}
                      className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      {isAdding ? "追加中..." : "追加"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTagName("");
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      type="button"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-1.5 border-b">
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      // 検索ボックスの入力内容を新規タグ名に引き継ぐ
                      setNewTagName(searchQuery.trim());
                      setSearchQuery("");
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-sm text-primary hover:bg-primary/5 rounded-md flex items-center gap-1.5"
                    type="button"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>新しいタグを追加</span>
                  </button>
                </div>
              )}

              {/* タグ一覧 */}
              <div className="divide-y divide-gray-100">
                {availableTags.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    {searchQuery
                      ? "該当するタグがありません"
                      : "すべてのタグが選択されています"}
                  </div>
                ) : (
                  availableTags.map((tag) => (
                    <button
                      key={tag.tag}
                      onClick={() => handleSelectTag(tag.tag)}
                      className="w-full px-2.5 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {tag.displayName}
                          </div>
                          {tag.usageCount > 0 && (
                            <div className="text-xs text-gray-400">
                              {tag.usageCount}件使用中
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
