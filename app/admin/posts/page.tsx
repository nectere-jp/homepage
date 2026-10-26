"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LuFilePlus,
  LuTrash2,
  LuExternalLink,
  LuEye,
  LuPencil,
  LuSearch,
  LuDownload,
  LuArrowUp,
  LuArrowDown,
  LuArrowUpDown,
  LuTriangleAlert,
  LuRefreshCw,
  LuX,
} from "react-icons/lu";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { BlogPostMetadata } from "@/lib/blog";
import { adminFetch } from "@/lib/admin-fetch";
import { adminButtonClass } from "@/components/admin/AdminButton";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { toast } from "@/lib/toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { PostAnalyticsPanel } from "@/components/admin/posts/PostAnalyticsPanel";
import type {
  PostAnalyticsResponse,
  PostAnalyticsRow,
} from "@/app/api/admin/posts/analytics/route";

type PostWithArticleType = BlogPostMetadata & {
  articleType?: "pillar" | "cluster" | null;
  displayLabel?: string;
};

type AnalyticsMap = Record<string, PostAnalyticsRow>;

type PeriodDays = 7 | 30 | 90;

const PERIOD_TABS: Array<{ key: PeriodDays; label: string }> = [
  { key: 7, label: "7日" },
  { key: 30, label: "30日" },
  { key: 90, label: "90日" },
];

type SortColumn = "default" | "pv" | "uu" | "scroll" | "cta";
type SortDirection = "asc" | "desc";

