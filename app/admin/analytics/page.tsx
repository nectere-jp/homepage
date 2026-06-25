"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import type {
  AnalyticsResponse,
  SourceSummary,
  SessionSummary,
  FunnelStep,
  DailySummary,
} from "@/app/api/admin/analytics/route";
import type { RefCode } from "@/app/api/admin/ref-codes/route";

type Tab = "dashboard" | "sessions" | "funnel" | "refcodes";

// ── ラベル定義 ──

const PAGE_LABELS: Record<string, string> = {
  "/ja/services/nobilva": "LP",
  "/ja/services/nobilva/diagnosis": "診断",
  "/ja/services/nobilva/pricing": "料金",
  "/ja/services/nobilva/for-teams": "チーム導入",
  "/ja/services/nobilva/results": "実績",
  "/ja/services/nobilva/how-it-works": "使い方",
  "/ja/services/nobilva/career-path": "進路",
  "/ja/services/nobilva/coach": "コーチ",
  "/ja/services/nobilva/faq": "FAQ",
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

const PAGE_FUNNEL_LABELS: Record<string, string> = {
  site_visit: "サイト訪問",
  lp_view: "LP 閲覧",
  blog_view: "ブログ閲覧",
  subpage_view: "サブページ閲覧",
  cta_click: "CTA クリック",
  diagnosis_page: "診断ページ到達",
  diagnosis_start: "診断開始",
  diagnosis_complete: "診断完了",
};

const TARGET_PATH_OPTIONS = [
  { value: "/ja/services/nobilva", label: "Nobilva LP" },
  { value: "/ja/services/nobilva/diagnosis", label: "診断フォーム直行" },
  { value: "/ja/services/nobilva/pricing", label: "料金ページ" },
  { value: "/ja/services/nobilva/for-teams", label: "チーム導入ページ" },
  { value: "/ja/services/nobilva/results", label: "実績ページ" },
];

// ── ヘルパー ──

function getPageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  // ブログ記事
  if (path.startsWith("/ja/blog/")) return path.replace("/ja/blog/", "blog/");
  return path;
}

function getSourceLabel(source: string, refCodes: RefCode[]): string {
  if (source.startsWith("ref:")) {
    const code = source.slice(4);
    const rc = refCodes.find((c) => c.code === code);
    return rc ? rc.label : `ref:${code}`;
  }
  return source;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "-";
  if (seconds < 60) return `${seconds}秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}時間${m % 60}分`;
  }
  return s > 0 ? `${m}分${s}秒` : `${m}分`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── メインページ ──

type InternalFilter = "exclude" | "only" | "all";

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
          {tab === "dashboard" && <DashboardTab data={data} refCodes={refCodes} />}
          {tab === "sessions" && <SessionsTab sessions={data.sessions} refCodes={refCodes} onRefresh={fetchData} />}
          {tab === "funnel" && (
            <FunnelTab
              pageFunnel={data.pageFunnel}
              scrollDepth={data.scrollDepth}
              diagnosisFunnel={data.diagnosisFunnel}
            />
          )}
          {tab === "refcodes" && (
            <RefManagementTab
              refCodes={refCodes}
              onRefCodesChange={setRefCodes}
              sources={data.sources}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── ダッシュボード ──

function DashboardTab({
  data,
  refCodes,
}: {
  data: AnalyticsResponse;
  refCodes: RefCode[];
}) {
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
}

function DailyTrend({ daily }: { daily: DailySummary[] }) {
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
}

// ── セッション一覧 ──

type SessionFilter = "all" | "converted" | "cta";

function SessionsTab({
  sessions,
  refCodes,
  onRefresh,
}: {
  sessions: SessionSummary[];
  refCodes: RefCode[];
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (sessionId: string) => {
    if (!confirm("このセッションの全イベントを削除しますか？")) return;
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

  return (
    <div className="space-y-4">
      {/* フィルター */}
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
}

function SessionCard({
  session: s,
  refCodes,
  onDelete,
  deleting,
}: {
  session: SessionSummary;
  refCodes: RefCode[];
  onDelete: (sessionId: string) => void;
  deleting: boolean;
}) {
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
}

/** ミニ円グラフ (SVG donut) */
function MiniDonut({
  percent,
  size = 16,
  unknown = false,
}: {
  percent: number;
  size?: number;
  unknown?: boolean;
}) {
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
}

// ── ファネル ──

function FunnelTab({
  pageFunnel,
  scrollDepth,
  diagnosisFunnel,
}: {
  pageFunnel: FunnelStep[];
  scrollDepth: FunnelStep[];
  diagnosisFunnel: FunnelStep[];
}) {
  return (
    <div className="space-y-6">
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
}

function FunnelChart({
  title,
  description,
  steps,
  labels,
  color,
}: {
  title: string;
  description: string;
  steps: FunnelStep[];
  labels: Record<string, string>;
  color: "amber" | "blue" | "indigo";
}) {
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
            const isComplete = f.step === "complete" || f.step === "final-cta" || f.step === "diagnosis_complete";

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
}

// ── リファラル管理 ──

function RefManagementTab({
  refCodes,
  onRefCodesChange,
  sources,
}: {
  refCodes: RefCode[];
  onRefCodesChange: (codes: RefCode[]) => void;
  sources: SourceSummary[];
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState(TARGET_PATH_OPTIONS[0].value);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const sourceMap = new Map(
    sources.filter((s) => s.type === "ref").map((s) => [s.source.slice(4), s])
  );

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    setCreating(true);
    const res = await adminFetch("/api/admin/ref-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim(), targetPath: newPath }),
    });
    if (res.ok) {
      const created = await res.json();
      onRefCodesChange([
        { ...created, createdAt: new Date().toISOString() },
        ...refCodes,
      ]);
      setNewLabel("");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このコードを削除しますか？")) return;
    const res = await adminFetch("/api/admin/ref-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      onRefCodesChange(refCodes.filter((c) => c.id !== id));
    }
  };

  const buildUrl = (code: string, targetPath: string) =>
    `https://nectere.jp${targetPath}?ref=${code}`;

  const handleCopy = async (code: string, targetPath: string) => {
    const url = buildUrl(code, targetPath);
    await navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* 新規作成 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">リファラルコード作成</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="メモ (例: Instagram プロフ, 保護者配布QR)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <select
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {TARGET_PATH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={creating || !newLabel.trim()}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? "作成中..." : "コード生成"}
          </button>
        </div>
      </div>

      {/* コード一覧 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">コード一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">コード</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">メモ</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">遷移先</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {refCodes.map((rc) => {
                const stats = sourceMap.get(rc.code);
                return (
                  <tr key={rc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {rc.code}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-700">{rc.label}</td>
                    <td className="py-2 px-2 text-gray-500 text-xs">
                      {TARGET_PATH_OPTIONS.find((o) => o.value === rc.targetPath)?.label ||
                        rc.targetPath}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-900">
                      {stats?.sessions || 0}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {(stats?.diagnosisCompletes || 0) > 0 ? (
                        <span className="text-green-600">{stats!.diagnosisCompletes}</span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleCopy(rc.code, rc.targetPath)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        >
                          {copied === rc.code ? "Copied!" : "URL"}
                        </button>
                        <button
                          onClick={() => handleDelete(rc.id)}
                          className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {refCodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    コードがまだありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
