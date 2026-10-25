"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import type { Team } from "@/lib/teams";
import type { TeamStats } from "@/app/api/admin/teams/analytics/route";
import { TeamForm } from "@/components/admin/teams/TeamForm";
import { TeamSessions } from "@/components/admin/teams/TeamSessions";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { LuArrowLeft, LuChartBar, LuPencil } from "react-icons/lu";

type Tab = "overview" | "edit";

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [teamsRes, analyticsRes] = await Promise.all([
      adminFetch("/api/admin/teams"),
      adminFetch("/api/admin/teams/analytics"),
    ]);
    if (teamsRes.ok) {
      const data = await teamsRes.json();
      const found = (data.teams as Team[]).find((t) => t.slug === slug) ?? null;
      setTeam(found);
    }
    if (analyticsRes.ok) {
      const data = await analyticsRes.json();
      const found = (data.analytics as TeamStats[]).find((s) => s.slug === slug) ?? null;
      setStats(found);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyURL = () => {
    const url = `${window.location.origin}/ja/services/nobilva/teams/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActive = async () => {
    if (!team) return;
    await adminFetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: team.slug, updates: { active: !team.active } }),
    });
    fetchData();
  };

  if (loading) return <LoadingSpinner label="読み込み中..." />;

  if (!team) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/teams"
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
        >
          <LuArrowLeft className="w-4 h-4" /> チーム一覧へ
        </Link>
        <p className="text-gray-500">slug「{slug}」のチームが見つかりませんでした。</p>
      </div>
    );
  }

  const dailyEntries = stats?.daily
    ? Object.entries(stats.daily).sort(([a], [b]) => b.localeCompare(a))
    : [];

  return (
    <div className="space-y-6">
      {/* 戻る */}
      <Link
        href="/admin/teams"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        <LuArrowLeft className="w-4 h-4" /> チーム一覧へ
      </Link>

      {/* ヘッダー */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{team.teamName}</h1>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {team.category}
              </span>
              {team.offerVariant === "A" && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                  🎁 モニター (A)
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
              /{team.slug} ・ 特別価格 {team.specialPrice.toLocaleString()}円
              （通常 {team.normalPrice.toLocaleString()}円）
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSessionsOpen(true)}
              className="px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              セッションを見る
            </button>
            <button
              onClick={copyURL}
              className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? "コピー済み!" : "URL コピー"}
            </button>
            <button
              onClick={toggleActive}
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

      {/* タブ */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("overview")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
            tab === "overview"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <LuChartBar className="w-4 h-4" />
          概要
        </button>
        <button
          onClick={() => setTab("edit")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
            tab === "edit"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <LuPencil className="w-4 h-4" />
          編集
        </button>
      </div>

      {tab === "overview" ? (
        <OverviewPanel team={team} stats={stats} dailyEntries={dailyEntries} />
      ) : (
        <TeamForm
          team={team}
          onDone={() => {
            fetchData();
            setTab("overview");
          }}
        />
      )}

      {sessionsOpen && (
        <TeamSessions
          teamSlug={team.slug}
          teamName={team.teamName}
          campaigns={team.campaigns ?? []}
          onClose={() => setSessionsOpen(false)}
        />
      )}
    </div>
  );
}

const OverviewPanel = ({
  team,
  stats,
  dailyEntries,
}: {
  team: Team;
  stats: TeamStats | null;
  dailyEntries: [string, TeamStats["daily"][string]][];
}) => (
  <div className="space-y-6">
    {/* 統計サマリー */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatBig label="閲覧" value={stats?.pageViews ?? 0} tone="gray" />
      <StatBig label="面談クリック" value={stats?.consultClicks ?? 0} tone="accent" />
      <StatBig label="LINE クリック" value={stats?.lineClicks ?? 0} tone="line" />
      <StatBig label="申込" value={stats?.signups ?? 0} tone="green" />
    </div>

    {/* 日次 */}
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">日次推移</h3>
      {dailyEntries.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">まだデータがありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">日付</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">閲覧</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">面談</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">LINE</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">申込</th>
              </tr>
            </thead>
            <tbody>
              {dailyEntries.map(([date, d]) => (
                <tr key={date} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-gray-900 font-mono">{date}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                    {d.pageViews}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-nobilva-accent font-medium">
                    {d.consultClicks ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-[#06C755] font-medium">
                    {d.lineClicks ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-green-600 font-medium">
                    {d.signups}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* note */}
    {team.note && (
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-2">メモ</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{team.note}</p>
      </div>
    )}
  </div>
);

const StatBig = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gray" | "accent" | "line" | "green";
}) => {
  const toneClass =
    tone === "accent"
      ? "text-nobilva-accent"
      : tone === "line"
        ? "text-[#06C755]"
        : tone === "green"
          ? "text-green-600"
          : "text-gray-900";
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
      <p className={`text-3xl font-bold ${toneClass}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
};
