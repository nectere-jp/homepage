"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import { LuX } from "react-icons/lu";
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

type SessionFilter = "all" | "converted" | "cta" | "diag_dropped" | "no_cta";
type DeviceFilter = "" | "mobile" | "pc" | "unknown";

const STAGE_LABEL: Record<SessionFilter, string> = {
  all: "全て",
  converted: "CV済",
  cta: "CTA済",
  diag_dropped: "診断離脱",
  no_cta: "CTA未",
};

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

const parseStage = (v: string | null): SessionFilter => {
  if (v === "converted" || v === "cta" || v === "diag_dropped" || v === "no_cta") return v;
  return "all";
};

const parseDevice = (v: string | null): DeviceFilter => {
  if (v === "mobile" || v === "pc" || v === "unknown") return v;
  return "";
};

export const SessionsTab = ({
  sessions,
  refCodes,
  onRefresh,
  days,
  internalFilter,
}: SessionsTabProps) => {
  const sp = useSearchParams();
  const [stage, setStage] = useState<SessionFilter>(() => parseStage(sp.get("stage")));
  const [sourceFilter, setSourceFilter] = useState<string>(sp.get("source") ?? "");
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>(() => parseDevice(sp.get("device")));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const confirm = useConfirm();

  // 他タブからの遷移で URL が変わった時に追従
  useEffect(() => {
    setStage(parseStage(sp.get("stage")));
    setSourceFilter(sp.get("source") ?? "");
    setDeviceFilter(parseDevice(sp.get("device")));
  }, [sp]);

  // 流入元候補 (このセッション一覧で見かけた値だけ)
  const sourceOptions = useMemo(() => {
    const uniq = new Set<string>();
    for (const s of sessions) uniq.add(s.source);
    return Array.from(uniq).sort();
  }, [sessions]);

  const matchStage = (s: SessionSummary): boolean => {
    switch (stage) {
      case "converted": return s.diagnosisCompleted;
      case "cta": return s.ctaClicked;
      case "diag_dropped": return s.diagnosisStarted && !s.diagnosisCompleted;
      case "no_cta": return !s.ctaClicked;
      default: return true;
    }
  };

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
    if (!matchStage(s)) return false;
    if (sourceFilter && s.source !== sourceFilter) return false;
    if (deviceFilter && s.device !== deviceFilter) return false;
    return true;
  });

  const stageCounts: Record<SessionFilter, number> = {
    all: sessions.length,
    converted: sessions.filter((s) => s.diagnosisCompleted).length,
    cta: sessions.filter((s) => s.ctaClicked).length,
    diag_dropped: sessions.filter((s) => s.diagnosisStarted && !s.diagnosisCompleted).length,
    no_cta: sessions.filter((s) => !s.ctaClicked).length,
  };

  const stageKeys: SessionFilter[] = ["all", "converted", "cta", "diag_dropped", "no_cta"];
  const hasAdvancedFilter = sourceFilter !== "" || deviceFilter !== "";

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
        if (!matchStage(s)) return false;
        if (sourceFilter && s.source !== sourceFilter) return false;
        if (deviceFilter && s.device !== deviceFilter) return false;
        return true;
      });
      downloadJson(`nobilva-analytics-sessions-${stage}-${todayStr()}.json`, {
        meta: {
          tab: "sessions",
          generatedAt: new Date().toISOString(),
          rangeDays: days,
          internalFilter,
          stage,
          sourceFilter: sourceFilter || null,
          deviceFilter: deviceFilter || null,
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
      {/* ステージフィルター + エクスポート */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {stageKeys.map((key) => (
            <button
              key={key}
              onClick={() => setStage(key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                stage === key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {STAGE_LABEL[key]}
              <span className="ml-1.5 text-xs opacity-70">{stageCounts[key]}</span>
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

      {/* 流入元・デバイスフィルタ */}
      <div className="flex items-center gap-3 flex-wrap text-sm">
        <label className="flex items-center gap-2">
          <span className="text-xs text-gray-500">流入元</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 min-w-[160px]"
          >
            <option value="">すべて</option>
            {sourceOptions.map((src) => (
              <option key={src} value={src}>
                {getSourceLabel(src, refCodes)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs text-gray-500">デバイス</span>
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value as DeviceFilter)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
          >
            <option value="">すべて</option>
            <option value="mobile">SP</option>
            <option value="pc">PC</option>
            <option value="unknown">不明</option>
          </select>
        </label>
        {hasAdvancedFilter && (
          <button
            onClick={() => {
              setSourceFilter("");
              setDeviceFilter("");
            }}
            className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
          >
            <LuX className="w-3 h-3" /> クリア
          </button>
        )}
        <div className="text-xs text-gray-400 ml-auto">
          該当 {filtered.length} / 全 {sessions.length} セッション
        </div>
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
