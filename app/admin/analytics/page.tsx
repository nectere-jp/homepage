"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { DashboardTab } from "@/components/admin/analytics/DashboardTab";
import { SessionsTab } from "@/components/admin/analytics/SessionsTab";
import { FunnelTab } from "@/components/admin/analytics/FunnelTab";
import { RefManagementTab } from "@/components/admin/analytics/RefManagementTab";
import type { InternalFilter } from "@/components/admin/analytics/utils";
import type { AnalyticsResponse } from "@/app/api/admin/analytics/route";
import type { RefCode } from "@/app/api/admin/ref-codes/route";

type Tab = "dashboard" | "sessions" | "funnel" | "refcodes";

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [days, setDays] = useState(30);
  const [internalFilter, setInternalFilter] = useState<InternalFilter>("exclude");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [refCodes, setRefCodes] = useState<RefCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [analyticsRes, refRes] = await Promise.all([
      adminFetch(`/api/admin/analytics?days=${days}&internal=${internalFilter}`),
      adminFetch("/api/admin/ref-codes"),
    ]);
    if (analyticsRes.ok) setData(await analyticsRes.json());
    if (refRes.ok) {
      const d = await refRes.json();
      setRefCodes(d.codes);
    }
    setLoading(false);
  }, [days, internalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "ダッシュボード" },
    { key: "sessions", label: "セッション" },
    { key: "funnel", label: "ファネル" },
    { key: "refcodes", label: "リファラル管理" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Nobilva アナリティクス</h1>
        <div className="flex items-center gap-3">
          <select
            value={internalFilter}
            onChange={(e) => setInternalFilter(e.target.value as InternalFilter)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="exclude">外部のみ</option>
            <option value="all">全て</option>
            <option value="only">内部のみ</option>
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value={7}>過去7日</option>
            <option value={14}>過去14日</option>
            <option value={30}>過去30日</option>
            <option value={60}>過去60日</option>
            <option value={90}>過去90日</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            更新
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              tab === t.key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <LoadingSpinner label="読み込み中..." />
      ) : (
        <>
          {tab === "dashboard" && (
            <DashboardTab
              data={data}
              refCodes={refCodes}
              days={days}
              internalFilter={internalFilter}
            />
          )}
          {tab === "sessions" && (
            <SessionsTab
              sessions={data.sessions}
              refCodes={refCodes}
              onRefresh={fetchData}
              days={days}
              internalFilter={internalFilter}
            />
          )}
          {tab === "funnel" && (
            <FunnelTab
              pageFunnel={data.pageFunnel}
              scrollDepth={data.scrollDepth}
              diagnosisFunnel={data.diagnosisFunnel}
              totalSessions={data.totalSessions}
              days={days}
              internalFilter={internalFilter}
            />
          )}
          {tab === "refcodes" && (
            <RefManagementTab
              refCodes={refCodes}
              onRefCodesChange={setRefCodes}
              sources={data.sources}
              days={days}
              internalFilter={internalFilter}
            />
          )}
        </>
      )}
    </div>
  );
}
