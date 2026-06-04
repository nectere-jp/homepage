"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import type { AnalyticsResponse, DailySummary, PageSummary, FunnelStep, RefSummary, DirectStats } from "@/app/api/admin/analytics/route";
import type { RefCode } from "@/app/api/admin/ref-codes/route";

type Tab = "overview" | "refs" | "pages" | "funnel" | "scroll";

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
  const [refCodes, setRefCodes] = useState<RefCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [analyticsRes, refRes] = await Promise.all([
      adminFetch(`/api/admin/analytics?days=${days}`),
      adminFetch("/api/admin/ref-codes"),
    ]);
    if (analyticsRes.ok) setData(await analyticsRes.json());
    if (refRes.ok) {
      const d = await refRes.json();
      setRefCodes(d.codes);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "概要" },
    { key: "refs", label: "リファラル" },
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
          {tab === "refs" && (
            <RefsTab
              refs={data.refs}
              directStats={data.directStats}
              refCodes={refCodes}
              onRefCodesChange={setRefCodes}
            />
          )}
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

/* ─── Refs Tab ─── */

const TARGET_PATH_OPTIONS = [
  { value: "/ja/services/nobilva", label: "Nobilva LP" },
  { value: "/ja/services/nobilva/diagnosis", label: "診断フォーム直行" },
  { value: "/ja/services/nobilva/pricing", label: "料金ページ" },
  { value: "/ja/services/nobilva/for-teams", label: "チーム導入ページ" },
  { value: "/ja/services/nobilva/results", label: "実績ページ" },
];

function RefsTab({
  refs,
  directStats,
  refCodes,
  onRefCodesChange,
}: {
  refs: RefSummary[];
  directStats: DirectStats;
  refCodes: RefCode[];
  onRefCodesChange: (codes: RefCode[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState(TARGET_PATH_OPTIONS[0].value);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const refMap = new Map(refs.map((r) => [r.ref, r]));
  const codeMap = new Map(refCodes.map((c) => [c.code, c]));

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

      {/* コード一覧 + 集計 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">コード一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">コード</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">メモ</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">遷移先</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">PV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">セッション</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CTA</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">CV</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {refCodes.map((rc) => {
                const stats = refMap.get(rc.code);
                return (
                  <tr key={rc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {rc.code}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-700">{rc.label}</td>
                    <td className="py-2 px-2 text-gray-500 text-xs font-mono max-w-[150px] truncate">
                      {TARGET_PATH_OPTIONS.find((o) => o.value === rc.targetPath)?.label || rc.targetPath}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-900">{stats?.pageViews || 0}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{stats?.uniqueSessions || 0}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{stats?.ctaClicks || 0}</td>
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
              {/* refコードに登録されていない ref も表示 */}
              {refs
                .filter((r) => !codeMap.has(r.ref))
                .map((r) => (
                  <tr key={r.ref} className="border-b border-gray-100 hover:bg-gray-50 opacity-60">
                    <td className="py-2 px-2">
                      <span className="font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        {r.ref}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-400 italic">未登録</td>
                    <td className="py-2 px-2 text-gray-400">-</td>
                    <td className="py-2 px-2 text-right text-gray-700">{r.pageViews}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{r.uniqueSessions}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{r.ctaClicks}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{r.diagnosisCompletes}</td>
                    <td className="py-2 px-2" />
                  </tr>
                ))}
              {/* 直接アクセス (ref なし) */}
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <td className="py-2 px-2">
                  <span className="text-xs text-gray-400">-</span>
                </td>
                <td className="py-2 px-2 text-gray-500">直接アクセス / ref なし</td>
                <td className="py-2 px-2 text-gray-400">-</td>
                <td className="py-2 px-2 text-right text-gray-700">{directStats.pageViews}</td>
                <td className="py-2 px-2 text-right text-gray-700">{directStats.uniqueSessions}</td>
                <td className="py-2 px-2 text-right text-gray-700">{directStats.ctaClicks}</td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {directStats.diagnosisCompletes > 0 ? (
                    <span className="text-green-600 font-medium">{directStats.diagnosisCompletes}</span>
                  ) : (
                    0
                  )}
                </td>
                <td className="py-2 px-2" />
              </tr>
              {refCodes.length === 0 && refs.length === 0 && directStats.pageViews === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    データがまだありません
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
