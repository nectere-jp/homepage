'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuFileText, LuKey, LuSearch, LuTriangleAlert, LuTarget, LuTrendingUp, LuStar, LuCirclePlus, LuPlus, LuPencil, LuTrash2, LuFilter } from 'react-icons/lu';
import type { BusinessType } from '@/lib/blog';
import { KeywordEditModal } from '@/components/admin/KeywordEditModal';

interface KeywordData {
  keyword: string;
  data: {
    articles: string[];
    frequency: number;
    lastUsed: string;
  };
}

interface BusinessCoverage {
  business: BusinessType;
  label: string;
  total: number;
  used: number;
  percentage: number;
}

interface MasterKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  assignedArticles: string[];
  status: 'active' | 'paused' | 'achieved';
  currentRank: number | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS = {
  active: '稼働中',
  paused: '一時停止',
  achieved: '達成',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  achieved: 'bg-blue-100 text-blue-800',
};

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: '翻訳',
  'web-design': 'Web制作',
  print: '印刷',
  nobilva: 'Nobilva',
  teachit: 'Teachit',
};

export default function KeywordsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [conflicts, setConflicts] = useState<KeywordData[]>([]);
  const [businessCoverage, setBusinessCoverage] = useState<BusinessCoverage[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType | 'all'>('all');
  const [allKeywords, setAllKeywords] = useState<MasterKeyword[]>([]);
  const [sortBy, setSortBy] = useState<'priority' | 'pv' | 'name'>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterUsage, setFilterUsage] = useState<'all' | 'used' | 'unused'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<MasterKeyword | null>(null);

  useEffect(() => {
    fetchKeywordData();
    fetchBusinessCoverage();
    fetchAllKeywords();
  }, []);

  const fetchKeywordData = async () => {
    try {
      const response = await fetch('/api/admin/keywords/analyze');
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setConflicts(data.conflicts || []);
      }
    } catch (error) {
      console.error('Failed to fetch keyword data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessCoverage = async () => {
    try {
      const response = await fetch('/api/admin/keywords/master');
      if (response.ok) {
        const data = await response.json();
        const keywords = data.keywords || [];
        
        const coverage: BusinessCoverage[] = Object.entries(BUSINESS_LABELS).map(([key, label]) => {
          const business = key as BusinessType;
          const total = keywords.filter((kw: any) => 
            kw.relatedBusiness.includes(business)
          ).length;
          const used = keywords.filter((kw: any) => 
            kw.relatedBusiness.includes(business) && kw.assignedArticles.length > 0
          ).length;
          
          return {
            business,
            label,
            total,
            used,
            percentage: total > 0 ? Math.round((used / total) * 100) : 0,
          };
        });
        
        setBusinessCoverage(coverage);
      }
    } catch (error) {
      console.error('Failed to fetch business coverage:', error);
    }
  };

  const fetchAllKeywords = async () => {
    try {
      const response = await fetch('/api/admin/keywords/master');
      if (response.ok) {
        const data = await response.json();
        const keywords: MasterKeyword[] = data.keywords || [];
        setAllKeywords(keywords);
      }
    } catch (error) {
      console.error('Failed to fetch all keywords:', error);
    }
  };

  const handleDelete = async (keyword: string) => {
    if (!confirm(`「${keyword}」を削除しますか？`)) return;

    try {
      const response = await fetch(`/api/admin/keywords/master/${encodeURIComponent(keyword)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('キーワードを削除しました');
        fetchAllKeywords();
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      alert('削除に失敗しました');
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/admin/keywords/analyze', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setConflicts(data.conflicts || []);
        alert('キーワード分析が完了しました');
      } else {
        alert('分析に失敗しました');
      }
    } catch (error) {
      console.error('Failed to analyze keywords:', error);
      alert('分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  };

  // フィルタリング
  const filteredConflicts = selectedBusiness === 'all'
    ? conflicts
    : conflicts.filter(conflict => {
        // 記事のキーワードが選択された事業に関連しているか確認
        // ここでは簡易的にすべての競合を表示（必要に応じて記事の事業タグで絞り込み可能）
        return true;
      });

  // 全キーワードのフィルタリングとソート
  const filteredAndSortedKeywords = allKeywords
    .filter(kw => {
      // 事業フィルター
      if (selectedBusiness !== 'all' && !kw.relatedBusiness.includes(selectedBusiness)) {
        return false;
      }
      // 検索フィルター
      if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // 優先度フィルター
      if (filterPriority && kw.priority !== filterPriority) {
        return false;
      }
      // ステータスフィルター
      if (filterStatus && kw.status !== filterStatus) {
        return false;
      }
      // 使用状況フィルター
      if (filterUsage === 'used' && kw.assignedArticles.length === 0) {
        return false;
      }
      if (filterUsage === 'unused' && kw.assignedArticles.length > 0) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else if (sortBy === 'pv') {
        return b.estimatedPv - a.estimatedPv;
      } else {
        return a.keyword.localeCompare(b.keyword, 'ja');
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">キーワード管理</h1>
          <p className="mt-2 text-gray-600">SEO最適化とキーワード分析</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingKeyword(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary/10 transition-all duration-200 font-medium flex items-center gap-2"
          >
            <LuPlus className="w-5 h-5" />
            新規キーワード
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-soft hover:shadow-soft-lg"
          >
            <LuSearch className="w-5 h-5" />
            {analyzing ? '分析中...' : '再分析実行'}
          </button>
        </div>
      </div>

      {/* 事業タブ */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-soft-lg p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedBusiness('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              selectedBusiness === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            すべて
          </button>
          {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedBusiness(key as BusinessType)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                selectedBusiness === key
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 統計 */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総記事数</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.totalArticles}</p>
              </div>
              <LuFileText className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ユニークキーワード</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.uniqueKeywords}</p>
              </div>
              <LuKey className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">競合キーワード</p>
                <p className="text-3xl font-bold text-gray-900">{conflicts.length}</p>
              </div>
              <LuTriangleAlert className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          {/* 目標達成状況 */}
          {(() => {
            const currentCoverage = selectedBusiness === 'all'
              ? businessCoverage.reduce((acc, bc) => ({
                  total: acc.total + bc.total,
                  used: acc.used + bc.used,
                }), { total: 0, used: 0 })
              : businessCoverage.find(bc => bc.business === selectedBusiness) || { total: 0, used: 0, percentage: 0 };
            
            const percentage = selectedBusiness === 'all'
              ? currentCoverage.total > 0 ? Math.round((currentCoverage.used / currentCoverage.total) * 100) : 0
              : (currentCoverage as BusinessCoverage).percentage || 0;

            return (
              <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedBusiness === 'all' ? '全体の' : `${BUSINESS_LABELS[selectedBusiness as BusinessType]}の`}目標達成
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
                  </div>
                  <LuTrendingUp className="w-10 h-10 text-gray-400" />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 競合キーワード */}
      {filteredConflicts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft-lg mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LuTriangleAlert className="w-6 h-6 text-gray-400" />
              競合しているキーワード
            </h2>
            <p className="text-sm text-gray-600 mt-1">複数の記事で使用されているキーワード</p>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredConflicts.map(({ keyword, data }) => (
              <div key={keyword} className="p-6 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{keyword}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {data.frequency} 回使用 • 最終: {new Date(data.lastUsed).toLocaleDateString('ja-JP')}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 font-medium">使用記事:</p>
                      <ul className="mt-1 space-y-1">
                        {data.articles.map((slug) => (
                          <li key={slug} className="text-sm text-gray-600">
                            • {slug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.frequency >= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {data.frequency >= 3 ? '高' : '中'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フィルター・検索 */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <LuFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">フィルター・検索</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LuSearch className="w-4 h-4 inline mr-1" />
              キーワード検索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="キーワードで検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">重要度</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">すべて</option>
              <option value="5">★★★★★</option>
              <option value="4">★★★★</option>
              <option value="3">★★★</option>
              <option value="2">★★</option>
              <option value="1">★</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">すべて</option>
              <option value="active">稼働中</option>
              <option value="paused">一時停止</option>
              <option value="achieved">達成</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">使用状況</label>
            <select
              value={filterUsage}
              onChange={(e) => setFilterUsage(e.target.value as 'all' | 'used' | 'unused')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="unused">未使用のみ</option>
              <option value="used">使用済みのみ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'pv' | 'name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="priority">優先度順</option>
              <option value="pv">想定PV順</option>
              <option value="name">名前順</option>
            </select>
          </div>
        </div>
      </div>

      {/* キーワード一覧 */}
      <div className="bg-white rounded-2xl shadow-soft-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LuKey className="w-6 h-6 text-gray-600" />
                キーワード一覧
                {selectedBusiness !== 'all' && (
                  <span className="text-base font-normal text-gray-600">
                    （{BUSINESS_LABELS[selectedBusiness as BusinessType]}）
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                全 {filteredAndSortedKeywords.length} キーワード
              </p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAndSortedKeywords.map((kw) => (
            <div key={kw.keyword} className="p-6 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{kw.keyword}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(kw.priority)].map((_, i) => (
                        <LuStar
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    {kw.assignedArticles.length > 0 ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        使用済み
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        未使用
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[kw.status]}`}>
                      {STATUS_LABELS[kw.status]}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <LuTrendingUp className="w-4 h-4" />
                      想定PV: {kw.estimatedPv.toLocaleString()}/月
                    </span>
                    {kw.assignedArticles.length > 0 && (
                      <span className="flex items-center gap-1">
                        <LuFileText className="w-4 h-4" />
                        {kw.assignedArticles.length} 記事
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {kw.relatedBusiness.map((business) => (
                      <span
                        key={business}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {BUSINESS_LABELS[business]}
                      </span>
                    ))}
                    {kw.relatedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {kw.assignedArticles.length === 0 && (
                    <button
                      onClick={() => router.push(`/admin/claude?keyword=${encodeURIComponent(kw.keyword)}`)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                    >
                      <LuCirclePlus className="w-4 h-4" />
                      記事を作成
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingKeyword(kw);
                        setShowModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      title="編集"
                    >
                      <LuPencil className="w-4 h-4" />
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(kw.keyword)}
                      className="px-3 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      title="削除"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* キーワード編集モーダル */}
      {showModal && (
        <KeywordEditModal
          keyword={editingKeyword}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchAllKeywords();
            fetchKeywordData();
            fetchBusinessCoverage();
          }}
        />
      )}
    </div>
  );
}
