"use client";

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

      {/* 流入元 × CV */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-1">流入元別パフォーマンス</h3>
        <p className="text-xs text-gray-500 mb-4">どのチャネルが申し込みに繋がっているか</p>
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
                  </tr>
                );
              })}
              {data.sources.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 日別推移 */}
      <DailyTrend daily={data.daily} />
    </div>
  );
};

const DailyTrend = ({ daily }: DailyTrendProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-3">日別推移</h3>
      <div className="overflow-x-auto">
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
    </div>
  );
};