export default function AdminPostsPage() {
  const confirm = useConfirm();
  const [posts, setPosts] = useState<PostWithArticleType[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsMap>({});
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [days, setDays] = useState<PeriodDays>(30);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("default");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const toggleSort = (column: Exclude<SortColumn, "default">) => {
    if (sortColumn === column) {
      // 同じ列: desc → asc → default のトグル
      if (sortDirection === "desc") setSortDirection("asc");
      else setSortColumn("default");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const fetchPosts = async () => {
    try {
      const response = await adminFetch("/api/admin/posts?includeDrafts=true");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchAnalytics = async (periodDays: PeriodDays) => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const response = await adminFetch(
        `/api/admin/posts/analytics?days=${periodDays}`,
      );
      if (response.ok) {
        const data = (await response.json()) as PostAnalyticsResponse;
        const map: AnalyticsMap = {};
        for (const row of data.rows) map[row.slug] = row;
        setAnalytics(map);
      } else if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        setAnalyticsError(
          data.error ??
            "Firestore の読み取りクォータに達しました。しばらく時間を置いてから再読み込みしてください。",
        );
      } else {
        setAnalyticsError("分析データの読み込みに失敗しました。");
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalyticsError("分析データの読み込みに失敗しました。");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleDelete = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "本当にこの記事を削除しますか？",
      confirmLabel: "削除",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const response = await adminFetch(`/api/admin/posts/${slug}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("記事を削除しました");
        fetchPosts();
      } else {
        toast.error("記事の削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("記事の削除に失敗しました");
    }
  };

  // 全体サマリー（公開済み/下書きフィルタ + 検索ワード後の集計）
  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter === "published" && post.published === false) return false;
      if (filter === "draft" && post.published !== false) return false;
      if (!q) return true;
      const haystack = [
        post.title,
        post.description,
        post.category,
        post.displayLabel,
        post.seo?.primaryKeyword,
        ...(post.seo?.secondaryKeywords ?? []),
        ...(post.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, filter, search]);

  const totalSummary = useMemo(() => {
    let pv = 0;
    let cta = 0;
    let scrollSum = 0;
    let scrollN = 0;
    for (const p of filteredPosts) {
      const a = analytics[p.slug];
      if (!a) continue;
      pv += a.pageViews;
      cta += a.ctaClicks;
      if (a.avgScrollDepth > 0) {
        scrollSum += a.avgScrollDepth;
        scrollN++;
      }
    }
    return {
      pv,
      cta,
      avgScroll: scrollN > 0 ? Math.round(scrollSum / scrollN) : 0,
    };
  }, [filteredPosts, analytics]);

  // ソート後の記事リスト（表描画用）。sortColumn === "default" のときは API 順（日付降順）。
  const sortedPosts = useMemo(() => {
    if (sortColumn === "default") return filteredPosts;
    const key: keyof PostAnalyticsRow =
      sortColumn === "pv"
        ? "pageViews"
        : sortColumn === "uu"
          ? "uniqueSessions"
          : sortColumn === "scroll"
            ? "avgScrollDepth"
            : "ctaClicks";
    const sign = sortDirection === "asc" ? 1 : -1;
    return [...filteredPosts].sort((a, b) => {
      const av = analytics[a.slug]?.[key] ?? 0;
      const bv = analytics[b.slug]?.[key] ?? 0;
      if (av === bv) return 0;
      return (av < bv ? -1 : 1) * sign;
    });
  }, [filteredPosts, analytics, sortColumn, sortDirection]);

  // JSON 書き出し。現在の filter / search / 期間 / ソートを反映。
  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      periodDays: days,
      filter,
      search: search.trim() || null,
      sort: sortColumn === "default" ? null : { column: sortColumn, direction: sortDirection },
      totalCount: sortedPosts.length,
      summary: totalSummary,
      posts: sortedPosts.map((p) => {
        const a = analytics[p.slug];
        return {
          slug: p.slug,
          title: p.title,
          description: p.description,
          date: p.date,
          published: p.published !== false,
          category: p.category ?? null,
          articleType: p.articleType ?? null,
          displayLabel: p.displayLabel ?? null,
          primaryKeyword: p.seo?.primaryKeyword ?? null,
          secondaryKeywords: p.seo?.secondaryKeywords ?? [],
          tags: p.tags ?? [],
          clusterAxis: p.clusterAxis ?? null,
          articleRole: p.articleRole ?? null,
          targetReader: p.targetReader ?? null,
          dateModified: p.dateModified ?? null,
          analytics: a
            ? {
                pageViews: a.pageViews,
                uniqueSessions: a.uniqueSessions,
                avgScrollDepth: a.avgScrollDepth,
                ctaClicks: a.ctaClicks,
                daily: a.daily,
              }
            : null,
        };
      }),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const today = new Date().toISOString().slice(0, 10);
    link.download = `posts-analytics-${days}d-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedPost = selectedSlug
    ? posts.find((p) => p.slug === selectedSlug) ?? null
    : null;

  if (loadingPosts) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
          <p className="mt-2 text-gray-600">
            全 {posts.length} 件 · 期間 {days} 日の集計
          </p>
        </div>
        <Link href="/admin/claude" className={adminButtonClass()}>
          <LuFilePlus className="w-5 h-5" />
          新規作成（AI支援）
        </Link>
      </div>

      {/* 分析ロードエラーのバナー */}
      {analyticsError && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <LuTriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">
              {analyticsError}
            </p>
            <p className="text-xs text-amber-800/80 mt-1">
              記事メタ（タイトル・公開状況）は表示できていますが、PV や
              スクロール深度などの指標は 0 のまま表示されます。
            </p>
          </div>
          <button
            onClick={() => fetchAnalytics(days)}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 hover:text-amber-700 px-2 py-1 rounded transition-colors"
          >
            <LuRefreshCw className="w-3.5 h-3.5" />
            再試行
          </button>
          <button
            onClick={() => setAnalyticsError(null)}
            aria-label="閉じる"
            className="text-amber-500 hover:text-amber-700 p-1"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 期間別サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="合計 PV"
          value={totalSummary.pv.toLocaleString()}
          tone="gray"
          loading={loadingAnalytics}
        />
        <SummaryCard
          label="平均スクロール"
          value={`${totalSummary.avgScroll}%`}
          tone="accent"
          loading={loadingAnalytics}
        />
        <SummaryCard
          label="CTA クリック"
          value={totalSummary.cta.toLocaleString()}
          tone="green"
          loading={loadingAnalytics}
        />
        <SummaryCard
          label="対象記事"
          value={filteredPosts.length.toLocaleString()}
          tone="gray"
          loading={false}
        />
      </div>

      {/* コントロール群 */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { key: "all", label: "すべて", count: posts.length },
            {
              key: "published",
              label: "公開済み",
              count: posts.filter((p) => p.published !== false).length,
            },
            {
              key: "draft",
              label: "下書き",
              count: posts.filter((p) => p.published === false).length,
            },
          ]}
        />
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
          {PERIOD_TABS.map((p) => (
            <button
              key={p.key}
              onClick={() => setDays(p.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                days === p.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <LuSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="タイトル・タグ・キーワードで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
          />
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="現在のフィルタ・期間を反映したJSONをダウンロード"
        >
          <LuDownload className="w-4 h-4" />
          JSON書き出し
        </button>
      </div>

      {/* 分析テーブル */}
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden overflow-x-auto">
        {filteredPosts.length === 0 ? (
          <EmptyState message="条件に一致する記事がありません" />
        ) : (
          <table className="w-full min-w-[1040px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  記事
                </th>
                <SortableTh
                  label="PV"
                  column="pv"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onToggle={toggleSort}
                  align="right"
                  width="w-[72px]"
                />
                <SortableTh
                  label="UU"
                  column="uu"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onToggle={toggleSort}
                  align="right"
                  width="w-[64px]"
                />
                <SortableTh
                  label="平均スクロール"
                  column="scroll"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onToggle={toggleSort}
                  align="left"
                  width="w-[160px]"
                />
                <SortableTh
                  label="CTA"
                  column="cta"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onToggle={toggleSort}
                  align="right"
                  width="w-[64px]"
                />
                <th className="text-center py-3 px-4 font-semibold text-gray-600 w-[180px]">
                  推移
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 w-[132px]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPosts.map((post) => {
                const a = analytics[post.slug];
                const isActive = selectedSlug === post.slug;
                return (
                  <tr
                    key={post.slug}
                    onClick={() => setSelectedSlug(post.slug)}
                    className={`cursor-pointer transition-colors align-top ${
                      isActive ? "bg-amber-50/60" : "hover:bg-gray-50/80"
                    }`}
                  >
                    {/* 記事セル */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {post.title}
                        </span>
                        {post.published === false ? (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-full">
                            下書き
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full">
                            公開
                          </span>
                        )}
                        {post.articleType === "pillar" && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
                            ピラー
                          </span>
                        )}
                        {post.articleType === "cluster" && (
                          <span className="px-2 py-0.5 bg-violet-100 text-violet-800 text-[10px] font-medium rounded-full">
                            クラスター
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                        <span>
                          {new Date(post.date).toLocaleDateString("ja-JP")}
                        </span>
                        {post.category && (
                          <>
                            <span>·</span>
                            <span>{post.category}</span>
                          </>
                        )}
                        {post.displayLabel && (
                          <>
                            <span>·</span>
                            <span className="truncate">
                              {post.displayLabel}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* PV */}
                    <td className="py-3 px-4 text-right">
                      <MetricNumber
                        value={a?.pageViews}
                        loading={loadingAnalytics}
                        tone="gray"
                      />
                    </td>

                    {/* UU */}
                    <td className="py-3 px-4 text-right">
                      <MetricNumber
                        value={a?.uniqueSessions}
                        loading={loadingAnalytics}
                        tone="muted"
                      />
                    </td>

                    {/* 平均スクロール */}
                    <td className="py-3 px-4">
                      <ScrollBar
                        value={a?.avgScrollDepth ?? 0}
                        loading={loadingAnalytics}
                      />
                    </td>

                    {/* CTA */}
                    <td className="py-3 px-4 text-right">
                      <MetricNumber
                        value={a?.ctaClicks}
                        loading={loadingAnalytics}
                        tone="green"
                      />
                    </td>

                    {/* スパークライン + 公開日・更新日 */}
                    <td className="py-3 px-4">
                      <Sparkline
                        data={a?.daily ?? []}
                        loading={loadingAnalytics}
                        publishedAt={post.date}
                        updatedAt={post.dateModified}
                      />
                    </td>

                    {/* 操作 */}
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1 justify-end">
                        <Link
                          href={`/admin/posts/${post.slug}`}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="編集"
                        >
                          <LuPencil className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/blog-preview/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="プレビュー"
                        >
                          <LuEye className="w-4 h-4" />
                        </Link>
                        {post.published !== false && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="公開ページ"
                          >
                            <LuExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={(e) => handleDelete(post.slug, e)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedPost && (
        <PostAnalyticsPanel
          post={selectedPost}
          days={days}
          onClose={() => setSelectedSlug(null)}
        />
      )}
    </div>
  );
}

const SummaryCard = ({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: string;
  tone: "gray" | "accent" | "green";
  loading: boolean;
}) => {
  const toneClass =
    tone === "accent"
      ? "text-nobilva-accent"
      : tone === "green"
        ? "text-green-600"
        : "text-gray-900";
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-2xl font-bold tabular-nums mt-1 ${toneClass} ${
          loading ? "animate-pulse" : ""
        }`}
      >
        {loading ? "…" : value}
      </p>
    </div>
  );
};

const MetricNumber = ({
  value,
  loading,
  tone,
}: {
  value: number | undefined;
  loading: boolean;
  tone: "gray" | "muted" | "green";
}) => {
  if (loading) return <span className="text-xs text-gray-300">…</span>;
  if (value == null || value === 0) {
    return <span className="text-xs text-gray-300 tabular-nums">0</span>;
  }
  const toneClass =
    tone === "green"
      ? "text-green-600 font-medium"
      : tone === "muted"
        ? "text-gray-500"
        : "text-gray-900 font-medium";
  return (
    <span className={`text-sm tabular-nums ${toneClass}`}>
      {value.toLocaleString()}
    </span>
  );
};

const ScrollBar = ({
  value,
  loading,
}: {
  value: number;
  loading: boolean;
}) => {
  if (loading) {
    return <div className="h-2 bg-gray-100 rounded-full animate-pulse" />;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-nobilva-accent rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-gray-700 w-9 text-right">
        {value}%
      </span>
    </div>
  );
};

/**
 * スパークライン + 公開日/更新日ラベル。
 * 期間内に収まる日付は折れ線上に点を重ねる（公開=青 / 更新=橙）。
 * 期間外の日付はラベルのみ表示（グレーアウト）。
 */
const Sparkline = ({
  data,
  loading,
  publishedAt,
  updatedAt,
}: {
  data: Array<{ date: string; pageViews: number }>;
  loading: boolean;
  publishedAt: string;
  updatedAt?: string | null;
}) => {
  const formatShort = (iso: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(5, 10);
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  const publishedKey = publishedAt?.slice(0, 10) ?? null;
  const updatedKey = updatedAt?.slice(0, 10) ?? null;
  const sameDay = !!(publishedKey && updatedKey && publishedKey === updatedKey);

  // publishedKey/updatedKey/sameDay に依存する dot renderer。
  // 毎 render で新関数を作ると recharts が内部メモ化できず、
  // 一覧の検索入力などで無関係に再描画されるため useCallback で固定化。
  const renderDot = useCallback(
    (props: { cx?: number; cy?: number; payload?: { date: string } }) => {
      const { cx, cy, payload } = props;
      if (
        cx == null ||
        cy == null ||
        !payload ||
        Number.isNaN(cx) ||
        Number.isNaN(cy)
      ) {
        return null;
      }
      if (payload.date === publishedKey) {
        return (
          <circle cx={cx} cy={cy} r={3} fill="#2563eb" stroke="#fff" strokeWidth={1} />
        );
      }
      if (payload.date === updatedKey && !sameDay) {
        return (
          <circle cx={cx} cy={cy} r={3} fill="#d97706" stroke="#fff" strokeWidth={1} />
        );
      }
      return null;
    },
    [publishedKey, updatedKey, sameDay],
  );
  const publishedInRange =
    publishedKey && data.some((d) => d.date === publishedKey);
  const updatedInRange =
    updatedKey && data.some((d) => d.date === updatedKey);

  const Label = (
    <div className="text-[10px] leading-tight flex items-center gap-1.5 mb-0.5">
      <span className={publishedInRange ? "text-blue-600" : "text-gray-400"}>
        公開 {formatShort(publishedAt)}
      </span>
      {!sameDay && updatedAt && (
        <>
          <span className="text-gray-300">·</span>
          <span className={updatedInRange ? "text-amber-600" : "text-gray-400"}>
            更新 {formatShort(updatedAt)}
          </span>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div>
        {Label}
        <div className="h-8 bg-gray-50 rounded animate-pulse" />
      </div>
    );
  }
  const hasData = data.length > 0 && data.some((d) => d.pageViews > 0);
  return (
    <div>
      {Label}
      {hasData ? (
        <div className="w-full h-8">
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
            >
              <Line
                type="monotone"
                dataKey="pageViews"
                stroke="#ea5614"
                strokeWidth={1.5}
                dot={renderDot}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-8 flex items-center justify-center text-[10px] text-gray-300">
          ─
        </div>
      )}
    </div>
  );
};

const SortableTh = ({
  label,
  column,
  activeColumn,
  direction,
  onToggle,
  align,
  width,
}: {
  label: string;
  column: Exclude<SortColumn, "default">;
  activeColumn: SortColumn;
  direction: SortDirection;
  onToggle: (c: Exclude<SortColumn, "default">) => void;
  align: "left" | "right";
  width: string;
}) => {
  const isActive = activeColumn === column;
  const alignClass = align === "right" ? "text-right" : "text-left";
  const justifyClass = align === "right" ? "justify-end" : "justify-start";
  return (
    <th className={`${alignClass} py-3 px-4 font-semibold text-gray-600 ${width}`}>
      <button
        onClick={() => onToggle(column)}
        className={`inline-flex items-center gap-1 ${justifyClass} w-full hover:text-gray-900 transition-colors ${
          isActive ? "text-gray-900" : ""
        }`}
      >
        {label}
        {isActive ? (
          direction === "asc" ? (
            <LuArrowUp className="w-3 h-3" />
          ) : (
            <LuArrowDown className="w-3 h-3" />
          )
        ) : (
          <LuArrowUpDown className="w-3 h-3 text-gray-300" />
        )}
      </button>
    </th>
  );
};
