"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import type { AnalyticsResponse, DailySummary, SourceSummary, PageSummary, FunnelStep } from "@/app/api/admin/analytics/route";

type Tab = "overview" | "sources" | "pages" | "funnel" | "scroll";

const FUNNEL_LABELS: Record<string, string> = {
  start: "開始",
  basics: "基本情報",
  student: "生徒情報",
  concerns: "お悩み",
  career: "進路",
  source: "きっかけ",
  schedule: "日程選択",
  confirm: "確認",
  complete: "完了",
};

const SECTION_LABELS: Record<string, string> = {
  hero: "ヒーロー",
  empathy: "共感",
  concerns: "6つの悩み",
  "three-pillars": "三本柱",
  "day-flow": "1日の流れ",
  results: "実績",
  "year-roadmap": "年間ロードマップ",
  pricing: "料金",
  comparison: "競合比較",
  "coach-message": "コーチメッセージ",
  "career-path": "進路ガイド",
  "team-referral": "チーム導入",
  faq: "FAQ",
  articles: "お役立ち記事",
  "final-cta": "最終CTA",
};

const CTA_LABELS: Record<string, string> = {
  "diagnosis-hero": "メインCTA",
  "diagnosis-primary": "通常CTA",
  "diagnosis-secondary": "テキストCTA",
  "diagnosis-fixed": "固定CTA",
  "blog-cta-nobilva": "ブログCTA",
};

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/analytics?days=${days}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "概要" },
    { key: "sources", label: "流入元" },
    { key: "pages", label: "ページ別" },
    { key: "funnel", label: "診断ファネル" },
    { key: "scroll", label: "スクロール深度" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Nobilva アナリティクス</h1>
        <div className="flex items-center gap-3">
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

      {/* Tabs */}
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
          {tab === "overview" && <OverviewTab data={data} />}
          {tab === "sources" && <SourcesTab sources={data.sources} />}
          {tab === "pages" && <PagesTab pages={data.pages} />}
          {tab === "funnel" && <FunnelTab funnel={data.funnel} />}
          {tab === "scroll" && <ScrollTab daily={data.daily} />}
        </>
      )}
    </div>
  );
}

/* ─── Overview Tab ─── */

