"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import type {
  AnalyticsResponse,
  DailySummary,
} from "@/app/api/admin/analytics/route";
import type { RefCode } from "@/app/api/admin/ref-codes/route";
import { downloadJson, getSourceLabel, todayStr, type InternalFilter } from "./utils";

interface DashboardTabProps {
  data: AnalyticsResponse;
  refCodes: RefCode[];
  days: number;
  internalFilter: InternalFilter;
}

interface DailyTrendProps {
  daily: DailySummary[];
}

interface SparkCardProps {
  label: string;
  values: number[];
  total: number;
  color: string;
}

export const DashboardTab = ({
  data,
  refCodes,
  days,
  internalFilter,
}: DashboardTabProps) => {
  const cvRate =
    data.totalSessions > 0
      ? ((data.totalDiagnosisCompletes / data.totalSessions) * 100).toFixed(2)
      : "0";

  const cards = [
    { label: "セッション", value: data.totalSessions.toLocaleString() },
    { label: "ページビュー", value: data.totalPageViews.toLocaleString() },
    { label: "診断完了", value: data.totalDiagnosisCompletes.toLocaleString() },
    { label: "CV率", value: `${cvRate}%` },
  ];

  const handleExport = () => {
    downloadJson(`nobilva-analytics-dashboard-${todayStr()}.json`, {
      meta: {
        tab: "dashboard",
        generatedAt: new Date().toISOString(),
        rangeDays: days,
        internalFilter,
      },
      summary: {
        totalSessions: data.totalSessions,
        totalPageViews: data.totalPageViews,
        totalDiagnosisStarts: data.totalDiagnosisStarts,
        totalDiagnosisCompletes: data.totalDiagnosisCompletes,
        cvRate: Number(cvRate),
      },
      sources: data.sources.map((s) => ({
        ...s,
        label: getSourceLabel(s.source, refCodes),
      })),
      daily: data.daily,
    });
  };

  // 日付昇順でスパークライン用に揃える
  const dailyAsc = useMemo(
    () => [...data.daily].sort((a, b) => a.date.localeCompare(b.date)),
    [data.daily],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          JSON ダウンロード
        </button>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* スパークライン: 期間トレンドを一目で */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SparkCard
          label="セッション"
          total={data.totalSessions}
          values={dailyAsc.map((d) => d.sessions)}
          color="#6366f1"
        />
        <SparkCard
          label="PV"
          total={data.totalPageViews}
          values={dailyAsc.map((d) => d.pageViews)}
          color="#0ea5e9"
        />
        <SparkCard
          label="CTA"
          total={dailyAsc.reduce((s, d) => s + d.ctaClicks, 0)}
          values={dailyAsc.map((d) => d.ctaClicks)}
          color="#f59e0b"
        />
        <SparkCard
          label="CV"
          total={data.totalDiagnosisCompletes}
          values={dailyAsc.map((d) => d.diagnosisCompletes)}
          color="#22c55e"
        />
      </div>

      {/* 流入元 × CV */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-1">流入元別パフォーマンス</h3>
        <p className="text-xs text-gray-500 mb-4">
          どのチャネルが申し込みに繋がっているか。行末の「見る」で該当セッション一覧へ。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">流入元</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CTA</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">診断開始</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CV率</th>
                <th className="py-2 px-2" />
              </tr>
            </thead>
            <tbody>
              {data.sources.map((s) => {
                const rate =
                  s.sessions > 0
                    ? ((s.diagnosisCompletes / s.sessions) * 100).toFixed(1)
                    : "0";
                return (
                  <tr key={s.source} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            s.type === "ref" ? "bg-blue-500" : "bg-gray-400"
                          }`}
                        />
                        <span className="text-gray-900">
                          {getSourceLabel(s.source, refCodes)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-900">{s.sessions}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{s.ctaClicks}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{s.diagnosisStarts}</td>
                    <td className="py-2 px-2 text-right font-medium">
                      {s.diagnosisCompletes > 0 ? (
                        <span className="text-green-600">{s.diagnosisCompletes}</span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-500">{rate}%</td>
                    <td className="py-2 px-2 text-right">
                      <Link
                        href={`/admin/analytics?tab=sessions&source=${encodeURIComponent(s.source)}`}
                        className="text-xs text-primary hover:underline"
                      >
                        見る
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {data.sources.length === 0 && (
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

      {/* 日別推移 (折りたたみ) */}
      <DailyTrend daily={data.daily} />
    </div>
  );
};

const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
  const w = 160;
  const h = 36;
  if (values.length === 0) return <div className="text-xs text-gray-400">データなし</div>;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = pts.join(" ");
  const area = `0,${h} ${polyline} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polygon points={area} fill={color} opacity={0.1} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
};

const SparkCard = ({ label, values, total, color }: SparkCardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-900 tabular-nums">
        {total.toLocaleString()}
      </span>
    </div>
    <Sparkline values={values} color={color} />
  </div>
);

const DailyTrend = ({ daily }: DailyTrendProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          {open ? <LuChevronDown className="w-4 h-4" /> : <LuChevronRight className="w-4 h-4" />}
          日別推移の詳細（{daily.length} 日分）
        </span>
        <span className="text-xs text-gray-500">数字で確認したい時に展開</span>
      </button>
      {open && (
        <div className="px-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">日付</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">PV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CTA</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">診断開始</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CV</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-700">{d.date}</td>
                  <td className="py-2 px-2 text-right text-gray-900">{d.sessions}</td>
                  <td className="py-2 px-2 text-right text-gray-900">{d.pageViews}</td>
                  <td className="py-2 px-2 text-right text-gray-900">{d.ctaClicks}</td>
                  <td className="py-2 px-2 text-right text-gray-900">{d.diagnosisStarts}</td>
                  <td className="py-2 px-2 text-right font-medium">
                    {d.diagnosisCompletes > 0 ? (
                      <span className="text-green-600">{d.diagnosisCompletes}</span>
                    ) : (
                      d.diagnosisCompletes
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
