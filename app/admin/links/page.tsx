'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LuLink, LuTriangleAlert, LuArrowRight, LuArrowLeft, LuSearch } from 'react-icons/lu';
import { adminFetch } from '@/lib/admin-fetch';
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";

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

type SortKey = 'title' | 'outgoing' | 'incoming' | 'broken';
type FilterMode = 'all' | 'broken' | 'orphan' | 'hub';

const AXIS_LABELS: Record<string, string> = {
  time: '時間軸',
  career: '進路軸',
  self: '自己軸',
  relationship: '関係軸',
  other: 'その他',
};

export default function AdminLinksPage() {
  const [data, setData] = useState<ArticleLinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('broken');
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/links')
      .then((res) => res.json())
      .then((json) => setData(json.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = data
    .filter((a) => {
      if (filter === 'broken') return a.brokenLinks.length > 0;
      if (filter === 'orphan') return a.incomingLinks.length === 0 && a.published;
      if (filter === 'hub') return a.articleRole === 'hub';
      return true;
    })
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
    });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'title':
        cmp = a.title.localeCompare(b.title, 'ja');
        break;
      case 'outgoing':
        cmp = a.outgoingLinks.length - b.outgoingLinks.length;
        break;
      case 'incoming':
        cmp = a.incomingLinks.length - b.incomingLinks.length;
        break;
      case 'broken':
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

  const totalBroken = data.reduce((sum, a) => sum + a.brokenLinks.length, 0);
  const totalOrphan = data.filter((a) => a.incomingLinks.length === 0 && a.published).length;
  const selectedArticle = selected ? data.find((a) => a.slug === selected) : null;

  if (loading) {
    return (
      <LoadingSpinner size="md" label="" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LuLink className="w-6 h-6" />
          内部リンク分析
        </h1>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="総記事数" value={data.filter((a) => a.published).length} />
        <SummaryCard label="壊れたリンク" value={totalBroken} alert={totalBroken > 0} />
        <SummaryCard label="孤立記事" value={totalOrphan} alert={totalOrphan > 3} />
        <SummaryCard
          label="平均被リンク"
          value={(
            data.filter((a) => a.published).reduce((s, a) => s + a.incomingLinks.length, 0) /
            Math.max(data.filter((a) => a.published).length, 1)
          ).toFixed(1)}
        />
      </div>

      {/* フィルター & 検索 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([['all', 'すべて'], ['broken', '壊れリンクあり'], ['orphan', '孤立'], ['hub', 'ハブ記事']] as [FilterMode, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="記事を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* テーブル */}
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
                    article.slug === selected ? 'bg-primary/5' : 'hover:bg-gray-50'
                  } ${!article.published ? 'opacity-50' : ''}`}
                >
                  <td className="px-2 py-2.5 max-w-[240px]">
                    <div className="truncate font-medium text-gray-900">{article.title}</div>
                    <div className="truncate text-xs text-gray-400">{article.slug}</div>
                  </td>
                  <td className="px-2 py-2.5">
                    {article.clusterAxis && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {AXIS_LABELS[article.clusterAxis] || article.clusterAxis}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    <span className="text-gray-700">{article.outgoingLinks.length}</span>
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    <span className={article.incomingLinks.length === 0 && article.published ? 'text-amber-600 font-medium' : 'text-gray-700'}>
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

        {/* 詳細パネル */}
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

                {/* 壊れたリンク */}
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

                {/* 発リンク */}
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
                            className={`text-xs px-2 py-1 rounded ${isBroken ? 'bg-red-50 text-red-600 line-through' : 'bg-gray-50 text-gray-700'}`}
                          >
                            {link.targetSlug}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 被リンク */}
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
}

function SummaryCard({ label, value, alert }: { label: string; value: number | string; alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${alert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (key: SortKey) => void;
}) {
  const isActive = current === sortKey;
  return (
    <th
      className="px-2 py-2 text-left text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-900 select-none"
      onClick={() => onClick(sortKey)}
    >
      {label}
      {isActive && <span className="ml-0.5">{asc ? '↑' : '↓'}</span>}
    </th>
  );
}
