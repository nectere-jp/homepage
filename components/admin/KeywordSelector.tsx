'use client';

import { useEffect, useState } from 'react';
import { LuSearch, LuStar, LuTrendingUp, LuX, LuChevronDown } from 'react-icons/lu';
import type { BusinessType } from '@/lib/blog';

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

interface KeywordSelectorProps {
  onSelect: (primary: string, secondary: string[]) => void;
  initialKeyword?: string;
}

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: '翻訳',
  'web-design': 'Web制作',
  print: '印刷',
  nobilva: 'Nobilva',
  teachit: 'Teachit',
};

export function KeywordSelector({ onSelect, initialKeyword }: KeywordSelectorProps) {
  const [allKeywords, setAllKeywords] = useState<MasterKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState<string>(initialKeyword || '');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (initialKeyword) {
      setPrimaryKeyword(initialKeyword);
    }
  }, [initialKeyword]);

  useEffect(() => {
    // 主要キーワードまたは関連キーワードが変更されたら親に通知
    onSelect(primaryKeyword, secondaryKeywords);
  }, [primaryKeyword, secondaryKeywords, onSelect]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/admin/keywords/master');
      if (response.ok) {
        const data = await response.json();
        setAllKeywords(data.keywords || []);
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  // 主要キーワード候補のフィルタリング
  const filteredPrimaryKeywords = allKeywords.filter((kw) => {
    // 事業フィルター
    if (selectedBusiness !== 'all' && !kw.relatedBusiness.includes(selectedBusiness)) {
      return false;
    }
    // 検索フィルター
    if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 稼働中のみ
    if (kw.status !== 'active') {
      return false;
    }
    return true;
  });

  // 関連キーワード候補（主要キーワードと関連性の高いもの）
  const suggestedSecondaryKeywords = allKeywords.filter((kw) => {
    if (!primaryKeyword || kw.keyword === primaryKeyword) {
      return false;
    }
    
    const primaryKw = allKeywords.find((k) => k.keyword === primaryKeyword);
    if (!primaryKw) {
      return false;
    }

    // 同じ事業またはタグを持つキーワードを提案
    const hasCommonBusiness = kw.relatedBusiness.some((b) =>
      primaryKw.relatedBusiness.includes(b)
    );
    const hasCommonTag = kw.relatedTags.some((t) => primaryKw.relatedTags.includes(t));

    return (hasCommonBusiness || hasCommonTag) && kw.status === 'active';
  });

  const handlePrimarySelect = (keyword: string) => {
    setPrimaryKeyword(keyword);
    setShowPrimaryDropdown(false);
    setSearchQuery('');
    // 主要キーワード変更時は関連キーワードをクリア
    setSecondaryKeywords([]);
  };

  const handleSecondaryToggle = (keyword: string) => {
    setSecondaryKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  };

  const getKeywordInfo = (keyword: string) => {
    return allKeywords.find((kw) => kw.keyword === keyword);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 事業フィルタ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">事業で絞り込み</label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBusiness('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedBusiness === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedBusiness(key as BusinessType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedBusiness === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 主要キーワード選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          主要キーワード <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            onClick={() => setShowPrimaryDropdown(!showPrimaryDropdown)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-primary transition-colors"
          >
            {primaryKeyword ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="font-medium">{primaryKeyword}</span>
                {(() => {
                  const info = getKeywordInfo(primaryKeyword);
                  if (info) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex gap-0.5">
                          {[...Array(info.priority)].map((_, i) => (
                            <LuStar key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span>• {info.estimatedPv.toLocaleString()} PV</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : (
              <span className="text-gray-400">キーワードを選択してください</span>
            )}
            <LuChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showPrimaryDropdown ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {showPrimaryDropdown && (
            <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
              {/* 検索ボックス */}
              <div className="sticky top-0 bg-white p-3 border-b">
                <div className="relative">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="キーワードで検索..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* キーワード一覧 */}
              <div className="divide-y divide-gray-100">
                {filteredPrimaryKeywords.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    該当するキーワードがありません
                  </div>
                ) : (
                  filteredPrimaryKeywords.map((kw) => (
                    <button
                      key={kw.keyword}
                      onClick={() => handlePrimarySelect(kw.keyword)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{kw.keyword}</span>
                        <div className="flex gap-0.5">
                          {[...Array(kw.priority)].map((_, i) => (
                            <LuStar key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <LuTrendingUp className="w-3 h-3" />
                          {kw.estimatedPv.toLocaleString()} PV/月
                        </span>
                        {kw.assignedArticles.length === 0 ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            未使用
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {kw.assignedArticles.length}記事で使用中
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {kw.relatedBusiness.map((business) => (
                          <span
                            key={business}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {BUSINESS_LABELS[business]}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 関連キーワード選択 */}
      {primaryKeyword && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            関連キーワード（任意）
            {secondaryKeywords.length > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {secondaryKeywords.length}個選択中
              </span>
            )}
          </label>

          {/* 選択済みキーワード */}
          {secondaryKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {secondaryKeywords.map((kw) => (
                <div
                  key={kw}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg"
                >
                  <span className="font-medium">{kw}</span>
                  <button
                    onClick={() => handleSecondaryToggle(kw)}
                    className="hover:bg-primary/20 rounded p-0.5"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowSecondaryDropdown(!showSecondaryDropdown)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-primary transition-colors"
            >
              <span className="text-gray-700">
                {suggestedSecondaryKeywords.length > 0
                  ? 'おすすめの関連キーワードから選択'
                  : '関連キーワードはありません'}
              </span>
              <LuChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showSecondaryDropdown ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {showSecondaryDropdown && suggestedSecondaryKeywords.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {suggestedSecondaryKeywords.map((kw) => {
                    const isSelected = secondaryKeywords.includes(kw.keyword);
                    return (
                      <button
                        key={kw.keyword}
                        onClick={() => handleSecondaryToggle(kw.keyword)}
                        className={`w-full p-3 text-left transition-colors ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{kw.keyword}</span>
                              <div className="flex gap-0.5">
                                {[...Array(kw.priority)].map((_, i) => (
                                  <LuStar
                                    key={i}
                                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <LuTrendingUp className="w-3 h-3" />
                                {kw.estimatedPv.toLocaleString()} PV/月
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 選択状態のサマリー */}
      {primaryKeyword && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-2">選択中のキーワード</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">主要キーワード: </span>
              <span className="font-medium text-gray-900">{primaryKeyword}</span>
            </div>
            {secondaryKeywords.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">関連キーワード: </span>
                <span className="font-medium text-gray-900">
                  {secondaryKeywords.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
