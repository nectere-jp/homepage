"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { TeamCampaign } from "@/lib/teams";

interface SessionSummary {
  id: string;
  sessionId: string;
  teamSlug: string;
  campaignSlug: string | null;
  firstTouch: {
    campaignSlug: string | null;
    utm: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
    };
    referrer: string | null;
    landedAt: string;
    landingPath: string;
  };
  device: "mobile" | "tablet" | "desktop";
  userAgent: string;
  screenWidth: number;
  maxScrollDepth: number;
  sections: Array<{ id: string; label: string; dwellMs: number }>;
  ctaClicks: Array<{
    ctaId: string;
    ctaType?: "consult" | "line";
    href: string;
    at: string;
  }>;
  landedAt: string;
  endedAt: string;
  durationMs: number;
  date: string;
}

interface TimelineEvent {
  id: string;
  event: string;
  createdAt: string | { _seconds: number; _nanoseconds: number };
  campaignSlug?: string | null;
  payload?: Record<string, unknown>;
}

interface Props {
  teamSlug: string;
  teamName: string;
  campaigns: TeamCampaign[];
  onClose: () => void;
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${s}秒`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hour}:${min}`;
}

function formatEventTime(t: TimelineEvent["createdAt"]): string {
  if (typeof t === "string") return formatDateTime(t);
  if (t && typeof t === "object" && "_seconds" in t) {
    return formatDateTime(new Date(t._seconds * 1000).toISOString());
  }
  return "—";
}

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname + new URL(url).pathname;
  } catch {
    return url.slice(0, 40);
  }
}

/**
 * CTA 種別を解決する。ctaType が無い過去データは ctaId の suffix で判定する。
 */
function resolveCtaType(
  ctaType: "consult" | "line" | undefined,
  ctaId: string,
): "consult" | "line" {
  if (ctaType) return ctaType;
  return ctaId.endsWith("_line") ? "line" : "consult";
}

function ctaTypeLabel(type: "consult" | "line"): string {
  return type === "line" ? "LINE" : "面談";
}

