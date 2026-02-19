"use client";

import { useEffect, useState } from "react";
import { LuTarget, LuStar, LuTrendingUp } from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";
import type { BusinessType } from "@/lib/blog";

/** API: suggestUnusedKeywordsByBusiness の返却形（groupId 単位） */
interface UnusedKeywordSuggestion {
  groupId: string;
  group: {
    priority: number;
    relatedBusiness: BusinessType[];
    relatedTags: string[];
    variants: Array<{ keyword: string; estimatedPv?: number }>;
  };
  representativeKeyword: string;
}

interface UnusedKeyword {
  groupId: string;
  representativeKeyword: string;
  data: {
    priority: number;
    estimatedPv: number;
    relatedBusiness: BusinessType[];
    relatedTags: string[];
  };
}

interface UnusedKeywordsSuggestionProps {
  selectedBusiness: BusinessType[];
  /** グループID とタグを渡す（記事はグループ1つに紐づける） */
  onSelectKeyword: (groupId: string, tags: string[]) => void;
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
      const allSuggestions: UnusedKeyword[] = [];

      for (const business of selectedBusiness) {
        const response = await fetch(
          `/api/admin/keywords/suggestions?business=${business}&limit=3`,
        );
        if (response.ok) {
          const data = await response.json();
          const raw = (data.suggestions ?? []) as UnusedKeywordSuggestion[];
          for (const s of raw) {
            allSuggestions.push({
              groupId: s.groupId,
              representativeKeyword: s.representativeKeyword,
              data: {
                priority: s.group.priority ?? 3,
                estimatedPv: s.group.variants?.[0]?.estimatedPv ?? 0,
                relatedBusiness: s.group.relatedBusiness ?? [],
                relatedTags: s.group.relatedTags ?? [],
              },
            });
          }
        }
      }

      const uniqueSuggestions = allSuggestions.filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.groupId === suggestion.groupId),
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
        {suggestions.map(({ groupId, representativeKeyword, data }) => (
          <button
            key={groupId}
            onClick={() => onSelectKeyword(groupId, data.relatedTags)}
            className="w-full bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-blue-400 text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 group-hover:text-blue-600">
                    {representativeKeyword}
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
                      <Chip key={tag} variant="tag" size="sm">
                        {tag}
                      </Chip>
                    ))}
                    {data.relatedTags.length > 3 && (
                      <Chip variant="tag" size="sm">
                        +{data.relatedTags.length - 3}
                      </Chip>
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
