"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlogPost, BusinessType } from "@/lib/blog";
import { LuTriangleAlert } from "react-icons/lu";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { BlogImageSection } from "@/components/admin/BlogImageSection";
import { BusinessSelector } from "@/components/admin/BusinessSelector";
import { KeywordSelector } from "@/components/admin/KeywordSelector";
import { TagSelector } from "@/components/admin/TagSelector";
import { Chip } from "@/components/admin/Chip";
import { UnusedKeywordsSuggestion } from "@/components/admin/UnusedKeywordsSuggestion";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "@/lib/toast";

export interface PostFormData {
  title: string;
  slug: string;
  description: string;
  date: string;
  author: string;
  category: string;
  categoryType: "article" | "press-release" | "other";
  relatedBusiness: BusinessType[];
  tags: string[];
  image: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  locale: string;
  published: boolean;
}

interface KeywordConflict {
  keyword: string;
  displayLabel?: string;
  articles: string[];
}

interface IntentGroupConflict {
  message: string;
  keywords?: string[];
  existingArticles?: string[];
  sameIntentKey?: string;
  intentGroupId?: string;
}

interface PostFormProps {
  mode: "new" | "edit";
  initialData: PostFormData;
  initialContent: string;
  /** edit で現在編集中の slug（conflicts から除外する） */
  originalSlug?: string;
  /** 編集時のメタ（AI リライト・BlogImageSection に渡す） */
  post?: BlogPost | null;
  onSubmit: (data: PostFormData, content: string) => Promise<void>;
  submitting: boolean;
  /** 編集時のプレビュー・公開リンク等のヘッダー */
  header?: React.ReactNode;
  /** キャンセルボタンの挙動 */
  onCancel: () => void;
}

