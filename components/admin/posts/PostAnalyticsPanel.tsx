"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { adminFetch } from "@/lib/admin-fetch";
import type { BlogPostMetadata } from "@/lib/blog";
import type { PostDetailAnalytics } from "@/app/api/admin/posts/[slug]/analytics/route";
import { LuX, LuExternalLink, LuPencil, LuEye } from "react-icons/lu";

interface Props {
  post: BlogPostMetadata & {
    articleType?: "pillar" | "cluster" | null;
    displayLabel?: string;
  };
  days: number;
  onClose: () => void;
}

export const PostAnalyticsPanel = ({ post, days, onClose }: Props) => {
  const [data, setData] = useState<PostDetailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch(
          `/api/admin/posts/${post.slug}/analytics?days=${days}`,
        );
        if (!res.ok) {
          throw new Error("取得に失敗しました");
        }
        const json = (await res.json()) as PostDetailAnalytics;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "読み込みエラー");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post.slug, days]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/30 flex justify-end"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {post.published === false && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  下書き
                </span>
              )}
              {post.articleType === "pillar" && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  ピラー
                </span>
              )}
              {post.articleType === "cluster" && (
                <span className="px-2 py-0.5 bg-violet-100 text-violet-800 text-xs font-medium rounded-full">
                  クラスター
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(post.date).toLocaleDateString("ja-JP")}
              </span>
              <span className="text-xs text-gray-400">· 直近 {days} 日</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {post.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono truncate">
              /blog/{post.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* 操作リンク */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50">
          <Link
            href={`/admin/posts/${post.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            <LuPencil className="w-3.5 h-3.5" />
            編集
          </Link>
          <Link
            href={`/admin/blog-preview/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            <LuEye className="w-3.5 h-3.5" />
            プレビュー
          </Link>
          {post.published !== false && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <LuExternalLink className="w-3.5 h-3.5" />
              公開ページ
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading ? (
            <p className="text-sm text-gray-500">読み込み中...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !data ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <>
              {/* サマリー */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="PV"
                  value={data.totals.pageViews}
                  tone="gray"
                />
                <StatCard
                  label="UU"
                  value={data.totals.uniqueSessions}
                  tone="gray"
                />
                <StatCard
                  label="平均スクロール"
                  value={`${data.totals.avgScrollDepth}%`}
                  tone="accent"
                />
                <StatCard
                  label="CTA"
                  value={data.totals.ctaClicks}
                  tone="green"
                />
              </div>

              {/* 日次 PV 折れ線 */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  日次 PV / UU
                </h3>
                {data.daily.every((d) => d.pageViews === 0) ? (
                  <p className="text-xs text-gray-400 py-6 text-center bg-gray-50 rounded">
                    期間内にデータがありません
                  </p>
                ) : (
                  <div className="w-full h-48">
                    <ResponsiveContainer>
                      <LineChart
                        data={data.daily}
                        margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          tickFormatter={(v) => v.slice(5)}
                          minTickGap={16}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          wrapperStyle={{ fontSize: 11 }}
                          contentStyle={{
                            padding: "4px 8px",
                            borderRadius: 4,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pageViews"
                          name="PV"
                          stroke="#ea5614"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="uniqueSessions"
                          name="UU"
                          stroke="#64748b"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              {/* スクロール深度ヒストグラム */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  どこまで読まれたか（セッション分布）
                </h3>
                {data.scrollHistogram.every((b) => b.count === 0) ? (
                  <p className="text-xs text-gray-400 py-6 text-center bg-gray-50 rounded">
                    スクロールデータがありません
                  </p>
                ) : (
                  <div className="w-full h-40">
                    <ResponsiveContainer>
                      <BarChart
                        data={data.scrollHistogram}
                        margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="bucket"
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          wrapperStyle={{ fontSize: 11 }}
                          contentStyle={{
                            padding: "4px 8px",
                            borderRadius: 4,
                          }}
                        />
                        <Bar
                          dataKey="count"
                          name="セッション"
                          fill="#ea5614"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  到達率ごとのセッション数。右側（80%以上）が多いほど最後まで読まれています。
                </p>
              </section>

              {/* 流入元 */}
              {data.sources.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    流入元
                  </h3>
                  <ul className="divide-y divide-gray-100 text-xs border border-gray-100 rounded-lg overflow-hidden">
                    {data.sources.slice(0, 10).map((s) => (
                      <li
                        key={s.source}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="text-gray-800 truncate">
                          {s.source}
                        </span>
                        <span className="font-mono tabular-nums text-gray-700">
                          {s.sessions}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* CTA 内訳 */}
              {data.ctaBreakdown.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    CTA クリック内訳
                  </h3>
                  <ul className="divide-y divide-gray-100 text-xs border border-gray-100 rounded-lg overflow-hidden">
                    {data.ctaBreakdown.map((c) => (
                      <li
                        key={c.ctaId}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="font-mono text-gray-700 truncate">
                          {c.ctaId}
                        </span>
                        <span className="font-mono tabular-nums text-gray-900">
                          {c.clicks}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "gray" | "accent" | "green";
}) => {
  const toneClass =
    tone === "accent"
      ? "text-nobilva-accent"
      : tone === "green"
        ? "text-green-600"
        : "text-gray-900";
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${toneClass} tabular-nums`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
};
