"use client";

import type { Team } from "@/lib/teams";
import type { AnalyticsMap } from "./TeamList";

interface TeamAnalyticsProps {
  teams: Team[];
  analytics: AnalyticsMap;
  detailSlug: string | null;
  setDetailSlug: (slug: string | null) => void;
}

export const TeamAnalytics = ({
  teams,
  analytics,
  detailSlug,
  setDetailSlug,
}: TeamAnalyticsProps) => {
  if (detailSlug) {
    const team = teams.find((t) => t.slug === detailSlug);
    const stats = analytics[detailSlug];
    if (!team) return null;

    // Sort daily data by date descending
    const dailyEntries = stats?.daily
      ? Object.entries(stats.daily).sort(([a], [b]) => b.localeCompare(a))
      : [];

    return (
      <div>
        <button
          onClick={() => setDetailSlug(null)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          &larr; 一覧に戻る
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {team.teamName} のアナリティクス
        </h2>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {stats?.pageViews ?? 0}
            </p>
            <p className="text-sm text-gray-500">ページ閲覧数</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-nobilva-accent">
              {stats?.consultClicks ?? 0}
            </p>
            <p className="text-sm text-gray-500">面談クリック数</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-[#06C755]">
              {stats?.lineClicks ?? 0}
            </p>
            <p className="text-sm text-gray-500">LINE クリック数</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats?.signups ?? 0}
            </p>
            <p className="text-sm text-gray-500">申込数</p>
          </div>
        </div>

        {/* Conversion rate */}
        {(stats?.pageViews ?? 0) > 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              コンバージョン率
            </h3>
            <div className="flex gap-8 flex-wrap">
              <div>
                <p className="text-2xl font-bold text-nobilva-accent">
                  {(
                    ((stats?.consultClicks ?? 0) / stats!.pageViews) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">閲覧 → 面談</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#06C755]">
                  {(
                    ((stats?.lineClicks ?? 0) / stats!.pageViews) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">閲覧 → LINE</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {(
                    ((stats?.signups ?? 0) / stats!.pageViews) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">閲覧 → 申込</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily breakdown */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">日別推移</h3>
          {dailyEntries.length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500">日付</th>
                  <th className="text-right py-2 text-gray-500">閲覧</th>
                  <th className="text-right py-2 text-gray-500">面談</th>
                  <th className="text-right py-2 text-gray-500">LINE</th>
                  <th className="text-right py-2 text-gray-500">申込</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map(([date, d]) => (
                  <tr key={date} className="border-b border-gray-50">
                    <td className="py-2 text-gray-700">{date}</td>
                    <td className="py-2 text-right text-gray-900">
                      {d.pageViews}
                    </td>
                    <td className="py-2 text-right text-nobilva-accent font-medium">
                      {d.consultClicks ?? 0}
                    </td>
                    <td className="py-2 text-right text-[#06C755] font-medium">
                      {d.lineClicks ?? 0}
                    </td>
                    <td className="py-2 text-right text-green-600 font-medium">
                      {d.signups}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Overview table
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        チーム名をクリックで詳細を表示します。
      </p>
      {teams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          チームがありません
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-500">
                  チーム名
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  閲覧
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  面談
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  LINE
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  申込
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  CVR
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const stats = analytics[team.slug];
                const pv = stats?.pageViews ?? 0;
                const cvr = pv > 0 ? ((stats?.signups ?? 0) / pv) * 100 : 0;
                return (
                  <tr
                    key={team.slug}
                    onClick={() => setDetailSlug(team.slug)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        {team.teamName}
                      </span>
                      {!team.active && (
                        <span className="ml-2 text-xs text-red-500">
                          (無効)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-gray-700">{pv}</td>
                    <td className="p-4 text-right text-nobilva-accent font-medium">
                      {stats?.consultClicks ?? 0}
                    </td>
                    <td className="p-4 text-right text-[#06C755] font-medium">
                      {stats?.lineClicks ?? 0}
                    </td>
                    <td className="p-4 text-right text-green-600 font-medium">
                      {stats?.signups ?? 0}
                    </td>
                    <td className="p-4 text-right text-gray-700">
                      {cvr.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
