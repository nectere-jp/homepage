"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { UnusedKeywordsSuggestion } from "@/components/admin/UnusedKeywordsSuggestion";
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
    relatedBusiness: [] as string[],
    tags: "",
    image: "",
    primaryKeyword: "",
    secondaryKeywords: "",
    locale: "ja",
    published: true,
  });
  const [content, setContent] = useState("");
  const [conflicts, setConflicts] = useState<any[]>([]);

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
          secondaryKeywords: data.secondaryKeywords || prev.secondaryKeywords,
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
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBusinessToggle = (business: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedBusiness: prev.relatedBusiness.includes(business)
        ? prev.relatedBusiness.filter((b) => b !== business)
        : [...prev.relatedBusiness, business],
    }));
  };

  const checkKeywordConflicts = async () => {
    const keywords = [
      formData.primaryKeyword,
      ...formData.secondaryKeywords.split(",").map((k) => k.trim()),
    ].filter(Boolean);

    try {
      const response = await fetch("/api/admin/keywords/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });

      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts);
      }
    } catch (error) {
      console.error("Failed to check conflicts:", error);
    }
  };

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
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        relatedBusiness:
          formData.categoryType === "article"
            ? formData.relatedBusiness
            : undefined,
        seo: {
          primaryKeyword: formData.primaryKeyword,
          secondaryKeywords: formData.secondaryKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
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
        router.push(`/admin/posts/${data.slug}`);
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                タイトル *
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                公開日 *
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              スラッグ（URL用）
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              説明 *
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="categoryType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                記事タイプ *
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                カテゴリー *
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                関連事業 * （お役立ち情報の場合は必須）
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.relatedBusiness.includes("translation")}
                    onChange={() => handleBusinessToggle("translation")}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">翻訳</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.relatedBusiness.includes("web-design")}
                    onChange={() => handleBusinessToggle("web-design")}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Web制作</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.relatedBusiness.includes("print")}
                    onChange={() => handleBusinessToggle("print")}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">印刷物制作</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.relatedBusiness.includes("nobilva")}
                    onChange={() => handleBusinessToggle("nobilva")}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Nobilva（成績管理）
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.relatedBusiness.includes("teachit")}
                    onChange={() => handleBusinessToggle("teachit")}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Teachit（AIに教えるアプリ）
                  </span>
                </label>
              </div>
              {formData.relatedBusiness.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  ※ お役立ち情報の場合は、少なくとも1つの事業を選択してください
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="例: 野球, 勉強両立, 時間管理"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* 未使用キーワード提案 */}
          {formData.categoryType === "article" &&
            formData.relatedBusiness.length > 0 && (
              <UnusedKeywordsSuggestion
                selectedBusiness={formData.relatedBusiness as BusinessType[]}
                onSelectKeyword={(keyword, tags) => {
                  setFormData((prev) => ({
                    ...prev,
                    primaryKeyword: keyword,
                    tags: tags.join(", "),
                  }));
                }}
              />
            )}

          {/* SEOキーワード */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO設定</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="primaryKeyword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                  placeholder="例: 野球 勉強 両立"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="secondaryKeywords"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  関連キーワード（カンマ区切り）
                </label>
                <input
                  type="text"
                  id="secondaryKeywords"
                  name="secondaryKeywords"
                  value={formData.secondaryKeywords}
                  onChange={handleInputChange}
                  onBlur={checkKeywordConflicts}
                  placeholder="例: スポーツ 成績, 部活 勉強"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* キーワード競合警告 */}
              {conflicts.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
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
            </div>
          </div>

          {/* その他設定 */}
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                著者
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                言語
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

            <div className="flex items-center">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    published: !prev.published,
                  }))
                }
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  formData.published
                    ? "bg-primary text-white shadow-soft"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {formData.published ? "公開する" : "下書き"}
              </button>
            </div>
          </div>
        </div>

        {/* マークダウンエディター */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">本文</h3>
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
