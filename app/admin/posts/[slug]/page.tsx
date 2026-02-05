'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { BlogPost } from '@/lib/blog';

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    author: '',
    category: '',
    tags: '',
    image: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    locale: 'ja',
    published: true,
  });
  const [content, setContent] = useState('');
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/posts/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        const post = data.post;
        setPost(post);
        setFormData({
          title: post.title,
          description: post.description,
          date: post.date,
          author: post.author,
          category: post.category,
          tags: post.tags.join(', '),
          image: post.image || '',
          primaryKeyword: post.seo.primaryKeyword,
          secondaryKeywords: post.seo.secondaryKeywords.join(', '),
          locale: post.locale,
          published: post.published !== false,
        });
        setContent(post.content);
      } else {
        alert('記事が見つかりません');
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('記事の読み込みに失敗しました');
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const checkKeywordConflicts = async () => {
    const keywords = [
      formData.primaryKeyword,
      ...formData.secondaryKeywords.split(',').map((k) => k.trim()),
    ].filter(Boolean);

    try {
      const response = await fetch('/api/admin/keywords/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });

      if (response.ok) {
        const data = await response.json();
        // 現在の記事を除外
        const filteredConflicts = data.conflicts.map((conflict: any) => ({
          ...conflict,
          articles: conflict.articles.filter((slug: string) => slug !== params.slug),
        })).filter((conflict: any) => conflict.articles.length > 0);
        setConflicts(filteredConflicts);
      }
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const postData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        author: formData.author,
        category: formData.category,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        image: formData.image,
        seo: {
          primaryKeyword: formData.primaryKeyword,
          secondaryKeywords: formData.secondaryKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
        locale: formData.locale,
        published: formData.published,
        content,
      };

      const response = await fetch(`/api/admin/posts/${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert('記事を更新しました');
        fetchPost();
      } else {
        alert('記事の更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('記事の更新に失敗しました');
    } finally {
      setSaving(false);
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

  if (!post) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">記事を編集</h1>
        <p className="mt-2 text-gray-600">スラッグ: {params.slug}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* メタデータ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                公開日 *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              説明 *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* SEOキーワード */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO設定</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="primaryKeyword" className="block text-sm font-medium text-gray-700 mb-2">
                  主要キーワード *
                </label>
                <input
                  type="text"
                  id="primaryKeyword"
                  name="primaryKeyword"
                  required
                  value={formData.primaryKeyword}
                  onChange={handleInputChange}
                  onBlur={checkKeywordConflicts}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="secondaryKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                  関連キーワード（カンマ区切り）
                </label>
                <input
                  type="text"
                  id="secondaryKeywords"
                  name="secondaryKeywords"
                  value={formData.secondaryKeywords}
                  onChange={handleInputChange}
                  onBlur={checkKeywordConflicts}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* キーワード競合警告 */}
              {conflicts.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ キーワード競合</h4>
                  <ul className="space-y-1">
                    {conflicts.map((conflict) => (
                      <li key={conflict.keyword} className="text-sm text-yellow-700">
                        「{conflict.keyword}」は他の {conflict.articles.length} 件の記事で使用されています
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* その他設定 */}
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                著者
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-2">
                言語
              </label>
              <select
                id="locale"
                name="locale"
                value={formData.locale}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
                公開する
              </label>
            </div>
          </div>
        </div>

        {/* マークダウンエディター */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">本文</h3>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