export const TeamSessions = ({ teamSlug, teamName, campaigns, onClose }: Props) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<string>("");
  const [deviceFilter, setDeviceFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ slug: teamSlug, limit: "100" });
      if (campaignFilter) params.set("campaign", campaignFilter);
      if (deviceFilter) params.set("device", deviceFilter);
      const res = await adminFetch(`/api/admin/teams/sessions?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "セッション取得に失敗しました");
      }
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みエラー");
    } finally {
      setLoading(false);
    }
  }, [teamSlug, campaignFilter, deviceFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedId) setSelectedId(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedId, onClose]);

  const selected = sessions.find((s) => s.sessionId === selectedId) ?? null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-stretch justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-6xl flex flex-col shadow-2xl max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {teamName} / セッション一覧
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              最新 {sessions.length} 件（最大100件）
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50 text-xs">
          <label className="flex items-center gap-1 text-gray-600">
            経路
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="">すべて</option>
              {campaigns.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}（{c.slug}）
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 text-gray-600">
            端末
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="">全部</option>
              <option value="mobile">モバイル</option>
              <option value="tablet">タブレット</option>
              <option value="desktop">デスクトップ</option>
            </select>
          </label>
          <button
            onClick={fetchSessions}
            className="ml-auto text-gray-600 hover:text-gray-900"
          >
            再読み込み
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div
            className={`overflow-auto ${selected ? "w-1/2 border-r border-gray-200" : "w-full"}`}
          >
            {error ? (
              <div className="text-center py-16 text-sm text-red-600">{error}</div>
            ) : loading ? (
              <div className="text-center py-16 text-sm text-gray-500">読み込み中...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-500">
                まだセッション記録がありません。
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr className="text-gray-600 text-left">
                    <th className="px-3 py-2 font-medium">日時</th>
                    <th className="px-3 py-2 font-medium">経路</th>
                    <th className="px-3 py-2 font-medium">端末</th>
                    <th className="px-3 py-2 font-medium text-right">スクロール</th>
                    <th className="px-3 py-2 font-medium text-right">面談</th>
                    <th className="px-3 py-2 font-medium text-right">LINE</th>
                    <th className="px-3 py-2 font-medium">遷移先</th>
                    <th className="px-3 py-2 font-medium text-right">滞在</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const consultCount = s.ctaClicks.filter(
                      (c) => resolveCtaType(c.ctaType, c.ctaId) === "consult",
                    ).length;
                    const lineCount = s.ctaClicks.filter(
                      (c) => resolveCtaType(c.ctaType, c.ctaId) === "line",
                    ).length;
                    const lastCta = s.ctaClicks[s.ctaClicks.length - 1];
                    const lastType = lastCta
                      ? resolveCtaType(lastCta.ctaType, lastCta.ctaId)
                      : null;
                    const isSelected = selectedId === s.sessionId;
                    return (
                      <tr
                        key={s.sessionId}
                        onClick={() => setSelectedId(s.sessionId)}
                        className={`cursor-pointer border-b border-gray-100 ${
                          isSelected ? "bg-yellow-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDateTime(s.endedAt)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {s.campaignSlug ? (
                            <span className="font-mono text-gray-900">
                              {s.campaignSlug}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{s.device}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {s.maxScrollDepth}%
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${
                            consultCount > 0
                              ? "text-nobilva-accent font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {consultCount}
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${
                            lineCount > 0
                              ? "text-[#06C755] font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {lineCount}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[8rem]">
                          {lastType ? (
                            ctaTypeLabel(lastType)
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatDuration(s.durationMs)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {selected && (
            <SessionDetailPanel
              sessionId={selected.sessionId}
              summary={selected}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SessionDetailPanel = ({
  sessionId,
  summary,
  onClose,
}: {
  sessionId: string;
  summary: SessionSummary;
  onClose: () => void;
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminFetch(`/api/admin/teams/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const maxDwell = Math.max(1, ...summary.sections.map((s) => s.dwellMs));

  return (
    <div className="w-1/2 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-900">セッション詳細</h4>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          閉じる
        </button>
      </div>

      <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-xs mb-5">
        <dt className="text-gray-500">sessionId</dt>
        <dd className="font-mono text-gray-900 truncate">{summary.sessionId}</dd>
        <dt className="text-gray-500">滞在</dt>
        <dd className="font-mono text-gray-900">
          {formatDuration(summary.durationMs)}
        </dd>
        <dt className="text-gray-500">最大スクロール</dt>
        <dd className="font-mono text-gray-900">{summary.maxScrollDepth}%</dd>
        <dt className="text-gray-500">キャンペーン</dt>
        <dd className="font-mono text-gray-900">
          {summary.campaignSlug ?? "—"}
        </dd>
        <dt className="text-gray-500">UTM source</dt>
        <dd className="font-mono text-gray-900">
          {summary.firstTouch.utm.source ?? "—"}
        </dd>
        <dt className="text-gray-500">UTM medium</dt>
        <dd className="font-mono text-gray-900">
          {summary.firstTouch.utm.medium ?? "—"}
        </dd>
        <dt className="text-gray-500">referrer</dt>
        <dd className="font-mono text-gray-900 truncate">
          {summary.firstTouch.referrer ?? "—"}
        </dd>
        <dt className="text-gray-500">端末 / 幅</dt>
        <dd className="font-mono text-gray-900">
          {summary.device} / {summary.screenWidth}px
        </dd>
        <dt className="text-gray-500">UA</dt>
        <dd className="font-mono text-gray-900 truncate text-[10px]">
          {summary.userAgent}
        </dd>
      </dl>

      <div className="mb-5">
        <h5 className="text-xs font-bold text-gray-700 mb-2">
          セクション別の滞在
        </h5>
        <div className="space-y-1">
          {summary.sections.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              <div className="w-24 shrink-0 text-gray-700 truncate">{s.label}</div>
              <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full"
                  style={{ width: `${(s.dwellMs / maxDwell) * 100}%` }}
                />
              </div>
              <div className="w-14 shrink-0 text-right font-mono text-gray-600">
                {formatDuration(s.dwellMs)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary.ctaClicks.length > 0 && (
        <div className="mb-5">
          <h5 className="text-xs font-bold text-gray-700 mb-2">
            CTA クリック
          </h5>
          <ul className="space-y-1 text-xs">
            {summary.ctaClicks.map((c, i) => {
              const type = resolveCtaType(c.ctaType, c.ctaId);
              const typeClass =
                type === "line"
                  ? "bg-[#06C755]/10 text-[#06C755]"
                  : "bg-nobilva-accent/10 text-nobilva-accent";
              return (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <span className="font-mono text-gray-400">
                    {formatDateTime(c.at)}
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded ${typeClass}`}
                  >
                    {ctaTypeLabel(type)}
                  </span>
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                    {c.ctaId}
                  </span>
                  <span className="truncate text-gray-500">
                    → {c.href || "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <h5 className="text-xs font-bold text-gray-700 mb-2">イベント時系列</h5>
        {loading ? (
          <p className="text-xs text-gray-500">読み込み中...</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-gray-400">記録なし</p>
        ) : (
          <ul className="space-y-1 text-xs font-mono">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span className="text-gray-400">
                  {formatEventTime(e.createdAt)}
                </span>
                <span className="text-gray-900">{e.event}</span>
                {e.campaignSlug && (
                  <span className="text-gray-500">[{e.campaignSlug}]</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
