"use client";

import { LuFilter, LuSearch } from "react-icons/lu";
import type { KeywordTier, WorkflowFlag } from "./types";
import { KEYWORD_TIER_LABELS, WORKFLOW_FLAG_LABELS } from "./constants";

export type SortByOption =
  | "priority"
  | "pv"
  | "name"
  | "businessImpact";

interface KeywordsFilterSectionProps {
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  filterPriority: number | "";
  onFilterPriorityChange: (v: number | "") => void;
  filterKeywordTier: KeywordTier | "";
  onFilterKeywordTierChange: (v: KeywordTier | "") => void;
  filterWorkflowFlag: WorkflowFlag | "";
  onFilterWorkflowFlagChange: (v: WorkflowFlag | "") => void;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  filterUsage: "all" | "used" | "unused";
  onFilterUsageChange: (v: "all" | "used" | "unused") => void;
  sortBy: SortByOption;
  onSortByChange: (v: SortByOption) => void;
}

export function KeywordsFilterSection({
  searchQuery,
  onSearchQueryChange,
  filterPriority,
  onFilterPriorityChange,
  filterKeywordTier,
  onFilterKeywordTierChange,
  filterWorkflowFlag,
  onFilterWorkflowFlagChange,
  filterStatus,
  onFilterStatusChange,
  filterUsage,
  onFilterUsageChange,
  sortBy,
  onSortByChange,
}: KeywordsFilterSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <LuFilter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-bold text-gray-900">フィルター・検索</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <LuSearch className="w-4 h-4 inline mr-1" />
            キーワード検索
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            重要度
          </label>
          <select
            value={filterPriority}
            onChange={(e) =>
              onFilterPriorityChange(
                e.target.value ? parseInt(e.target.value) : "",
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">すべて</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            階層
          </label>
          <select
            value={filterKeywordTier}
            onChange={(e) =>
              onFilterKeywordTierChange(e.target.value as KeywordTier | "")
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">すべて</option>
            {(Object.entries(KEYWORD_TIER_LABELS) as [KeywordTier, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            フラグ
          </label>
          <select
            value={filterWorkflowFlag}
            onChange={(e) =>
              onFilterWorkflowFlagChange(e.target.value as WorkflowFlag | "")
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">すべて</option>
            {(Object.entries(WORKFLOW_FLAG_LABELS) as [WorkflowFlag, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ステータス
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">すべて</option>
            <option value="active">稼働中</option>
            <option value="paused">一時停止</option>
            <option value="achieved">達成</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            使用状況
          </label>
          <select
            value={filterUsage}
            onChange={(e) =>
              onFilterUsageChange(e.target.value as "all" | "used" | "unused")
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="unused">未使用のみ</option>
            <option value="used">使用済みのみ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            並び替え
          </label>
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as SortByOption,
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="priority">優先度順</option>
            <option value="pv">想定PV順</option>
            <option value="businessImpact">事業インパクト順</option>
            <option value="name">名前順</option>
          </select>
        </div>
      </div>
    </div>
  );
}
