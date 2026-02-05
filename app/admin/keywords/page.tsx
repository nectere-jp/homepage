'use client';

import { useEffect, useState } from 'react';

interface KeywordData {
  keyword: string;
  data: {
    articles: string[];
    frequency: number;
    lastUsed: string;
  };
}

export default function KeywordsPage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [topKeywords, setTopKeywords] = useState<KeywordData[]>([]);
  const [conflicts, setConflicts] = useState<KeywordData[]>([]);

  useEffect(() => {
    fetchKeywordData();
  }, []);

  const fetchKeywordData = async () => {
    try {
      const response = await fetch('/api/admin/keywords/analyze');
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setTopKeywords(data.topKeywords);
        setConflicts(data.conflicts);
      }
    } catch (error) {
      console.error('Failed to fetch keyword data:', error);
    } finally {
      setLoading(false);
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
        setTopKeywords(data.topKeywords);
        setConflicts(data.conflicts);
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
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? '分析中...' : '🔍 再分析実行'}
        </button>
      </div>

      {/* 統計 */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総記事数</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.totalArticles}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ユニークキーワード</p>
                <p className="text-3xl font-bold text-blue-600">{analysis.uniqueKeywords}</p>
              </div>
              <div className="text-4xl">🔑</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">競合キーワード</p>
                <p className="text-3xl font-bold text-yellow-600">{conflicts.length}</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>
        </div>
      )}

      {/* 競合キーワード */}
      {conflicts.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">⚠️ 競合しているキーワード</h2>
            <p className="text-sm text-gray-600 mt-1">複数の記事で使用されているキーワード</p>
          </div>
          <div className="divide-y divide-gray-200">
            {conflicts.map(({ keyword, data }) => (
              <div key={keyword} className="p-6">
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
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
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

      {/* よく使われるキーワード */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">よく使われるキーワード</h2>
          <p className="text-sm text-gray-600 mt-1">トップ {topKeywords.length} キーワード</p>
        </div>
        <div className="divide-y divide-gray-200">
          {topKeywords.map(({ keyword, data }, index) => (
            <div key={keyword} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{keyword}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {data.frequency} 回使用 • 最終: {new Date(data.lastUsed).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{data.articles.length} 記事</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
