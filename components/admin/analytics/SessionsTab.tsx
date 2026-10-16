"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { SessionSummary } from "@/app/api/admin/analytics/route";
import type { RefCode } from "@/app/api/admin/ref-codes/route";
import {
  downloadJson,
  formatDuration,
  formatTime,
  getPageLabel,
  getSourceLabel,
  todayStr,
  type InternalFilter,
} from "./utils";

type SessionFilter = "all" | "converted" | "cta";

interface SessionsTabProps {
  sessions: SessionSummary[];
  refCodes: RefCode[];
  onRefresh: () => void;
  days: number;
  internalFilter: InternalFilter;
}

interface SessionCardProps {
  session: SessionSummary;
  refCodes: RefCode[];
  onDelete: (sessionId: string) => void;
  deleting: boolean;
}

interface MiniDonutProps {
  percent: number;
  size?: number;
  unknown?: boolean;
}

export const SessionsTab = ({
  sessions,
  refCodes,
  onRefresh,
  days,
  internalFilter,
}: SessionsTabProps) => {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const confirm = useConfirm();

  const handleDelete = async (sessionId: string) => {
    const ok = await confirm({
      title: "セッションを削除",
      description: "このセッションの全イベントを削除しますか？",
      confirmLabel: "削除",
      variant: "danger",
    });
    if (!ok) return;
    setDeletingId(sessionId);
    const res = await adminFetch("/api/admin/analytics", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      onRefresh();
    }
    setDeletingId(null);
  };

  const filtered = sessions.filter((s) => {
    if (filter === "converted") return s.diagnosisCompleted;
    if (filter === "cta") return s.ctaClicked;
    return true;
  });

  const filters: { key: SessionFilter; label: string; count: number }[] = [
    { key: "all", label: "全て", count: sessions.length },
    { key: "converted", label: "CV済", count: sessions.filter((s) => s.diagnosisCompleted).length },
    { key: "cta", label: "CTA済", count: sessions.filter((s) => s.ctaClicked).length },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      // 画面表示は direct 200件打ち切りだが、エクスポートは limit=all で期間内の全セッションを取る
      const res = await adminFetch(
        `/api/admin/analytics?days=${days}&internal=${internalFilter}&limit=all`,
      );
      if (!res.ok) {
        toast.error("エクスポートに失敗しました");
        return;
      }
      const data = (await res.json()) as { sessions: SessionSummary[] };
      const all = data.sessions.filter((s) => {
        if (filter === "converted") return s.diagnosisCompleted;
        if (filter === "cta") return s.ctaClicked;
        return true;
      });
      downloadJson(`nobilva-analytics-sessions-${filter}-${todayStr()}.json`, {
        meta: {
          tab: "sessions",
          generatedAt: new Date().toISOString(),
          rangeDays: days,
          internalFilter,
          sessionFilter: filter,
          count: all.length,
          exportMode: "full",
        },
        sessions: all.map((s) => ({
          ...s,
          sourceLabel: getSourceLabel(s.source, refCodes),
        })),
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* フィルター + エクスポート */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{f.count}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0 || exporting}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {exporting ? "取得中..." : "JSON ダウンロード（全件）"}
        </button>
      </div>

      {/* セッションカード */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          該当するセッションがありません
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              refCodes={refCodes}
              onDelete={handleDelete}
              deleting={deletingId === s.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SessionCard = ({
  session: s,
  refCodes,
  onDelete,
  deleting,
}: SessionCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(s.startTime)}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
              s.source.startsWith("ref:")
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {getSourceLabel(s.source, refCodes)}
          </span>
          {s.device !== "unknown" && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                s.device === "mobile" ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-700"
              }`}
            >
              {s.device === "mobile" ? "SP" : "PC"}
            </span>
          )}
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDuration(s.duration)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {s.internal && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">内部</span>
          )}
          {s.ctaClicked && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">CTA</span>
          )}
          {s.diagnosisStarted && !s.diagnosisCompleted && (
            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
              診断途中
            </span>
          )}
          {s.diagnosisCompleted && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              CV
            </span>
          )}
          <button
            onClick={() => onDelete(s.id)}
            disabled={deleting}
            className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors disabled:opacity-50"
            title="このセッションを削除"
          >
            {deleting ? "..." : "×"}
          </button>
        </div>
      </div>

      {/* ページ遷移（円グラフ付きチップ） */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {s.pages.map((page, i) => {
          const depth = s.pageDepths[page];
          return (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300 text-xs">→</span>}
              <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-700 pl-1 pr-1.5 py-0.5 rounded">
                {depth != null ? (
                  <MiniDonut percent={depth} />
                ) : (
                  <MiniDonut percent={0} unknown />
                )}
                {getPageLabel(page)}
                {depth != null && (
                  <span className="text-[10px] text-gray-400">{depth}%</span>
                )}
              </span>
            </span>
          );
        })}
        {s.pages.length === 0 && (
          <span className="text-xs text-gray-400">ページ遷移なし</span>
        )}
      </div>
    </div>
  );
};

/** ミニ円グラフ (SVG donut) */
const MiniDonut = ({ percent, size = 16, unknown = false }: MiniDonutProps) => {
  const r = (size - 2.5) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = unknown
    ? "#d1d5db"
    : percent >= 75
      ? "#22c55e"
      : percent >= 40
        ? "#f59e0b"
        : "#ef4444";

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={2}
      />
      {!unknown && percent > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
};