export function PostForm({
  mode,
  initialData,
  initialContent,
  originalSlug,
  post,
  onSubmit,
  submitting,
  header,
  onCancel,
}: PostFormProps) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState<PostFormData>(initialData);
  const [content, setContent] = useState(initialContent);
  const [conflicts, setConflicts] = useState<KeywordConflict[]>([]);
  const [intentGroupConflicts, setIntentGroupConflicts] = useState<IntentGroupConflict[]>([]);
  const [selectedKeywordPillar, setSelectedKeywordPillar] = useState<string | null>(null);

  // AI リライト（edit のみ）
  const [improveText, setImproveText] = useState("");
  const [improving, setImproving] = useState(false);

  // initialData / initialContent が変わったら同期
  useEffect(() => setFormData(initialData), [initialData]);
  useEffect(() => setContent(initialContent), [initialContent]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    (primary: string, secondary: string[], relatedBusiness: BusinessType[]) => {
      setFormData((prev) => ({
        ...prev,
        primaryKeyword: primary,
        secondaryKeywords: secondary,
        relatedBusiness: relatedBusiness.length > 0 ? relatedBusiness : prev.relatedBusiness,
      }));
    },
    [],
  );

  const checkKeywordConflicts = useCallback(
    async (primaryKeyword: string, secondaryKeywords: string[]) => {
      const keywords = [primaryKeyword, ...secondaryKeywords].filter(Boolean);
      if (keywords.length === 0) {
        setConflicts([]);
        setIntentGroupConflicts([]);
        return;
      }
      try {
        const response = await adminFetch("/api/admin/keywords/check-conflict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords }),
        });
        if (response.ok) {
          const data = await response.json();
          const raw: KeywordConflict[] = data.conflicts || [];
          const filtered = originalSlug
            ? raw
                .map((c) => ({ ...c, articles: c.articles.filter((s) => s !== originalSlug) }))
                .filter((c) => c.articles.length > 0)
            : raw;
          setConflicts(filtered);
          setIntentGroupConflicts(data.intentGroupConflicts || []);
        }
      } catch (error) {
        console.error("Failed to check conflicts:", error);
      }
    },
    [originalSlug],
  );

  // キーワード変更時に競合チェック（デバウンス付き）
  useEffect(() => {
    if (!formData.primaryKeyword && formData.secondaryKeywords.length === 0) {
      setConflicts([]);
      setIntentGroupConflicts([]);
      return;
    }
    const timer = setTimeout(() => {
      checkKeywordConflicts(formData.primaryKeyword, formData.secondaryKeywords);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.primaryKeyword, formData.secondaryKeywords, checkKeywordConflicts]);

  // クラスター判定: ピラー情報を取得
  useEffect(() => {
    if (!formData.primaryKeyword) {
      setSelectedKeywordPillar(null);
      return;
    }
    adminFetch(`/api/admin/keywords/master/${encodeURIComponent(formData.primaryKeyword)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.pillarSlug && d.data?.keywordTier === "longtail") {
          setSelectedKeywordPillar(d.data.pillarSlug);
        } else {
          setSelectedKeywordPillar(null);
        }
      })
      .catch(() => setSelectedKeywordPillar(null));
  }, [formData.primaryKeyword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.categoryType === "article" && formData.relatedBusiness.length === 0) {
      toast.error("お役立ち情報の場合は、少なくとも1つの関連事業を選択してください");
      return;
    }

    const slugPattern = isEdit ? /^[a-z0-9-]+$/ : /^[a-z0-9-]*$/;
    if (formData.slug && !slugPattern.test(formData.slug)) {
      toast.error("スラッグは英数字とハイフンのみ使用できます");
      return;
    }
    if (isEdit && !formData.slug) {
      toast.error("スラッグを入力してください");
      return;
    }

    await onSubmit(formData, content);
  };

  const handleImproveArticle = async () => {
    const points = improveText
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (points.length === 0) {
      toast.error("改善点を1つ以上入力してください");
      return;
    }
    if (!content.trim()) {
      toast.error("本文が空です。先に本文を入力してください");
      return;
    }
    setImproving(true);
    try {
      const postMeta = post as unknown as {
        clusterAxis?: string;
        articleRole?: string;
        targetReader?: string;
      } | null;
      const response = await adminFetch("/api/admin/claude/improve-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          improvements: points,
          clusterAxis: postMeta?.clusterAxis,
          articleRole: postMeta?.articleRole,
          targetReader: postMeta?.targetReader,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "リライトに失敗しました");
      }
      const data = await response.json();
      setContent(data.content);
      setImproveText("");
      toast.success("記事をリライトしました。内容を確認して保存してください。");
    } catch (err) {
      console.error("Failed to improve article:", err);
      toast.error(err instanceof Error ? err.message : "記事のリライトに失敗しました");
    } finally {
      setImproving(false);
    }
  };

  const slugChanged = isEdit && originalSlug && formData.slug !== originalSlug;

  return (
    <div>
      {header}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 space-y-6">
          {/* メタデータ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FieldLabel htmlFor="title" required>タイトル</FieldLabel>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="date" required>公開日</FieldLabel>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <FieldLabel htmlFor="slug" required={isEdit}>
              スラッグ（URL用）
            </FieldLabel>
            <input
              type="text"
              id="slug"
              name="slug"
              required={isEdit}
              value={formData.slug}
              onChange={handleInputChange}
              placeholder={isEdit ? undefined : "例: baseball-study-tips（空欄の場合はタイトルから自動生成）"}
              pattern={isEdit ? "^[a-z0-9-]+$" : "^[a-z0-9-]*$"}
              className={inputClass}
            />
            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? "英数字とハイフンのみ使用可。変更すると記事のURLが変わります"
                : "英数字とハイフンのみ使用可。空欄の場合は「日付-タイトル」から自動生成されます"}
            </p>
            {slugChanged && (
              <p className="mt-1 text-sm text-amber-600 font-medium">
                ⚠️ スラッグを変更すると、古いURLからアクセスできなくなります
              </p>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="description" required>説明</FieldLabel>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FieldLabel htmlFor="categoryType" required>記事タイプ</FieldLabel>
              <select
                id="categoryType"
                name="categoryType"
                required
                value={formData.categoryType}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="article">お役立ち情報</option>
                <option value="press-release">プレスリリース</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="category" required>カテゴリー</FieldLabel>
              <input
                type="text"
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                placeholder="例: 学習のコツ"
                className={inputClass}
              />
            </div>
          </div>

          {formData.categoryType === "article" && (
            <BusinessSelector
              selectedBusinesses={formData.relatedBusiness}
              onToggle={handleBusinessToggle}
              required
              showError={formData.relatedBusiness.length === 0}
            />
          )}

          <div>
            <FieldLabel htmlFor="tags">タグ</FieldLabel>
            <TagSelector
              selectedTags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            />
          </div>

          {!isEdit && formData.categoryType === "article" && formData.relatedBusiness.length > 0 && (
            <UnusedKeywordsSuggestion
              selectedBusiness={formData.relatedBusiness}
              onSelectKeyword={(keyword, tags) => {
                setFormData((prev) => ({ ...prev, primaryKeyword: keyword, tags }));
              }}
            />
          )}

          {/* SEO */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO設定</h3>
            <KeywordSelector
              onSelect={handleKeywordSelect}
              initialKeyword={formData.primaryKeyword}
            />

            {conflicts.length > 0 && (
              <ConflictBox
                title="キーワード競合"
                tone="yellow"
                items={conflicts.map((c) => (
                  <li key={c.keyword} className="text-sm text-yellow-700">
                    「{c.displayLabel ?? c.keyword}」は
                    {isEdit ? "他の " : " "}
                    {c.articles.length} 件の記事で使用されています
                  </li>
                ))}
              />
            )}

            {intentGroupConflicts.length > 0 && (
              <ConflictBox
                title="同趣旨のキーワードの分散"
                tone="amber"
                items={intentGroupConflicts.map((c, i) => (
                  <li
                    key={c.sameIntentKey ?? c.intentGroupId ?? i}
                    className="text-sm text-amber-700"
                  >
                    {c.message}
                    <span className="block mt-1 text-xs">
                      キーワード: {c.keywords?.join(", ")} | 記事:{" "}
                      {c.existingArticles?.join(", ")}
                    </span>
                  </li>
                ))}
              />
            )}

            {selectedKeywordPillar && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  クラスター記事です。ピラー「{selectedKeywordPillar}」への内部リンクを追加してください。
                </p>
              </div>
            )}
          </div>

          {/* その他 */}
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <FieldLabel htmlFor="author">著者</FieldLabel>
              <select
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={`${inputClass} bg-white`}
              >
                <option value="中村龍人">中村龍人</option>
                <option value="Nectere編集部">Nectere編集部</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="locale">言語</FieldLabel>
              <select
                id="locale"
                name="locale"
                value={formData.locale}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="published" required>公開状態</FieldLabel>
              <select
                id="published"
                name="published"
                required
                value={formData.published ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, published: e.target.value === "true" }))
                }
                className={inputClass}
              >
                <option value="true">公開する</option>
                <option value="false">下書き</option>
              </select>
            </div>
          </div>
        </div>

        {/* 本文 */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">本文</h3>

          {isEdit && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-base font-bold text-gray-900 mb-2">記事をリライト（改善）</h4>
              <p className="text-sm text-gray-600 mb-2">
                改善点を1行ずつ入力し、実行するとAIが本文をリライトします。実行後はエディタの内容が上書きされます。
              </p>
              <textarea
                value={improveText}
                onChange={(e) => setImproveText(e.target.value)}
                placeholder="例:&#10;・導入文をもっと共感的に&#10;・見出しをSEO向けに調整&#10;・まとめを簡潔に"
                rows={4}
                className={`${inputClass} text-sm mb-2`}
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
          )}

          <div className="mb-6">
            <BlogImageSection
              content={content}
              topic={formData.title || post?.slug || ""}
              clusterAxis={(post as unknown as { clusterAxis?: string } | null)?.clusterAxis}
              mode="edit"
              thumbnailValue={formData.image}
              onThumbnailChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              onReplacePlaceholder={(oldText, newMarkdown) =>
                setContent((prev) => prev.replace(oldText, newMarkdown))
              }
              onReplaceAtOffset={(offset, oldText, newMarkdown) =>
                setContent((prev) => {
                  if (prev.substring(offset, offset + oldText.length) === oldText) {
                    return (
                      prev.substring(0, offset) +
                      newMarkdown +
                      prev.substring(offset + oldText.length)
                    );
                  }
                  return prev.replace(oldText, newMarkdown);
                })
              }
            />
          </div>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
          >
            {submitting ? (isEdit ? "保存中..." : "作成中...") : isEdit ? "変更を保存" : "記事を作成"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary";

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2"
    >
      {children}
      <Chip variant={required ? "required" : "optional"}>{required ? "必須" : "任意"}</Chip>
    </label>
  );
}

function ConflictBox({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "yellow" | "amber";
  items: React.ReactNode;
}) {
  const colorClasses =
    tone === "yellow"
      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
      : "bg-amber-50 border-amber-200 text-amber-800";
  return (
    <div className={`mt-4 p-4 border rounded-xl ${colorClasses}`}>
      <h4 className="font-bold mb-2 flex items-center gap-2">
        <LuTriangleAlert className="w-5 h-5" />
        {title}
      </h4>
      <ul className="space-y-1">{items}</ul>
    </div>
  );
}

export const EMPTY_POST_FORM_DATA: PostFormData = {
  title: "",
  slug: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  author: "中村龍人",
  category: "",
  categoryType: "article",
  relatedBusiness: [],
  tags: [],
  image: "",
  primaryKeyword: "",
  secondaryKeywords: [],
  locale: "ja",
  published: true,
};
