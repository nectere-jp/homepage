"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { BlogImageUpload } from "@/components/admin/BlogImageUpload";
import { ThumbnailImageUpload } from "@/components/admin/ThumbnailImageUpload";
import { BusinessSelector } from "@/components/admin/BusinessSelector";
import { KeywordSelector } from "@/components/admin/KeywordSelector";
import { TagSelector } from "@/components/admin/TagSelector";
import { Chip } from "@/components/admin/Chip";
import { BlogPost, BusinessType } from "@/lib/blog";
import { LuTriangleAlert } from "react-icons/lu";

export default function EditPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [params, setParams] = useState<{ slug: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "", // slug編集用
    description: "",
    date: "",
    author: "",
    category: "",
    categoryType: "article" as "article" | "press-release" | "other",
    relatedBusiness: [] as BusinessType[],
    tags: [] as string[],
    image: "",
    primaryKeyword: "",
    secondaryKeywords: [] as string[],
    locale: "ja",
    published: true,
  });
  const [content, setContent] = useState("");
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [intentGroupConflicts, setIntentGroupConflicts] = useState<any[]>([]);
  const [selectedKeywordPillar, setSelectedKeywordPillar] = useState<
    string | null
  >(null);
  const [improveText, setImproveText] = useState("");
  const [improving, setImproving] = useState(false);

  useEffect(() => {
    props.params.then(setParams);
  }, [props.params]);

  useEffect(() => {
    if (params) {
      fetchPost();
    }
  }, [params]);

  const fetchPost = async () => {
    if (!params) return;
    try {
      const response = await fetch(`/api/admin/posts/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        const post = data.post;
        setPost(post);
        setFormData({
          title: post.title,
          slug: post.slug,
          description: post.description,
          date: post.date,
          author: post.author,
          category: post.category,
          categoryType: post.categoryType || "article",
          relatedBusiness: (post.relatedBusiness || []) as BusinessType[],
          tags: post.tags || [],
          image: post.image || "",
          primaryKeyword: post.seo.primaryKeyword,
          secondaryKeywords: post.seo.secondaryKeywords || [],
          locale: post.locale,
          published: post.published !== false,
        });
        setContent(post.content);
      } else {
        alert("記事が見つかりません");
        router.push("/admin/posts");
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
      alert("記事の読み込みに失敗しました");
      router.push("/admin/posts");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBusinessToggle = (business: BusinessType) => {
    setFormData((prev) => ({
      ...prev,
      relatedBusiness: prev.relatedBusiness.includes(business)
        ? prev.relatedBusiness.filter((b) => b !== business)
        : [...prev.relatedBusiness, business],
    }));
  };

  const handleKeywordSelect = useCallback(
    (primary: string, secondary: string[]) => {
      setFormData((prev) => ({
        ...prev,
        primaryKeyword: primary,
        secondaryKeywords: secondary,
      }));
    },
    [],
  );

  const checkKeywordConflicts = useCallback(
    async (primaryKeyword: string, secondaryKeywords: string[]) => {
      if (!params) return;
      const keywords = [primaryKeyword, ...secondaryKeywords].filter(Boolean);

      if (keywords.length === 0) {
        setConflicts([]);
        setIntentGroupConflicts([]);
        return;
      }

      try {
        const response = await fetch("/api/admin/keywords/check-conflict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords }),
        });

        if (response.ok) {
          const data = await response.json();
          // 現在の記事を除外
          const filteredConflicts = (data.conflicts || [])
            .map((conflict: any) => ({
              ...conflict,
              articles: conflict.articles.filter(
                (slug: string) => slug !== params.slug,
              ),
            }))
            .filter((conflict: any) => conflict.articles.length > 0);
          setConflicts(filteredConflicts);
          setIntentGroupConflicts(data.intentGroupConflicts || []);
        }
      } catch (error) {
        console.error("Failed to check conflicts:", error);
      }
    },
    [params],
  );

  // キーワード変更時に競合チェック（デバウンス付き）
  useEffect(() => {
    if (!formData.primaryKeyword && formData.secondaryKeywords.length === 0) {
      setConflicts([]);
      setIntentGroupConflicts([]);
      return;
    }

    const timer = setTimeout(() => {
      checkKeywordConflicts(
        formData.primaryKeyword,
        formData.secondaryKeywords,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.primaryKeyword,
    formData.secondaryKeywords,
    checkKeywordConflicts,
  ]);

  // 選択キーワードがクラスターの場合、ピラー情報を取得
  useEffect(() => {
    if (!formData.primaryKeyword) {
      setSelectedKeywordPillar(null);
      return;
    }
    fetch(
      `/api/admin/keywords/master/${encodeURIComponent(formData.primaryKeyword)}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (
          d.success &&
          d.data?.pillarSlug &&
          d.data?.keywordTier === "longtail"
        ) {
          setSelectedKeywordPillar(d.data.pillarSlug);
        } else {
          setSelectedKeywordPillar(null);
        }
      })
      .catch(() => setSelectedKeywordPillar(null));
  }, [formData.primaryKeyword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!params) return;

    // お役立ち情報の場合は事業選択必須
    if (
      formData.categoryType === "article" &&
      formData.relatedBusiness.length === 0
    ) {
      alert("お役立ち情報の場合は、少なくとも1つの関連事業を選択してください");
      return;
    }

    // slugのバリデーション
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      alert("スラッグは英数字とハイフンのみ使用できます");
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title: formData.title,
        newSlug: formData.slug !== params.slug ? formData.slug : undefined, // slugが変更された場合のみ
        description: formData.description,
        date: formData.date,
        author: formData.author,
        category: formData.category,
        categoryType: formData.categoryType,
        relatedBusiness:
          formData.categoryType === "article"
            ? formData.relatedBusiness
            : undefined,
        tags: formData.tags.filter(Boolean),
        image: formData.image,
        seo: {
          primaryKeyword: formData.primaryKeyword,
          secondaryKeywords: formData.secondaryKeywords.filter(Boolean),
        },
        locale: formData.locale,
        published: formData.published,
        content,
      };

      const response = await fetch(`/api/admin/posts/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("記事を更新しました");
        // 記事一覧ページに遷移
        router.push("/admin/posts");
      } else {
        alert("記事の更新に失敗しました");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("記事の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleImproveArticle = async () => {
    const points = improveText
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (points.length === 0) {
      alert("改善点を1つ以上入力してください");
      return;
    }
    if (!content.trim()) {
      alert("本文が空です。先に本文を入力してください");
      return;
    }
    setImproving(true);
    try {
      const response = await fetch("/api/admin/claude/improve-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, improvements: points }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "リライトに失敗しました");
      }
      const data = await response.json();
      setContent(data.content);
      setImproveText("");
      alert("記事をリライトしました。内容を確認して保存してください。");
    } catch (err) {
      console.error("Failed to improve article:", err);
      alert(
        err instanceof Error ? err.message : "記事のリライトに失敗しました",
      );
    } finally {
      setImproving(false);
    }
  };

  if (loading || !params) {
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

  const articlePath = `/${formData.locale}/blog/${formData.slug || params.slug}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">記事を編集</h1>
        <p className="mt-2 text-gray-600">現在のスラッグ: {params.slug}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <Link
            href={`/admin/blog-preview/${params.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            プレビューを開く（下書き含む）
          </Link>
          {formData.published && (
            <Link
              href={articlePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              実際の記事を開く
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 space-y-6">
          {/* メタデータ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                タイトル
                <Chip variant="required">必須</Chip>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                公開日
                <Chip variant="required">必須</Chip>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Slug編集 */}
          <div>
            <label
              htmlFor="slug"
              className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
            >
              スラッグ（URL用）
              <Chip variant="required">必須</Chip>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              value={formData.slug}
              onChange={handleInputChange}
              pattern="^[a-z0-9-]+$"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-sm text-gray-500">
              英数字とハイフンのみ使用可。変更すると記事のURLが変わります
            </p>
            {formData.slug !== params.slug && (
              <p className="mt-1 text-sm text-amber-600 font-medium">
                ⚠️ スラッグを変更すると、古いURLからアクセスできなくなります
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
            >
              説明
              <Chip variant="required">必須</Chip>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <ThumbnailImageUpload
              value={formData.image}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, image: url }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="categoryType"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                記事タイプ
                <Chip variant="required">必須</Chip>
              </label>
              <select
                id="categoryType"
                name="categoryType"
                required
                value={formData.categoryType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="article">お役立ち情報</option>
                <option value="press-release">プレスリリース</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                カテゴリー
                <Chip variant="required">必須</Chip>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                placeholder="例: 学習のコツ"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* 事業との紐付け（お役立ち情報の場合のみ） */}
          {formData.categoryType === "article" && (
            <BusinessSelector
              selectedBusinesses={formData.relatedBusiness}
              onToggle={handleBusinessToggle}
              required={true}
              showError={formData.relatedBusiness.length === 0}
            />
          )}

          <div>
            <label
              htmlFor="tags"
              className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
            >
              タグ
              <Chip variant="optional">任意</Chip>
            </label>
            <TagSelector
              selectedTags={formData.tags}
              onChange={(tags) => {
                setFormData((prev) => ({ ...prev, tags }));
              }}
            />
          </div>

          {/* SEOキーワード */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO設定</h3>
            <KeywordSelector
              onSelect={handleKeywordSelect}
              initialKeyword={formData.primaryKeyword}
            />

            {/* キーワード競合警告 */}
            {conflicts.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <LuTriangleAlert className="w-5 h-5" />
                  キーワード競合
                </h4>
                <ul className="space-y-1">
                  {conflicts.map((conflict) => (
                    <li
                      key={conflict.keyword}
                      className="text-sm text-yellow-700"
                    >
                      「
                      {(conflict as { displayLabel?: string }).displayLabel ??
                        conflict.keyword}
                      」は他の {conflict.articles.length}{" "}
                      件の記事で使用されています
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 同趣旨キーワード競合警告 */}
            {intentGroupConflicts.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <LuTriangleAlert className="w-5 h-5" />
                  同趣旨のキーワードの分散
                </h4>
                <ul className="space-y-2">
                  {intentGroupConflicts.map((c, i) => (
                    <li
                      key={
                        (
                          c as {
                            sameIntentKey?: string;
                            intentGroupId?: string;
                          }
                        ).sameIntentKey ??
                        (c as { intentGroupId?: string }).intentGroupId ??
                        i
                      }
                      className="text-sm text-amber-700"
                    >
                      {c.message}
                      <span className="block mt-1 text-xs">
                        キーワード: {c.keywords?.join(", ")} | 記事:{" "}
                        {c.existingArticles?.join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* クラスター記事のピラー提案 */}
            {selectedKeywordPillar && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  クラスター記事です。ピラー「{selectedKeywordPillar}
                  」への内部リンクを追加してください。
                </p>
              </div>
            )}
          </div>

          {/* その他設定 */}
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="author"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                著者
                <Chip variant="optional">任意</Chip>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="locale"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                言語
                <Chip variant="optional">任意</Chip>
              </label>
              <select
                id="locale"
                name="locale"
                value={formData.locale}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="published"
                className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                公開状態
                <Chip variant="required">必須</Chip>
              </label>
              <select
                id="published"
                name="published"
                required
                value={formData.published ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    published: e.target.value === "true",
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="true">公開する</option>
                <option value="false">下書き</option>
              </select>
            </div>
          </div>
        </div>

        {/* マークダウンエディター */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">本文</h3>

          {/* 記事をリライト（改善） */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-base font-bold text-gray-900 mb-2">
              記事をリライト（改善）
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              改善点を1行ずつ入力し、実行するとAIが本文をリライトします。実行後はエディタの内容が上書きされます。
            </p>
            <textarea
              value={improveText}
              onChange={(e) => setImproveText(e.target.value)}
              placeholder="例:&#10;・導入文をもっと共感的に&#10;・見出しをSEO向けに調整&#10;・まとめを簡潔に"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm mb-2"
            />
            <button
              type="button"
              onClick={handleImproveArticle}
              disabled={improving || !content.trim()}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {improving ? "リライト中..." : "リライトを実行"}
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              本文からプレースホルダーをコピーして欄に貼り付け、画像を選択すると本文内で置き換わります。
            </p>
            <BlogImageUpload
              onReplacePlaceholder={(placeholderText, newMarkdown) =>
                setContent((prev) => prev.replace(placeholderText, newMarkdown))
              }
            />
          </div>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
          >
            {saving ? "保存中..." : "変更を保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
