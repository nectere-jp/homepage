'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPostMetadata } from '@/lib/blog';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPostMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts?includeDrafts=true');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('本当にこの記事を削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('記事を削除しました');
        fetchPosts();
      } else {
        alert('記事の削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('記事の削除に失敗しました');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'published') return post.published !== false;
    if (filter === 'draft') return post.published === false;
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
          href="/admin/posts/new"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          ✏️ 新規作成
        </Link>
      </div>

      {/* フィルター */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて ({posts.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'published'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          公開済み ({posts.filter((p) => p.published !== false).length})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'draft'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          下書き ({posts.filter((p) => p.published === false).length})
        </button>
      </div>

      {/* 記事リスト */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            記事がありません
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div
                key={post.slug}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {post.title}
                      </h3>
                      {post.published === false && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          下書き
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{post.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                      <span>•</span>
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.tags.length} タグ</span>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Link
                      href={`/admin/posts/${post.slug}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