function OverviewTab({ data }: { data: AnalyticsResponse }) {
  const cvRate =
    data.totalPageViews > 0
      ? ((data.totalDiagnosisCompletes / data.totalPageViews) * 100).toFixed(2)
      : "0";

  const cards = [
    { label: "ページビュー", value: data.totalPageViews.toLocaleString() },
    { label: "ユニークセッション", value: data.totalUniqueSessions.toLocaleString() },
    { label: "診断完了", value: data.totalDiagnosisCompletes.toLocaleString() },
    { label: "CV率", value: `${cvRate}%` },
  ];

  // CTA 合計集計
  const ctaTotals: Record<string, number> = {};
  for (const d of data.daily) {
    for (const [cta, count] of Object.entries(d.ctaClicks)) {
      ctaTotals[cta] = (ctaTotals[cta] || 0) + count;
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* CTA クリック集計 */}
      {Object.keys(ctaTotals).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">CTA クリック</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(ctaTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([cta, count]) => (
                <div key={cta} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{CTA_LABELS[cta] || cta}</p>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 日別トレンド */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">日別推移</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">日付</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">PV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CTA</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">診断開始</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">診断完了</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map((d) => {
                const totalCta = Object.values(d.ctaClicks).reduce((a, b) => a + b, 0);
                return (
                  <tr key={d.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-700">{d.date}</td>
                    <td className="py-2 px-2 text-right text-gray-900 font-medium">{d.pageViews}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{d.uniqueSessions}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{totalCta}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{d.diagnosisStarts}</td>
                    <td className="py-2 px-2 text-right text-gray-900 font-medium">
                      {d.diagnosisCompletes > 0 ? (
                        <span className="text-green-600">{d.diagnosisCompletes}</span>
                      ) : (
                        d.diagnosisCompletes
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Sources Tab ─── */

function SourcesTab({ sources }: { sources: SourceSummary[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-3">流入元別</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-gray-500 font-medium">Source</th>
              <th className="text-left py-2 px-2 text-gray-500 font-medium">Medium</th>
              <th className="text-left py-2 px-2 text-gray-500 font-medium">Campaign</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">PV</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">CTA</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">CV</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 text-gray-900 font-medium">{s.utmSource}</td>
                <td className="py-2 px-2 text-gray-700">{s.utmMedium}</td>
                <td className="py-2 px-2 text-gray-700 max-w-[200px] truncate">{s.utmCampaign}</td>
                <td className="py-2 px-2 text-right text-gray-900">{s.pageViews}</td>
                <td className="py-2 px-2 text-right text-gray-900">{s.uniqueSessions}</td>
                <td className="py-2 px-2 text-right text-gray-900">{s.ctaClicks}</td>
                <td className="py-2 px-2 text-right font-medium">
                  {s.diagnosisCompletes > 0 ? (
                    <span className="text-green-600">{s.diagnosisCompletes}</span>
                  ) : (
                    s.diagnosisCompletes
                  )}
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Pages Tab ─── */

function PagesTab({ pages }: { pages: PageSummary[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-3">ページ別アクセス</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-gray-500 font-medium">パス</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">PV</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.path} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 text-gray-900 font-mono text-xs">{p.path}</td>
                <td className="py-2 px-2 text-right text-gray-900 font-medium">{p.pageViews}</td>
                <td className="py-2 px-2 text-right text-gray-900">{p.uniqueSessions}</td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Funnel Tab ─── */

function FunnelTab({ funnel }: { funnel: FunnelStep[] }) {
  const maxCount = funnel.length > 0 ? Math.max(...funnel.map((f) => f.count)) : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-1">診断フォーム ファネル</h3>
      <p className="text-xs text-gray-500 mb-6">セッション単位 (各ステップに到達したユニークセッション数)</p>

      {funnel.length === 0 ? (
        <p className="text-center text-gray-400 py-8">データがありません</p>
      ) : (
        <div className="space-y-3">
          {funnel.map((f, i) => {
            const width = maxCount > 0 ? (f.count / maxCount) * 100 : 0;
            const dropoff =
              i > 0 && funnel[i - 1].count > 0
                ? (((funnel[i - 1].count - f.count) / funnel[i - 1].count) * 100).toFixed(0)
                : null;

            return (
              <div key={f.step}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {FUNNEL_LABELS[f.step] || f.step}
                  </span>
                  <div className="flex items-center gap-3">
                    {dropoff !== null && Number(dropoff) > 0 && (
                      <span className="text-xs text-red-500">-{dropoff}%</span>
                    )}
                    <span className="text-sm font-bold text-gray-900">{f.count}</span>
                  </div>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      f.step === "complete" ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.max(width, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Scroll Depth Tab ─── */

function ScrollTab({ daily }: { daily: DailySummary[] }) {
  // 全日のセクションビューを合算
  const sectionTotals: Record<string, number> = {};
  for (const d of daily) {
    for (const [section, count] of Object.entries(d.sectionViews)) {
      sectionTotals[section] = (sectionTotals[section] || 0) + count;
    }
  }

  // LP のセクション順
  const sectionOrder = [
    "hero", "empathy", "concerns", "three-pillars", "day-flow",
    "results", "year-roadmap", "pricing", "comparison", "coach-message",
    "career-path", "team-referral", "faq", "articles", "final-cta",
  ];

  const orderedSections = sectionOrder.filter((s) => s in sectionTotals);
  const maxViews = orderedSections.length > 0
    ? Math.max(...orderedSections.map((s) => sectionTotals[s]))
    : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-1">LP スクロール深度</h3>
      <p className="text-xs text-gray-500 mb-6">
        各セクションが表示された回数 (30% 表示で1カウント)
      </p>

      {orderedSections.length === 0 ? (
        <p className="text-center text-gray-400 py-8">データがありません</p>
      ) : (
        <div className="space-y-3">
          {orderedSections.map((section, i) => {
            const count = sectionTotals[section];
            const width = maxViews > 0 ? (count / maxViews) * 100 : 0;
            const dropoff =
              i > 0 && sectionTotals[orderedSections[i - 1]] > 0
                ? (
                    ((sectionTotals[orderedSections[i - 1]] - count) /
                      sectionTotals[orderedSections[i - 1]]) *
                    100
                  ).toFixed(0)
                : null;

            return (
              <div key={section}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {SECTION_LABELS[section] || section}
                  </span>
                  <div className="flex items-center gap-3">
                    {dropoff !== null && Number(dropoff) > 0 && (
                      <span className="text-xs text-red-500">-{dropoff}%</span>
                    )}
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.max(width, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
