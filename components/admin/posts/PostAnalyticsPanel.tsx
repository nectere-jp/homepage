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
import type {
  PostDetailAnalytics,
  PostSession,
  PostCtaType,
} from "@/app/api/admin/posts/[slug]/analytics/route";
import { LuX, LuExternalLink, LuPencil, LuEye } from "react-icons/lu";
import { PAGE_FUNNEL_LABELS, FUNNEL_LABELS } from "@/components/admin/analytics/labels";

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
        if (res.ok) {
          const json = (await res.json()) as PostDetailAnalytics;
          if (!cancelled) setData(json);
        } else if (res.status === 429) {
          const payload = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(
              payload.error ??
                "Firestore の読み取りクォータに達しました。しばらく時間を置いてから再読み込みしてください。",
            );
          }
        } else {
          if (!cancelled) setError("取得に失敗しました");
        }
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

              {/* セッション一覧 + CTA 後導線 */}
              {data.sessions.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    セッション一覧（{data.sessions.length}）
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    記事を訪れたセッション。非LINE の CTA を押した場合は
                    その後の診断ページ到達・診断開始・診断完了まで追跡しています。
                  </p>
                  <div className="space-y-2">
                    {data.sessions.map((s) => (
                      <SessionJourneyCard key={s.id} session={s} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const formatElapsed = (sec: number) => {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
};

const CTA_TYPE_LABEL: Record<PostCtaType, string> = {
  consult: "面談",
  line: "LINE",
  kindle: "Kindle",
  other: "その他",
};

const CTA_TYPE_TONE: Record<PostCtaType, string> = {
  consult: "bg-amber-50 text-amber-700 border-amber-200",
  line: "bg-green-50 text-green-700 border-green-200",
  kindle: "bg-sky-50 text-sky-700 border-sky-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

// マイルストーン表示ラベルは PAGE_FUNNEL_LABELS を再利用 (他の analytics タブと文言統一)
// step 名 (basics/student/concerns 等) は FUNNEL_LABELS で日本語化

const SessionJourneyCard = ({ session: s }: { session: PostSession }) => {
  const hasLineOnly =
    s.ctaClicks.length > 0 && s.ctaClicks.every((c) => c.ctaType === "line");
  const firstNonLineCta = s.ctaClicks.find((c) => c.ctaType !== "line");
  const converted = s.postCtaMilestones.some(
    (m) => m.kind === "diagnosis_complete",
  );

  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2.5 bg-white">
      {/* ヘッダー行: 時刻 / 流入 / デバイス / サマリー */}
      <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
        <span className="text-gray-500 tabular-nums">
          {formatShortDate(s.startTime)} {formatTime(s.startTime)}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded-full ${
            s.source.startsWith("ref:")
              ? "bg-blue-50 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {s.source}
        </span>
        {s.device !== "unknown" && (
          <span
            className={`px-1.5 py-0.5 rounded-full ${
              s.device === "mobile"
                ? "bg-sky-50 text-sky-700"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            {s.device === "mobile" ? "SP" : "PC"}
          </span>
        )}
        {s.internal && (
          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full">
            内部
          </span>
        )}
        {converted && (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
            CV
          </span>
        )}
        <span className="ml-auto text-gray-400 tabular-nums">
          スクロール {s.articleMaxScroll}% · 滞在 {formatElapsed(s.articleDurationSec)}
        </span>
      </div>

      {/* タイムライン */}
      {s.ctaClicks.length === 0 ? (
        <p className="text-[11px] text-gray-400">
          記事を閲覧（CTA クリックなし）
        </p>
      ) : (
        <ol className="relative pl-4 space-y-1 text-xs before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-gray-200">
          {s.ctaClicks.map((c, i) => (
            <li key={`cta-${i}`} className="relative">
              <span
                className={`absolute -left-4 top-1 w-2 h-2 rounded-full border ${CTA_TYPE_TONE[c.ctaType]}`}
                aria-hidden
              />
              <span className="text-gray-500 tabular-nums mr-2">
                {formatTime(c.at)}
              </span>
              <span
                className={`inline-block px-1.5 py-0.5 rounded-full border text-[10px] mr-1.5 ${CTA_TYPE_TONE[c.ctaType]}`}
              >
                {CTA_TYPE_LABEL[c.ctaType]}
              </span>
              <span className="font-mono text-gray-700 text-[11px]">
                {c.ctaId}
              </span>
            </li>
          ))}
          {hasLineOnly && (
            <li className="relative text-gray-400 text-[11px] italic">
              <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-gray-200" aria-hidden />
              LINE 外部遷移（以降は追跡不可）
            </li>
          )}
          {firstNonLineCta &&
            s.postCtaMilestones.map((m, i) => (
              <li key={`ms-${i}`} className="relative">
                <span
                  className={`absolute -left-4 top-1 w-2 h-2 rounded-full ${
                    m.kind === "diagnosis_complete"
                      ? "bg-green-500"
                      : m.kind === "diagnosis_start"
                        ? "bg-amber-500"
                        : "bg-gray-300"
                  }`}
                  aria-hidden
                />
                <span className="text-gray-500 tabular-nums mr-2">
                  {formatTime(m.at)}
                </span>
                <span
                  className={
                    m.kind === "diagnosis_complete"
                      ? "text-green-700 font-medium"
                      : "text-gray-700"
                  }
                >
                  {PAGE_FUNNEL_LABELS[m.kind] ?? m.kind}
                  {m.label ? `: ${FUNNEL_LABELS[m.label] ?? m.label}` : ""}
                </span>
              </li>
            ))}
          {firstNonLineCta && s.postCtaMilestones.length === 0 && (
            <li className="relative text-gray-400 text-[11px] italic">
              <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-gray-200" aria-hidden />
              診断ページ未到達（直後に離脱）
            </li>
          )}
        </ol>
      )}
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
