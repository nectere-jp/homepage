"use client";

import { LuTriangleAlert } from "react-icons/lu";
import type { ConflictKeywordData } from "./types";

interface ConflictsSectionProps {
  conflicts: ConflictKeywordData[];
}

export function ConflictsSection({ conflicts }: ConflictsSectionProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-soft-lg mb-8">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <LuTriangleAlert className="w-6 h-6 text-gray-400" />
          競合しているキーワード
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          複数の記事で使用されているキーワード
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {conflicts.map(({ keyword, data }) => (
          <div
            key={keyword}
            className="p-6 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{keyword}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {data.frequency} 回使用 • 最終:{" "}
                  {new Date(data.lastUsed).toLocaleDateString("ja-JP")}
                </p>
                <div className="mt-2">
                  <p className="text-sm text-gray-700 font-medium">使用記事:</p>
                  <ul className="mt-1 space-y-1">
                    {data.articles.map((slug) => (
                      <li key={slug} className="text-sm text-gray-600">
                        • {slug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.frequency >= 3
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {data.frequency >= 3 ? "高" : "中"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
