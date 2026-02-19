"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlogPostMetadata } from "@/lib/blog";

type PostWithArticleType = BlogPostMetadata & {
  articleType?: "pillar" | "cluster" | null;
  /** 表示用メインキーワード（同趣旨の代表表示） */
  displayLabel?: string;
};
import { LuFilePlus, LuTrash2, LuExternalLink, LuEye } from "react-icons/lu";

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts?includeDrafts=true");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("本当にこの記事を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("記事を削除しました");
        fetchPosts();
      } else {
        alert("記事の削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("記事の削除に失敗しました");
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "published") return post.published !== false;
    if (filter === "draft") return post.published === false;
    return true;
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
          <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
          <p className="mt-2 text-gray-600">全 {posts.length} 件の記事</p>
        </div>
        <Link
          href="/admin/claude"
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center gap-2 shadow-soft hover:shadow-soft-lg"
        >
          <LuFilePlus className="w-5 h-5" />
          新規作成（AI支援）
        </Link>
      </div>

      {/* フィルター */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            filter === "all"
              ? "bg-primary text-white shadow-soft"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          すべて ({posts.length})
        </button>
        <button
          onClick={() => setFilter("published")}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            filter === "published"
              ? "bg-primary text-white shadow-soft"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          公開済み ({posts.filter((p) => p.published !== false).length})
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            filter === "draft"
              ? "bg-primary text-white shadow-soft"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          下書き ({posts.filter((p) => p.published === false).length})
        </button>
      </div>

      {/* 記事リスト（表形式） */}
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden overflow-x-auto">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-600">記事がありません</div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  タイトル・日付
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-[120px]">
                  カテゴリ
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[140px]">
                  タグ
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[180px]">
                  キーワード
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-[120px]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr
                  key={post.slug}
                  onClick={() => router.push(`/admin/posts/${post.slug}`)}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer align-top"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {post.title}
                      </span>
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
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {post.description}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(post.date).toLocaleDateString("ja-JP")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">
                      {post.category || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.length > 0 ? (
                        post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-sm text-gray-700 space-y-1">
                      {post.seo.primaryKeyword ? (
                        <div>
                          <Link
                            href={`/admin/keywords/master/${encodeURIComponent(post.seo.primaryKeyword)}`}
                            className="text-primary hover:underline focus:outline-none"
                          >
                            {post.displayLabel ?? post.seo.primaryKeyword}
                          </Link>
                          {post.displayLabel &&
                            post.displayLabel !== post.seo.primaryKeyword && (
                              <span className="text-gray-500">
                                {" "}
                                ({post.seo.primaryKeyword})
                              </span>
                            )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                      {(post.seo.secondaryKeywords?.length ?? 0) > 0 && (
                        <div className="text-gray-600 text-xs">
                          {post.seo.secondaryKeywords.join("、")}
                        </div>
                      )}
                    </div>
                  </td>
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-1 justify-end">
                      <Link
                        href={`/admin/blog-preview/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="プレビュー"
                      >
                        <LuEye className="w-5 h-5" />
                      </Link>
                      {post.published !== false && (
                        <Link
                          href={`/${post.locale || "ja"}/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="公開ページ"
                        >
                          <LuExternalLink className="w-5 h-5" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <LuTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
