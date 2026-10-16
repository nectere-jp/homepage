"use client";

import type { FunnelStep } from "@/app/api/admin/analytics/route";
import {
  FUNNEL_LABELS,
  PAGE_FUNNEL_LABELS,
  SECTION_LABELS,
} from "./labels";
import { downloadJson, todayStr, type InternalFilter } from "./utils";

interface FunnelTabProps {
  pageFunnel: FunnelStep[];
  scrollDepth: FunnelStep[];
  diagnosisFunnel: FunnelStep[];
  totalSessions: number;
  days: number;
  internalFilter: InternalFilter;
}

interface FunnelChartProps {
  title: string;
  description: string;
  steps: FunnelStep[];
  labels: Record<string, string>;
  color: "amber" | "blue" | "indigo";
}

export const FunnelTab = ({
  pageFunnel,
  scrollDepth,
  diagnosisFunnel,
  totalSessions,
  days,
  internalFilter,
}: FunnelTabProps) => {
  const handleExport = () => {
    const annotate = (steps: FunnelStep[], labels: Record<string, string>) =>
      steps.map((s) => ({ ...s, label: labels[s.step] || s.step }));

    downloadJson(`nobilva-analytics-funnel-${todayStr()}.json`, {
      meta: {
        tab: "funnel",
        generatedAt: new Date().toISOString(),
        rangeDays: days,
        internalFilter,
        totalSessions,
      },
      pageFunnel: annotate(pageFunnel, PAGE_FUNNEL_LABELS),
      scrollDepth: annotate(scrollDepth, SECTION_LABELS),
      diagnosisFunnel: annotate(diagnosisFunnel, FUNNEL_LABELS),
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
      <FunnelChart
        title="ページ遷移ファネル"
        description="各マイルストーンに到達したユニークセッション数 (順序不問)"
        steps={pageFunnel}
        labels={PAGE_FUNNEL_LABELS}
        color="indigo"
      />
      <FunnelChart
        title="LP スクロール深度"
        description="各セクションに到達したユニークセッション数"
        steps={scrollDepth}
        labels={SECTION_LABELS}
        color="amber"
      />
      <FunnelChart
        title="診断フォーム ファネル"
        description="各ステップに到達したユニークセッション数"
        steps={diagnosisFunnel}
        labels={FUNNEL_LABELS}
        color="blue"
      />
    </div>
  );
};

const FunnelChart = ({
  title,
  description,
  steps,
  labels,
  color,
}: FunnelChartProps) => {
  const maxCount = steps.length > 0 ? Math.max(...steps.map((f) => f.count)) : 1;
  const barColors: Record<string, string> = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
  };
  const barColor = barColors[color];
  const completeColor = "bg-green-500";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-6">{description}</p>

      {steps.length === 0 ? (
        <p className="text-center text-gray-400 py-8">データがありません</p>
      ) : (
        <div className="space-y-3">
          {steps.map((f, i) => {
            const width = maxCount > 0 ? (f.count / maxCount) * 100 : 0;
            const dropoff =
              i > 0 && steps[i - 1].count > 0
                ? (((steps[i - 1].count - f.count) / steps[i - 1].count) * 100).toFixed(0)
                : null;
            const isComplete =
              f.step === "complete" ||
              f.step === "final-cta" ||
              f.step === "diagnosis_complete";

            return (
              <div key={f.step}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {labels[f.step] || f.step}
                  </span>
                  <div className="flex items-center gap-3">
                    {dropoff !== null && Number(dropoff) > 0 && (
                      <span className="text-xs text-red-500">-{dropoff}%</span>
                    )}
                    <span className="text-sm font-bold text-gray-900">{f.count}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? completeColor : barColor}`}
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
};
