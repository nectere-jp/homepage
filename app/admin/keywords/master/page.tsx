"use client";

import { useEffect, useState } from "react";
import {
  LuPlus,
  LuSearch,
  LuFilter,
  LuTrash2,
  LuPencil,
  LuStar,
} from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";
import { KeywordEditModal } from "@/components/admin/KeywordEditModal";

interface TargetKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: number | null;
  status: "active" | "paused" | "achieved";
  assignedArticles: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: "翻訳",
  "web-design": "Web制作",
  print: "印刷",
  nobilva: "Nobilva",
  teachit: "Teachit",
};

const STATUS_LABELS = {
  active: "稼働中",
  paused: "一時停止",
  achieved: "達成",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  achieved: "bg-blue-100 text-blue-800",
};

export default function KeywordMasterPage() {
  const [keywords, setKeywords] = useState<TargetKeyword[]>([]);
  const [filteredKeywords, setFilteredKeywords] = useState<TargetKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBusiness, setFilterBusiness] = useState<BusinessType | "">("");
  const [filterPriority, setFilterPriority] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<TargetKeyword | null>(
    null,
  );

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [keywords, searchQuery, filterBusiness, filterPriority, filterStatus]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch("/api/admin/keywords/master");
      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords);
      }
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...keywords];

    // 検索
    if (searchQuery) {
      filtered = filtered.filter((kw) =>
        kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // 事業フィルタ
    if (filterBusiness) {
      filtered = filtered.filter((kw) =>
        kw.relatedBusiness.includes(filterBusiness),
      );
    }

    // 重要度フィルタ
    if (filterPriority) {
      filtered = filtered.filter((kw) => kw.priority === filterPriority);
    }

    // ステータスフィルタ
    if (filterStatus) {
      filtered = filtered.filter((kw) => kw.status === filterStatus);
    }

    setFilteredKeywords(filtered);
  };

  const handleDelete = async (keyword: string) => {
    if (!confirm(`「${keyword}」を削除しますか？`)) return;

    try {
      const response = await fetch(
        `/api/admin/keywords/master/${encodeURIComponent(keyword)}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        alert("キーワードを削除しました");
        fetchKeywords();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete keyword:", error);
      alert("削除に失敗しました");
    }
  };

  const renderPriorityStars = (priority: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <LuStar
            key={i}
            className={`w-4 h-4 ${
              i <= priority
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
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
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            キーワードマスター
          </h1>
          <p className="mt-2 text-gray-600">狙いたいキーワードを管理</p>
        </div>
        <button
          onClick={() => {
            setEditingKeyword(null);
            setShowModal(true);
          }}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center gap-2 shadow-soft hover:shadow-soft-lg"
        >
          <LuPlus className="w-5 h-5" />
          新規キーワード
        </button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <p className="text-sm text-gray-600">総キーワード数</p>
          <p className="text-3xl font-bold text-gray-900">{keywords.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <p className="text-sm text-gray-600">未使用キーワード</p>
          <p className="text-3xl font-bold text-blue-600">
            {keywords.filter((kw) => kw.assignedArticles.length === 0).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <p className="text-sm text-gray-600">高優先度（★5）</p>
          <p className="text-3xl font-bold text-yellow-600">
            {keywords.filter((kw) => kw.priority === 5).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <p className="text-sm text-gray-600">想定PV合計</p>
          <p className="text-3xl font-bold text-green-600">
            {keywords
              .reduce((sum, kw) => sum + kw.estimatedPv, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <LuFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">フィルター・検索</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事業
            </label>
            <select
              value={filterBusiness}
              onChange={(e) =>
                setFilterBusiness(e.target.value as BusinessType | "")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">すべて</option>
              {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              重要度
            </label>
            <select
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(
                  e.target.value ? parseInt(e.target.value) : "",
                )
              }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
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
        </div>
      </div>

      {/* キーワード一覧 */}
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  キーワード
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  重要度
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  想定PV
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  関連事業
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  タグ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  順位
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  記事数
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ステータス
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery ||
                    filterBusiness ||
                    filterPriority ||
                    filterStatus
                      ? "該当するキーワードが見つかりません"
                      : "キーワードが登録されていません"}
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((kw) => (
                  <tr
                    key={kw.keyword}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {kw.keyword}
                      </div>
                      {kw.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          {kw.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {renderPriorityStars(kw.priority)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {kw.estimatedPv.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {kw.relatedBusiness.map((business) => (
                          <span
                            key={business}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {BUSINESS_LABELS[business]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {kw.relatedTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {kw.relatedTags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{kw.relatedTags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {kw.currentRank ? `${kw.currentRank}位` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {kw.assignedArticles.length}件
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[kw.status]
                        }`}
                      >
                        {STATUS_LABELS[kw.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingKeyword(kw);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(kw.keyword)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* キーワード編集モーダル */}
      {showModal && (
        <KeywordEditModal
          keyword={editingKeyword}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchKeywords();
          }}
        />
      )}
    </div>
  );
}
