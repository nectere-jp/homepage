"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LuTriangleAlert,
  LuGhost,
  LuShare2,
  LuWaypoints,
  LuArrowRight,
  LuArrowLeft,
  LuSearch,
  LuChevronDown,
  LuChevronRight,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { adminFetch } from "@/lib/admin-fetch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { CLUSTER_AXIS_LABELS } from "@/components/admin/keywords/constants";

interface LinkInfo {
  targetSlug: string;
  anchorText: string;
}

interface ArticleLinkData {
  slug: string;
  title: string;
  published: boolean;
  clusterAxis?: string;
  articleRole?: string;
  outgoingLinks: LinkInfo[];
  incomingLinks: { fromSlug: string; anchorText: string }[];
  brokenLinks: LinkInfo[];
}

type SortKey = "title" | "outgoing" | "incoming" | "broken";

type Tone = "red" | "amber" | "blue" | "purple";

const TONE_STYLE: Record<Tone, { bg: string; border: string; text: string; icon: string }> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-600",
  },
  blue: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    icon: "text-sky-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    icon: "text-purple-600",
  },
};

export const LinksTab = () => {
  const [data, setData] = useState<ArticleLinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/links")
      .then((res) => res.json())
      .then((json) => setData(json.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const published = data.filter((a) => a.published);
    const broken = data.filter((a) => a.brokenLinks.length > 0);
    const orphan = published.filter((a) => a.incomingLinks.length === 0);
    const underlinked = published.filter((a) => a.outgoingLinks.length <= 1);
    const weakHub = published.filter(
      (a) => a.articleRole === "hub" && a.incomingLinks.length < 3,
    );
    const totalBrokenLinks = broken.reduce((s, a) => s + a.brokenLinks.length, 0);
    return { published, broken, orphan, underlinked, weakHub, totalBrokenLinks };
  }, [data]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* アクションボード: 上段のサマリー行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard tone="red" label="壊れリンク" value={groups.totalBrokenLinks} />
        <SummaryCard tone="amber" label="孤立記事" value={groups.orphan.length} />
        <SummaryCard tone="blue" label="発リンク不足" value={groups.underlinked.length} />
        <SummaryCard tone="purple" label="期待外れ hub" value={groups.weakHub.length} />
      </div>

      {/* 詳細カード */}
      <BrokenLinksCard articles={groups.broken} />
      <OrphanCard articles={groups.orphan} />
      <UnderlinkedCard articles={groups.underlinked} />
      <WeakHubCard articles={groups.weakHub} />

      {/* 全記事テーブル (折りたたみ) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setTableOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            {tableOpen ? (
              <LuChevronDown className="w-4 h-4" />
            ) : (
              <LuChevronRight className="w-4 h-4" />
            )}
            全記事の構造を見る（{groups.published.length} 件）
          </span>
          <span className="text-xs text-gray-500">発/被/壊 リンク数の一覧</span>
        </button>
        {tableOpen && <FullTable data={data} />}
      </div>
    </div>
  );
};

const SummaryCard = ({ tone, label, value }: { tone: Tone; label: string; value: number }) => {
  const style = TONE_STYLE[tone];
  const dim = value === 0;
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${dim ? "bg-white border-gray-200" : `${style.bg} ${style.border}`}`}
    >
      <div className={`text-xs ${dim ? "text-gray-500" : style.text} font-medium`}>{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${dim ? "text-gray-300" : style.text}`}>
        {value}
      </div>
    </div>
  );
};

interface ActionCardProps {
  tone: Tone;
  icon: IconType;
  title: string;
  count: number;
  description: string;
  emptyLabel: string;
  children?: React.ReactNode;
}

const ActionCard = ({ tone, icon: Icon, title, count, description, emptyLabel, children }: ActionCardProps) => {
  const style = TONE_STYLE[tone];
  const empty = count === 0;
  return (
    <section
      className={`rounded-xl border overflow-hidden ${empty ? "border-gray-200 bg-white" : `${style.border} bg-white`}`}
    >
      <header
        className={`flex items-center gap-3 px-4 py-3 border-b ${empty ? "border-gray-200 bg-gray-50" : `${style.border} ${style.bg}`}`}
      >
        <Icon className={`w-5 h-5 ${empty ? "text-gray-400" : style.icon}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${empty ? "text-gray-500" : style.text}`}>
            {title}
            <span className={`ml-2 text-xs ${empty ? "text-gray-400" : style.text}`}>
              {count} 件
            </span>
          </h3>
          <p className={`text-xs mt-0.5 ${empty ? "text-gray-400" : "text-gray-500"}`}>
            {description}
          </p>
        </div>
      </header>
      {empty ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">{emptyLabel}</div>
      ) : (
        <div className="divide-y divide-gray-100">{children}</div>
      )}
    </section>
  );
};

const ArticleRow = ({ article, extra }: { article: ArticleLinkData; extra?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50">
    <div className="flex-1 min-w-0">
      <Link
        href={`/admin/posts/${article.slug}`}
        className="text-sm font-medium text-gray-900 hover:text-primary truncate block"
      >
        {article.title}
      </Link>
      <div className="text-xs text-gray-400 truncate flex items-center gap-2">
        <span>{article.slug}</span>
        {article.clusterAxis && (
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
            {CLUSTER_AXIS_LABELS[article.clusterAxis as keyof typeof CLUSTER_AXIS_LABELS] ||
              article.clusterAxis}
          </span>
        )}
        {article.articleRole === "hub" && (
          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">hub</span>
        )}
      </div>
    </div>
    {extra && <div className="flex-none text-xs text-gray-500">{extra}</div>}
  </div>
);

const BrokenLinksCard = ({ articles }: { articles: ArticleLinkData[] }) => {
  const total = articles.reduce((s, a) => s + a.brokenLinks.length, 0);
  return (
    <ActionCard
      tone="red"
      icon={LuTriangleAlert}
      title="壊れたリンク"
      count={total}
      description="存在しない slug への内部リンク。参照先が削除されたか、slug が typo の可能性。即修正。"
      emptyLabel="壊れたリンクはありません"
    >
      {articles.map((a) => (
        <div key={a.slug} className="px-4 py-2.5 hover:bg-gray-50">
          <Link
            href={`/admin/posts/${a.slug}`}
            className="text-sm font-medium text-gray-900 hover:text-primary"
          >
            {a.title}
          </Link>
          <div className="mt-1 space-y-1">
            {a.brokenLinks.map((b, i) => (
              <div key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 inline-flex items-center gap-2 mr-2">
                <span className="font-mono">{b.targetSlug}</span>
                <span className="text-red-400">「{b.anchorText}」</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </ActionCard>
  );
};

const OrphanCard = ({ articles }: { articles: ArticleLinkData[] }) => (
  <ActionCard
    tone="amber"
    icon={LuGhost}
    title="孤立記事"
    count={articles.length}
    description="公開中だが、他の記事から 1 つもリンクされていない記事。SEO 的に機会損失。関連記事からリンクを張りたい。"
    emptyLabel="孤立記事はありません"
  >
    {articles.map((a) => (
      <ArticleRow key={a.slug} article={a} />
    ))}
  </ActionCard>
);

const UnderlinkedCard = ({ articles }: { articles: ArticleLinkData[] }) => (
  <ActionCard
    tone="blue"
    icon={LuShare2}
    title="発リンク不足"
    count={articles.length}
    description="他記事への内部リンクが 1 つ以下の公開記事。読者の回遊を増やすため追記したい。"
    emptyLabel="発リンク不足の記事はありません"
  >
    {articles.map((a) => (
      <ArticleRow
        key={a.slug}
        article={a}
        extra={`発リンク ${a.outgoingLinks.length}`}
      />
    ))}
  </ActionCard>
);

const WeakHubCard = ({ articles }: { articles: ArticleLinkData[] }) => (
  <ActionCard
    tone="purple"
    icon={LuWaypoints}
    title="期待外れ hub"
    count={articles.length}
    description="articleRole=hub に設定されているが、被リンクが 3 未満の記事。hub として機能していないので child 記事から参照を増やす。"
    emptyLabel="hub として機能していない記事はありません"
  >
    {articles.map((a) => (
      <ArticleRow
        key={a.slug}
        article={a}
        extra={`被リンク ${a.incomingLinks.length}`}
      />
    ))}
  </ActionCard>
);

const FullTable = ({ data }: { data: ArticleLinkData[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>("broken");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = data.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "title":
        cmp = a.title.localeCompare(b.title, "ja");
        break;
      case "outgoing":
        cmp = a.outgoingLinks.length - b.outgoingLinks.length;
        break;
      case "incoming":
        cmp = a.incomingLinks.length - b.incomingLinks.length;
        break;
      case "broken":
        cmp = a.brokenLinks.length - b.brokenLinks.length;
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const selectedArticle = selected ? data.find((a) => a.slug === selected) : null;

  return (
    <div className="p-4 space-y-3 bg-white">
      <div className="relative max-w-xs">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="記事を検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <SortHeader label="記事" sortKey="title" current={sortKey} asc={sortAsc} onClick={handleSort} />
                <th className="px-2 py-2 text-left text-xs text-gray-500 font-medium">軸</th>
                <SortHeader label="発リンク" sortKey="outgoing" current={sortKey} asc={sortAsc} onClick={handleSort} />
                <SortHeader label="被リンク" sortKey="incoming" current={sortKey} asc={sortAsc} onClick={handleSort} />
                <SortHeader label="壊れ" sortKey="broken" current={sortKey} asc={sortAsc} onClick={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((article) => (
                <tr
                  key={article.slug}
                  onClick={() => setSelected(article.slug === selected ? null : article.slug)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    article.slug === selected ? "bg-primary/5" : "hover:bg-gray-50"
                  } ${!article.published ? "opacity-50" : ""}`}
                >
                  <td className="px-2 py-2.5 max-w-[240px]">
                    <div className="truncate font-medium text-gray-900">{article.title}</div>
                    <div className="truncate text-xs text-gray-400">{article.slug}</div>
                  </td>
                  <td className="px-2 py-2.5">
                    {article.clusterAxis && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {CLUSTER_AXIS_LABELS[article.clusterAxis as keyof typeof CLUSTER_AXIS_LABELS] ||
                          article.clusterAxis}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    <span className="text-gray-700">{article.outgoingLinks.length}</span>
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    <span
                      className={
                        article.incomingLinks.length === 0 && article.published
                          ? "text-amber-600 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {article.incomingLinks.length}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {article.brokenLinks.length > 0 ? (
                      <span className="text-red-600 font-medium">{article.brokenLinks.length}</span>
                    ) : (
                      <span className="text-gray-300">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">該当する記事がありません</p>
          )}
        </div>

        {selectedArticle && (
          <div className="w-80 flex-none space-y-4">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm truncate flex-1">
                    {selectedArticle.title}
                  </h3>
                  <Link
                    href={`/admin/posts/${selectedArticle.slug}`}
                    className="text-xs text-primary hover:underline ml-2 flex-none"
                  >
                    編集
                  </Link>
                </div>

                {selectedArticle.brokenLinks.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-red-600 flex items-center gap-1">
                      <LuTriangleAlert className="w-3 h-3" />
                      壊れたリンク ({selectedArticle.brokenLinks.length})
                    </h4>
                    {selectedArticle.brokenLinks.map((link, i) => (
                      <div key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1.5 rounded">
                        <span className="font-mono">{link.targetSlug}</span>
                        <span className="text-red-400 ml-1">「{link.anchorText}」</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <LuArrowRight className="w-3 h-3" />
                    発リンク ({selectedArticle.outgoingLinks.length})
                  </h4>
                  {selectedArticle.outgoingLinks.length === 0 ? (
                    <p className="text-xs text-gray-400">なし</p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedArticle.outgoingLinks.map((link, i) => {
                        const isBroken = selectedArticle.brokenLinks.some(
                          (b) => b.targetSlug === link.targetSlug,
                        );
                        return (
                          <div
                            key={i}
                            className={`text-xs px-2 py-1 rounded ${isBroken ? "bg-red-50 text-red-600 line-through" : "bg-gray-50 text-gray-700"}`}
                          >
                            {link.targetSlug}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <LuArrowLeft className="w-3 h-3" />
                    被リンク ({selectedArticle.incomingLinks.length})
                  </h4>
                  {selectedArticle.incomingLinks.length === 0 ? (
                    <p className="text-xs text-amber-600">
                      どの記事からもリンクされていません
                    </p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedArticle.incomingLinks.map((link, i) => (
                        <div
                          key={i}
                          className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(link.fromSlug);
                          }}
                        >
                          {link.fromSlug}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (key: SortKey) => void;
}

const SortHeader = ({ label, sortKey, current, asc, onClick }: SortHeaderProps) => {
  const isActive = current === sortKey;
  return (
    <th
      className="px-2 py-2 text-left text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-900 select-none"
      onClick={() => onClick(sortKey)}
    >
      {label}
      {isActive && <span className="ml-0.5">{asc ? "↑" : "↓"}</span>}
    </th>
  );
};
