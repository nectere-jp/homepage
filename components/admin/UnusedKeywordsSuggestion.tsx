"use client";

import { useEffect, useState } from "react";
import { LuTarget, LuStar, LuTrendingUp } from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";

interface UnusedKeyword {
  keyword: string;
  data: {
    priority: number;
    estimatedPv: number;
    relatedBusiness: BusinessType[];
    relatedTags: string[];
  };
}

interface UnusedKeywordsSuggestionProps {
  selectedBusiness: BusinessType[];
  onSelectKeyword: (keyword: string, tags: string[]) => void;
}

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: "翻訳",
  "web-design": "Web制作",
  print: "印刷",
  nobilva: "Nobilva",
  teachit: "Teachit",
};

export function UnusedKeywordsSuggestion({
  selectedBusiness,
  onSelectKeyword,
}: UnusedKeywordsSuggestionProps) {
  const [suggestions, setSuggestions] = useState<UnusedKeyword[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBusiness.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [selectedBusiness]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // 各事業のキーワードを取得して統合
      const allSuggestions: UnusedKeyword[] = [];

      for (const business of selectedBusiness) {
        const response = await fetch(
          `/api/admin/keywords/suggestions?business=${business}&limit=3`
        );
        if (response.ok) {
          const data = await response.json();
          allSuggestions.push(...data.suggestions);
        }
      }

      // 重複を除去してソート
      const uniqueSuggestions = allSuggestions.filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.keyword === suggestion.keyword)
      );

      uniqueSuggestions.sort((a, b) => {
        if (b.data.priority !== a.data.priority) {
          return b.data.priority - a.data.priority;
        }
        return b.data.estimatedPv - a.data.estimatedPv;
      });

      setSuggestions(uniqueSuggestions.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedBusiness.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 text-blue-600 mb-3">
          <LuTarget className="w-5 h-5 animate-pulse" />
          <h3 className="font-bold text-lg">キーワード提案を読み込み中...</h3>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <LuTarget className="w-5 h-5" />
          <h3 className="font-bold text-lg">未使用キーワード提案</h3>
        </div>
        <p className="text-sm text-gray-600">
          選択した事業に関連する未使用キーワードはありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
      <div className="flex items-center gap-2 text-blue-600 mb-3">
        <LuTarget className="w-5 h-5" />
        <h3 className="font-bold text-lg">おすすめの未使用キーワード</h3>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        選択した事業に関連する、まだ記事が作成されていない重要キーワードです。
      </p>
      <div className="space-y-3">
        {suggestions.map(({ keyword, data }) => (
          <button
            key={keyword}
            onClick={() => onSelectKeyword(keyword, data.relatedTags)}
            className="w-full bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-blue-400 text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 group-hover:text-blue-600">
                    {keyword}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(data.priority)].map((_, i) => (
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
                    {data.estimatedPv.toLocaleString()} PV/月
                  </span>
                  <span>
                    {data.relatedBusiness
                      .map((b) => BUSINESS_LABELS[b])
                      .join(", ")}
                  </span>
                </div>
                {data.relatedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {data.relatedTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {data.relatedTags.length > 3 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        +{data.relatedTags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className="ml-2 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                選択 →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
