"use client";

import { useEffect, useState, useRef } from "react";
import {
  LuSearch,
  LuStar,
  LuTrendingUp,
  LuX,
  LuChevronDown,
} from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";

interface MasterKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  assignedArticles: string[];
  status: "active" | "paused" | "achieved";
  currentRank: number | null;
  createdAt: string;
  updatedAt: string;
}

interface KeywordSelectorProps {
  onSelect: (primary: string, secondary: string[]) => void;
  initialKeyword?: string;
}

interface KeywordDropdownProps {
  keywords: MasterKeyword[];
  selectedKeywords: string[];
  onSelect: (keyword: string) => void;
  placeholder: string;
  multiSelect?: boolean;
  businessLabels: Record<BusinessType, string>;
  showSearch?: boolean;
}

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: "翻訳",
  "web-design": "Web制作",
  print: "印刷",
  nobilva: "Nobilva",
  teachit: "Teachit",
};

// 共通のキーワードドロップダウンコンポーネント
function KeywordDropdown({
  keywords,
  selectedKeywords,
  onSelect,
  placeholder,
  multiSelect = false,
  businessLabels,
  showSearch = true,
}: KeywordDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 検索フィルター
  const filteredKeywords = keywords.filter((kw) => {
    if (
      searchQuery &&
      !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSelectKeyword = (keyword: string) => {
    onSelect(keyword);
    if (!multiSelect) {
      setShowDropdown(false);
      setSearchQuery("");
    }
  };

  const selectedKeyword = selectedKeywords[0]; // 単一選択の場合
  const selectedInfo = keywords.find((kw) => kw.keyword === selectedKeyword);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-primary transition-colors"
      >
        {!multiSelect && selectedKeyword ? (
          <span className="font-medium text-gray-900">{selectedKeyword}</span>
        ) : (
          <span
            className={
              multiSelect && selectedKeywords.length > 0
                ? "text-gray-900 font-medium"
                : "text-gray-400"
            }
          >
            {multiSelect && selectedKeywords.length > 0
              ? selectedKeywords.join(", ")
              : placeholder}
          </span>
        )}
        <LuChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            showDropdown ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {showDropdown && (
        <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {/* 検索ボックス */}
          {showSearch && (
            <div className="sticky top-0 bg-white p-3 border-b">
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="キーワードで検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 選択済みキーワード（multiSelectの場合のみ） */}
          {multiSelect && selectedKeywords.length > 0 && (
            <div className="p-3 bg-primary/5 border-b">
              <div className="text-xs font-medium text-gray-700 mb-2">
                選択済み ({selectedKeywords.length}個)
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((kw) => (
                  <div
                    key={kw}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg"
                  >
                    <span className="font-medium text-sm">{kw}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(kw);
                      }}
                      className="hover:bg-primary/20 rounded p-0.5"
                    >
                      <LuX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* キーワード一覧 */}
          <div className="divide-y divide-gray-100">
            {filteredKeywords.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                該当するキーワードがありません
              </div>
            ) : (
              filteredKeywords.map((kw) => {
                const isSelected = selectedKeywords.includes(kw.keyword);
                return (
                  <button
                    key={kw.keyword}
                    onClick={() => handleSelectKeyword(kw.keyword)}
                    className={`w-full p-3 text-left transition-colors ${
                      isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {multiSelect ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                      ) : (
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {kw.keyword}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(kw.priority)].map((_, i) => (
                              <LuStar
                                key={i}
                                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <LuTrendingUp className="w-3 h-3" />
                            {kw.estimatedPv.toLocaleString()} PV/月
                          </span>
                          {kw.assignedArticles.length === 0 ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              未使用
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {kw.assignedArticles.length}記事で使用中
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function KeywordSelector({
  onSelect,
  initialKeyword,
}: KeywordSelectorProps) {
  const [allKeywords, setAllKeywords] = useState<MasterKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<
    BusinessType | "all"
  >("all");
  const [primaryKeyword, setPrimaryKeyword] = useState<string>(
    initialKeyword || "",
  );
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (initialKeyword) {
      setPrimaryKeyword(initialKeyword);
    }
  }, [initialKeyword]);

  useEffect(() => {
    // 主要キーワードまたは関連キーワードが変更されたら親に通知
    onSelect(primaryKeyword, secondaryKeywords);
  }, [primaryKeyword, secondaryKeywords, onSelect]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch("/api/admin/keywords/master");
      if (response.ok) {
        const data = await response.json();
        setAllKeywords(data.keywords || []);
      }
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  // 主要キーワード候補のフィルタリング
  const filteredPrimaryKeywords = allKeywords.filter((kw) => {
    // 事業フィルター
    if (
      selectedBusiness !== "all" &&
      !kw.relatedBusiness.includes(selectedBusiness)
    ) {
      return false;
    }
    // 稼働中のみ
    if (kw.status !== "active") {
      return false;
    }
    return true;
  });

  // 関連キーワード候補（主要キーワードと関連性の高いもの）
  const suggestedSecondaryKeywords = allKeywords.filter((kw) => {
    if (!primaryKeyword || kw.keyword === primaryKeyword) {
      return false;
    }

    const primaryKw = allKeywords.find((k) => k.keyword === primaryKeyword);
    if (!primaryKw) {
      return false;
    }

    // 同じ事業またはタグを持つキーワードを提案
    const hasCommonBusiness = kw.relatedBusiness.some((b) =>
      primaryKw.relatedBusiness.includes(b),
    );
    const hasCommonTag = kw.relatedTags.some((t) =>
      primaryKw.relatedTags.includes(t),
    );

    return (hasCommonBusiness || hasCommonTag) && kw.status === "active";
  });

  const handlePrimarySelect = (keyword: string) => {
    setPrimaryKeyword(keyword);
    // 主要キーワード変更時は関連キーワードをクリア
    setSecondaryKeywords([]);
  };

  const handleSecondaryToggle = (keyword: string) => {
    setSecondaryKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword],
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 事業フィルタ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          事業を選択
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBusiness("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedBusiness === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            すべて
          </button>
          {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedBusiness(key as BusinessType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedBusiness === key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 主要キーワード選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          主要キーワード <span className="text-red-500">*</span>
        </label>
        <KeywordDropdown
          keywords={filteredPrimaryKeywords}
          selectedKeywords={primaryKeyword ? [primaryKeyword] : []}
          onSelect={handlePrimarySelect}
          placeholder="キーワードを選択してください"
          multiSelect={false}
          businessLabels={BUSINESS_LABELS}
          showSearch={true}
        />
      </div>

      {/* 関連キーワード選択 */}
      {primaryKeyword && suggestedSecondaryKeywords.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            関連キーワード（任意）
            {secondaryKeywords.length > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {secondaryKeywords.length}個選択中
              </span>
            )}
          </label>
          <KeywordDropdown
            keywords={suggestedSecondaryKeywords}
            selectedKeywords={secondaryKeywords}
            onSelect={handleSecondaryToggle}
            placeholder="おすすめの関連キーワードから選択"
            multiSelect={true}
            businessLabels={BUSINESS_LABELS}
            showSearch={false}
          />
        </div>
      )}
    </div>
  );
}
