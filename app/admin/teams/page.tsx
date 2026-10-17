"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { Team } from "@/lib/teams";
import type { TeamStats } from "@/app/api/admin/teams/analytics/route";
import { TeamList, type AnalyticsMap } from "@/components/admin/teams/TeamList";
import { TeamForm } from "@/components/admin/teams/TeamForm";
import { TeamAnalytics } from "@/components/admin/teams/TeamAnalytics";

type Tab = "list" | "create" | "analytics";

const TAB_LABELS: Record<Tab, string> = {
  list: "一覧",
  create: "新規作成",
  analytics: "アナリティクス",
};

export default function AdminTeamsPage() {
  const [tab, setTab] = useState<Tab>("list");
  const [teams, setTeams] = useState<Team[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsMap>({});
  const [loading, setLoading] = useState(true);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [teamsRes, analyticsRes] = await Promise.all([
      adminFetch("/api/admin/teams"),
      adminFetch("/api/admin/teams/analytics"),
    ]);

    if (teamsRes.ok) {
      const data = await teamsRes.json();
      setTeams(data.teams);
    }
    if (analyticsRes.ok) {
      const data = await analyticsRes.json();
      const map: AnalyticsMap = {};
      for (const s of data.analytics as TeamStats[]) {
        map[s.slug] = s;
      }
      setAnalytics(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">チーム</h1>
        <div className="flex gap-2">
          {(["list", "create", "analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : tab === "list" ? (
        <TeamList teams={teams} analytics={analytics} onRefresh={fetchData} />
      ) : tab === "create" ? (
        <TeamForm
          onDone={() => {
            setTab("list");
            fetchData();
          }}
        />
      ) : (
        <TeamAnalytics
          teams={teams}
          analytics={analytics}
          detailSlug={detailSlug}
          setDetailSlug={setDetailSlug}
        />
      )}
    </div>
  );
}
