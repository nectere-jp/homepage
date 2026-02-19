"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft,
  LuStar,
  LuTrendingUp,
  LuPencil,
  LuCalendar,
  LuFileText,
  LuTarget,
  LuEye,
  LuExternalLink,
} from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";
import type { BlogPostMetadata } from "@/lib/blog";
import { KeywordEditModal } from "@/components/admin/KeywordEditModal";

interface TargetKeyword {
  keyword: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedPv: number;
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  currentRank: number | null;
  rankHistory: Array<{
    date: string;
    rank: number;
    source: "manual" | "api";
  }>;
  status: "active" | "paused" | "achieved";
  assignedArticles: string[];
  /** 関連記事のメタデータ（API が返す場合） */
  assignedArticlesDetail?: BlogPostMetadata[];
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

export default function KeywordDetailPage(props: {
  params: Promise<{ keyword: string }>;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState<string>("");

  const [data, setData] = useState<TargetKeyword | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRank, setNewRank] = useState("");
  const [addingRank, setAddingRank] = useState(false);

  useEffect(() => {
    props.params.then((p) => setKeyword(decodeURIComponent(p.keyword)));
  }, [props.params]);

  useEffect(() => {
    if (keyword) {
      fetchKeywordData();
    }
  }, [keyword]);

  const fetchKeywordData = async () => {
    if (!keyword) return;
    try {
      const response = await fetch(
        `/api/admin/keywords/master/${encodeURIComponent(keyword)}`,
      );
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        alert("キーワードが見つかりません");
        router.push("/admin/keywords/master");
      }
    } catch (error) {
      console.error("Failed to fetch keyword:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRank || !data || !keyword) return;

    setAddingRank(true);
    try {
      const response = await fetch(
        `/api/admin/keywords/master/${encodeURIComponent(keyword)}/rank`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rank: parseInt(newRank), source: "manual" }),
        },
      );

      if (response.ok) {
        alert("順位を記録しました");
        setNewRank("");
        fetchKeywordData();
      } else {
        alert("順位の記録に失敗しました");
      }
    } catch (error) {
      console.error("Failed to add rank:", error);
      alert("順位の記録に失敗しました");
    } finally {
      setAddingRank(false);
    }
  };

  const renderPriorityStars = (priority: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <LuStar
            key={i}
            className={`w-5 h-5 ${
              i <= priority
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading || !keyword) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin/keywords/master")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <LuArrowLeft className="w-5 h-5" />
          キーワードマスターに戻る
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{keyword}</h1>
            <div className="flex items-center gap-4">
              {renderPriorityStars(data.priority)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  STATUS_COLORS[data.status]
                }`}
              >
                {STATUS_LABELS[data.status]}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center gap-2 shadow-soft"
          >
            <LuPencil className="w-5 h-5" />
            編集
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <LuTrendingUp className="w-5 h-5" />
            <p className="text-sm">想定PV</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.estimatedPv != null
              ? Number(data.estimatedPv).toLocaleString()
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-1">月間</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <LuTarget className="w-5 h-5" />
            <p className="text-sm">現在の順位</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.currentRank ? `${data.currentRank}位` : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Google検索</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <LuFileText className="w-5 h-5" />
            <p className="text-sm">割り当て記事</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.assignedArticles?.length ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">件</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <LuCalendar className="w-5 h-5" />
            <p className="text-sm">順位記録</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.rankHistory?.length ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">回</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左カラム */}
        <div className="lg:col-span-2 space-y-8">
          {/* 順位履歴 */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">順位履歴</h2>
            {(data.rankHistory?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだ順位が記録されていません
              </p>
            ) : (
              <div className="space-y-3">
                {(data.rankHistory ?? [])
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.rank}位
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.source === "api"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {entry.source === "api" ? "自動" : "手動"}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* 順位追加フォーム */}
            <form onSubmit={handleAddRank} className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-gray-900 mb-3">順位を記録</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={newRank}
                  onChange={(e) => setNewRank(e.target.value)}
                  placeholder="順位を入力"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newRank || addingRank}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingRank ? "記録中..." : "記録"}
                </button>
              </div>
            </form>
          </div>

          {/* 関連記事 */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">関連記事</h2>
            {(data.assignedArticles?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-center py-8">
                このキーワードを使用している記事はまだありません
              </p>
            ) : (
              <div className="space-y-4">
                {(data.assignedArticlesDetail?.length
                  ? data.assignedArticlesDetail
                  : (data.assignedArticles ?? []).map((slug) => ({
                      slug,
                      title: slug,
                      description: "",
                      tags: [] as string[],
                      date: "",
                      published: true,
                      locale: "ja" as const,
                    }))
                ).map((post) => (
                  <div
                    key={post.slug}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => router.push(`/admin/posts/${post.slug}`)}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {post.title}
                          </span>
                          {post.published === false && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              下書き
                            </span>
                          )}
                        </div>
                        {post.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        {post.date && (
                          <span className="text-xs text-gray-500 mt-1 block">
                            {new Date(post.date).toLocaleDateString("ja-JP")}
                          </span>
                        )}
                        {"tags" in post && post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        className="flex gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/admin/posts/${post.slug}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          title="編集"
                        >
                          <LuPencil className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/blog-preview/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          title="プレビュー"
                        >
                          <LuEye className="w-5 h-5" />
                        </Link>
                        {post.published !== false && (
                          <Link
                            href={`/${post.locale || "ja"}/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                            title="公開ページ"
                          >
                            <LuExternalLink className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">関連事業</p>
                <div className="flex flex-wrap gap-2">
                  {data.relatedBusiness.map((business) => (
                    <span
                      key={business}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {BUSINESS_LABELS[business]}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">関連タグ</p>
                <div className="flex flex-wrap gap-2">
                  {data.relatedTags.length > 0 ? (
                    data.relatedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">タグなし</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">作成日</p>
                <p className="text-gray-900">
                  {new Date(data.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">最終更新</p>
                <p className="text-gray-900">
                  {new Date(data.updatedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 編集モーダル */}
      {showEditModal && (
        <KeywordEditModal
          keyword={data}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchKeywordData();
          }}
        />
      )}
    </div>
  );
}
