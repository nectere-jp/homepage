"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import type { Team } from "@/lib/teams";
import type { TeamStats } from "@/app/api/admin/teams/analytics/route";

export interface AnalyticsMap {
  [slug: string]: TeamStats;
}

interface TeamListProps {
  teams: Team[];
  analytics: AnalyticsMap;
  onRefresh: () => void;
}

export const TeamList = ({ teams, analytics, onRefresh }: TeamListProps) => {
  const router = useRouter();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const copyURL = (slug: string) => {
    const url = `${window.location.origin}/ja/services/nobilva/teams/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const toggleActive = async (team: Team) => {
    await adminFetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: team.slug,
        updates: { active: !team.active },
      }),
    });
    onRefresh();
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        まだチームページがありません。「新規作成」タブから作成してください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const stats = analytics[team.slug];
        return (
          <div
            key={team.slug}
            onClick={() => router.push(`/admin/teams/${team.slug}`)}
            className={`bg-white rounded-2xl shadow-soft p-6 border cursor-pointer hover:shadow-md transition-shadow ${
              team.active ? "border-transparent" : "border-gray-300 opacity-60"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {team.teamName}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {team.category}
                  </span>
                  {team.offerVariant === "A" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      🎁 モニター (A)
                    </span>
                  )}
                  {team.offerVariant === "A2" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      🎁 モニター (A')
                    </span>
                  )}
                  {team.offerVariant === "B" && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      🛡️ オール3保証 (B)
                    </span>
                  )}
                  {(!team.offerVariant || team.offerVariant === "C") && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      オファーなし (C)
                    </span>
                  )}
                  {!team.active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      無効
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  /{team.slug} | 特別価格: {team.specialPrice.toLocaleString()}円
                  (通常 {team.normalPrice.toLocaleString()}円)
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.pageViews ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">閲覧</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-nobilva-accent">
                    {stats?.consultClicks ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">面談</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#06C755]">
                    {stats?.lineClicks ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">LINE</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.signups ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">申込</p>
                </div>
              </div>

              {/* クイックアクション (カード遷移と干渉しないよう stopPropagation) */}
              <div
                className="flex gap-2 flex-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => copyURL(team.slug)}
                  className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedSlug === team.slug ? "コピー済み!" : "URL コピー"}
                </button>
                <button
                  onClick={() => toggleActive(team)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    team.active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {team.active ? "無効化" : "有効化"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
