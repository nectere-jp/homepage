"use client";

import {
  LuFileText,
  LuKey,
  LuTriangleAlert,
  LuTrendingUp,
} from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";
import type { BusinessCoverage } from "./types";
import { BUSINESS_LABELS } from "./constants";

interface KeywordsStatsSectionProps {
  analysis: {
    totalArticles: number;
    uniqueKeywords: number;
  } | null;
  conflictsCount: number;
  businessCoverage: BusinessCoverage[];
  selectedBusiness: BusinessType | "all";
  onBusinessChange: (business: BusinessType | "all") => void;
}

export function KeywordsStatsSection({
  analysis,
  conflictsCount,
  businessCoverage,
  selectedBusiness,
  onBusinessChange,
}: KeywordsStatsSectionProps) {
  if (!analysis) return null;

  const currentCoverage =
    selectedBusiness === "all"
      ? businessCoverage.reduce(
          (acc, bc) => ({
            total: acc.total + bc.total,
            used: acc.used + bc.used,
          }),
          { total: 0, used: 0 },
        )
      : businessCoverage.find((bc) => bc.business === selectedBusiness) || {
          total: 0,
          used: 0,
          percentage: 0,
        };

  const percentage =
    selectedBusiness === "all"
      ? currentCoverage.total > 0
        ? Math.round((currentCoverage.used / currentCoverage.total) * 100)
        : 0
      : (currentCoverage as BusinessCoverage).percentage ?? 0;

  return (
    <>
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-soft-lg p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => onBusinessChange("all")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              selectedBusiness === "all"
                ? "bg-primary text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            すべて
          </button>
          {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onBusinessChange(key as BusinessType)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                selectedBusiness === key
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総記事数</p>
              <p className="text-3xl font-bold text-gray-900">
                {analysis.totalArticles}
              </p>
            </div>
            <LuFileText className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ユニークキーワード</p>
              <p className="text-3xl font-bold text-gray-900">
                {analysis.uniqueKeywords}
              </p>
            </div>
            <LuKey className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">競合キーワード</p>
              <p className="text-3xl font-bold text-gray-900">
                {conflictsCount}
              </p>
            </div>
            <LuTriangleAlert className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {selectedBusiness === "all"
                  ? "全体の"
                  : `${BUSINESS_LABELS[selectedBusiness as BusinessType]}の`}
                目標達成
              </p>
              <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
            </div>
            <LuTrendingUp className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>
    </>
  );
}
