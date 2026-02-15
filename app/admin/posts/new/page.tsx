"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { BlogImageUpload } from "@/components/admin/BlogImageUpload";
import { ThumbnailImageUpload } from "@/components/admin/ThumbnailImageUpload";
import { UnusedKeywordsSuggestion } from "@/components/admin/UnusedKeywordsSuggestion";
import { BusinessSelector } from "@/components/admin/BusinessSelector";
import { KeywordSelector } from "@/components/admin/KeywordSelector";
import { TagSelector } from "@/components/admin/TagSelector";
import { Chip } from "@/components/admin/Chip";
import { LuTriangleAlert } from "react-icons/lu";
import type { BusinessType } from "@/lib/blog";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "", // 手動でslugを指定可能
    description: "",
    date: new Date().toISOString().split("T")[0],
    author: "Nectere編集部",
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
  const [selectedKeywordPillar, setSelectedKeywordPillar] = useState<string | null>(null);

  // Claudeで生成されたデータを読み込む
  useEffect(() => {
    const claudeData = localStorage.getItem("claude_generated_post");
    if (claudeData) {
      try {
        const data = JSON.parse(claudeData);
        setFormData((prev) => ({
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          category: data.category || prev.category,
          primaryKeyword: data.primaryKeyword || prev.primaryKeyword,
          secondaryKeywords: Array.isArray(data.secondaryKeywords)
            ? data.secondaryKeywords
            : data.secondaryKeywords
              ? data.secondaryKeywords.split(",").map((k: string) => k.trim())
              : prev.secondaryKeywords,
          tags: Array.isArray(data.tags)
            ? data.tags
            : data.tags
              ? data.tags
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : prev.tags,
        }));
        setContent(data.content || "");
        localStorage.removeItem("claude_generated_post");
      } catch (error) {
        console.error("Failed to load Claude data:", error);
      }
    }
  }, []);

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

  const handleKeywordSelect = (primary: string, secondary: string[]) => {
    setFormData((prev) => ({
      ...prev,
      primaryKeyword: primary,
      secondaryKeywords: secondary,
    }));
  };

  const checkKeywordConflicts = useCallback(
    async (primaryKeyword: string, secondaryKeywords: string[]) => {
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
          setConflicts(data.conflicts || []);
          setIntentGroupConflicts(data.intentGroupConflicts || []);
        }
      } catch (error) {
        console.error("Failed to check conflicts:", error);
      }
    },
    [],
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

    // お役立ち情報の場合は事業選択必須
    if (
      formData.categoryType === "article" &&
      formData.relatedBusiness.length === 0
    ) {
      alert("お役立ち情報の場合は、少なくとも1つの関連事業を選択してください");
      return;
    }

    setLoading(true);

    // slugのバリデーション
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      alert("スラッグは英数字とハイフンのみ使用できます");
      return;
    }

    try {
      const postData = {
        ...formData,
        slug: formData.slug || undefined, // 空の場合はundefinedにして自動生成させる
        tags: formData.tags.filter(Boolean),
        relatedBusiness:
          formData.categoryType === "article"
            ? formData.relatedBusiness
            : undefined,
        seo: {
          primaryKeyword: formData.primaryKeyword,
          secondaryKeywords: formData.secondaryKeywords.filter(Boolean),
        },
        content,
      };

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("記事を作成しました");
        router.push("/admin/posts");
      } else {
        alert("記事の作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("記事の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">新規記事作成</h1>
        <p className="mt-2 text-gray-600">マークダウンで記事を執筆</p>
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

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
            >
              スラッグ（URL用）
              <Chip variant="optional">任意</Chip>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="例: baseball-study-tips（空欄の場合はタイトルから自動生成）"
              pattern="^[a-z0-9-]*$"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-sm text-gray-500">
              英数字とハイフンのみ使用可。空欄の場合は「日付-タイトル」から自動生成されます
            </p>
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

          {/* 未使用キーワード提案 */}
          {formData.categoryType === "article" &&
            formData.relatedBusiness.length > 0 && (
              <UnusedKeywordsSuggestion
                selectedBusiness={formData.relatedBusiness}
                onSelectKeyword={(keyword, tags) => {
                  setFormData((prev) => ({
                    ...prev,
                    primaryKeyword: keyword,
                    tags: tags,
                  }));
                }}
              />
            )}

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
                      「{conflict.keyword}」は {conflict.articles.length}{" "}
                      件の記事で使用されています
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 意図グループ競合警告 */}
            {intentGroupConflicts.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <LuTriangleAlert className="w-5 h-5" />
                  意図グループの分散
                </h4>
                <ul className="space-y-2">
                  {intentGroupConflicts.map((c) => (
                    <li key={c.intentGroupId} className="text-sm text-amber-700">
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
                  クラスター記事です。ピラー「{selectedKeywordPillar}」への内部リンクを追加してください。
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
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
          >
            {loading ? "作成中..." : "記事を作成"}
          </button>
        </div>
      </form>
    </div>
  );
}
