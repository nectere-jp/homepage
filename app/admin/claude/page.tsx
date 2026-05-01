"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LuSparkles, LuFilePlus, LuTriangleAlert, LuImage, LuCopy, LuCheck } from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";
import { KeywordSelector } from "@/components/admin/KeywordSelector";
import type { BusinessType, ClusterAxis, ArticleRole, TargetReader } from "@/lib/blog";
import type { ImagePrompt } from "@/lib/claude";
import { adminFetch } from '@/lib/admin-fetch';

const STORAGE_KEY = "claude-article-draft";

type ArticleStep = "keywords" | "deepDive" | "outline" | "content";

type Volume = "light" | "standard" | "heavy";

const CLUSTER_AXIS_OPTIONS: { value: ClusterAxis; label: string }[] = [
  { value: "time",         label: "時間軸" },
  { value: "career",       label: "進路軸" },
  { value: "self",         label: "自己認識軸" },
  { value: "relationship", label: "関係性軸" },
  { value: "other",        label: "その他" },
];

const ARTICLE_ROLE_OPTIONS: { value: ArticleRole; label: string; desc: string }[] = [
  { value: "hub",   label: "ハブ記事",  desc: "軸のエントリーポイント（6000-8000字）" },
  { value: "child", label: "子記事",    desc: "特定キーワードに絞った記事（2000-5000字）" },
];

const TARGET_READER_OPTIONS: { value: TargetReader; label: string }[] = [
  { value: "parent",  label: "保護者向け" },
  { value: "student", label: "生徒向け" },
  { value: "both",    label: "両方向け" },
];

const VOLUME_OPTIONS: { value: Volume; label: string }[] = [
  { value: "light",    label: "軽量（2000〜3000字）" },
  { value: "standard", label: "標準（3000〜5000字）" },
  { value: "heavy",    label: "重量（6000〜8000字）" },
];

interface DraftData {
  step: ArticleStep;
  primaryKeyword: string;
  secondaryKeywords: string;
  coOccurrenceWords: string;
  clusterAxis: ClusterAxis;
  articleRole: ArticleRole;
  targetReader: TargetReader;
  volume: Volume;
  hubSlug: string;
  deepDiveText: string;
  userFeedbackOnDeepDive: string;
  outline: any;
  content: string;
}

export default function ClaudePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<ArticleStep>("keywords");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // キーワード
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [coOccurrenceWords, setCoOccurrenceWords] = useState("");
  /** 代表キーワード（API用） */
  const [mainKeywordRepresentative, setMainKeywordRepresentative] = useState("");
  /** 表記揺れ */
  const [mainKeywordVariants, setMainKeywordVariants] = useState<string[]>([]);

  // 記事設定（V5: 4軸クラスター）
  const [clusterAxis, setClusterAxis] = useState<ClusterAxis>("other");
  const [articleRole, setArticleRole] = useState<ArticleRole>("child");
  const [targetReader, setTargetReader] = useState<TargetReader>("both");
  const [volume, setVolume] = useState<Volume>("standard");
  const [hubSlug, setHubSlug] = useState("");

  // コンテンツ
  const [deepDiveText, setDeepDiveText] = useState("");
  const [userFeedbackOnDeepDive, setUserFeedbackOnDeepDive] = useState("");
  const [outline, setOutline] = useState<any>(null);
  const [content, setContent] = useState("");
  const [revisionRequest, setRevisionRequest] = useState("");

  // 画像プロンプト
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [loadingImagePrompts, setLoadingImagePrompts] = useState(false);
  const [copiedImageIndex, setCopiedImageIndex] = useState<number | null>(null);

  // UI状態
  const [isRestored, setIsRestored] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [intentGroupConflicts, setIntentGroupConflicts] = useState<any[]>([]);
  const [selectedRelatedBusiness, setSelectedRelatedBusiness] = useState<BusinessType[]>([]);

  // ページロード時にlocalStorageから復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: DraftData = JSON.parse(saved);
        if (data.outline || data.content || data.primaryKeyword || data.deepDiveText) {
          const stepToRestore =
            data.step && ["keywords", "deepDive", "outline", "content"].includes(data.step)
              ? data.step
              : data.content && data.outline ? "outline"
              : data.outline ? "outline"
              : data.deepDiveText ? "deepDive"
              : "keywords";
          setStep(stepToRestore);
          setPrimaryKeyword(data.primaryKeyword || "");
          setSecondaryKeywords(
            Array.isArray(data.secondaryKeywords)
              ? data.secondaryKeywords.join(", ")
              : data.secondaryKeywords || "",
          );
          setCoOccurrenceWords(data.coOccurrenceWords ?? "");
          setClusterAxis(data.clusterAxis ?? "other");
          setArticleRole(data.articleRole ?? "child");
          setTargetReader(data.targetReader ?? "both");
          setVolume(data.volume ?? "standard");
          setHubSlug(data.hubSlug ?? "");
          setDeepDiveText(data.deepDiveText ?? "");
          setUserFeedbackOnDeepDive(data.userFeedbackOnDeepDive ?? "");
          setOutline(data.outline);
          setContent(data.content);
          setIsRestored(true);
        }
      }
    } catch (error) {
      console.error("Failed to restore draft:", error);
    }
  }, []);

  // URLパラメータからキーワード取得（初回のみ）
  useEffect(() => {
    if (!isRestored) {
      const keyword = searchParams.get("keyword");
      if (keyword) setPrimaryKeyword(keyword);
    }
  }, [searchParams, isRestored]);

  // 状態変更時にlocalStorageへ保存
  useEffect(() => {
    const data: DraftData = {
      step, primaryKeyword, secondaryKeywords, coOccurrenceWords,
      clusterAxis, articleRole, targetReader, volume, hubSlug,
      deepDiveText, userFeedbackOnDeepDive, outline, content,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [
    step, primaryKeyword, secondaryKeywords, coOccurrenceWords,
    clusterAxis, articleRole, targetReader, volume, hubSlug,
    deepDiveText, userFeedbackOnDeepDive, outline, content,
  ]);

  // キーワード選択時にグループ情報を取得してV5フィールドを自動入力
  useEffect(() => {
    if (!primaryKeyword) {
      setMainKeywordRepresentative("");
      setMainKeywordVariants([]);
      return;
    }
    adminFetch(`/api/admin/keywords/master/${encodeURIComponent(primaryKeyword)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.data) {
          setMainKeywordRepresentative(primaryKeyword);
          setMainKeywordVariants([]);
          return;
        }
        const g = d.data;
        const variants = g.variants ?? [];
        const rep = variants[0]?.keyword ?? d.keyword ?? primaryKeyword;
        if (g.relatedBusiness?.length) setSelectedRelatedBusiness(g.relatedBusiness);

        const variantKeywords = variants
          .map((v: { keyword?: string }) => v.keyword)
          .filter(Boolean) as string[];
        setMainKeywordRepresentative(rep);
        setMainKeywordVariants(
          variantKeywords.length > 1
            ? variantKeywords.slice(1)
            : variantKeywords.filter((k: string) => k !== rep),
        );

        // V5フィールドを自動入力（ユーザーが後から変更可）
        if (g.clusterAxis) setClusterAxis(g.clusterAxis);
        if (g.articleRole) {
          setArticleRole(g.articleRole);
          // ハブ記事なら重量をデフォルト
          if (g.articleRole === "hub") setVolume("heavy");
        }
        if (g.hubArticleSlug) setHubSlug(g.hubArticleSlug);
      })
      .catch(() => {
        setMainKeywordRepresentative(primaryKeyword);
        setMainKeywordVariants([]);
      });
  }, [primaryKeyword]);

  const handleKeywordSelect = useCallback(
    (primary: string, secondary: string[], relatedBusiness: BusinessType[]) => {
      setPrimaryKeyword(primary);
      setSecondaryKeywords(secondary.join(", "));
      setSelectedRelatedBusiness(relatedBusiness);
      const allKeywords = [primary, ...secondary].filter(Boolean);
      checkKeywordConflicts(allKeywords);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const checkKeywordConflicts = useCallback(async (keywords: string[]) => {
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
        setConflicts(data.conflicts || []);
        setIntentGroupConflicts(data.intentGroupConflicts || []);
      }
    } catch (error) {
      console.error("Failed to check conflicts:", error);
    }
  }, []);

  const handleGenerateDeepDive = async () => {
    if (!primaryKeyword) {
      alert("主要キーワードを入力してください");
      return;
    }
    const topicStr = mainKeywordRepresentative || primaryKeyword;
    setLoading(true);
    setLoadingMessage("5W1H×マズロー深掘りを生成中...");
    try {
      const coOccurArray = coOccurrenceWords
        .split(/[,\s\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const response = await adminFetch("/api/admin/claude/generate-deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicStr,
          mainKeyword: topicStr,
          mainKeywordVariants: mainKeywordVariants.length ? mainKeywordVariants : undefined,
          coOccurrenceWords: coOccurArray.length ? coOccurArray : undefined,
          clusterAxis,
          targetReader,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setDeepDiveText(data.deepDiveText ?? "");
        setStep("deepDive");
      } else {
        alert("深掘り生成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to generate deep dive:", error);
      alert("深掘り生成に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGenerateOutline = async () => {
    if (!primaryKeyword) {
      alert("主要キーワードを入力してください");
      return;
    }
    const topicStr = mainKeywordRepresentative || primaryKeyword;
    const allKeywords = [topicStr, ...secondaryKeywords.split(",").map((k) => k.trim())].filter(Boolean);
    const coOccurArray = coOccurrenceWords.split(/[,\s\n]+/).map((s) => s.trim()).filter(Boolean);
    const avoidKw = [
      ...new Set(
        (intentGroupConflicts as { keywords?: string[] }[])
          .flatMap((c) => c.keywords ?? [])
          .filter(Boolean),
      ),
    ];
    setLoading(true);
    setLoadingMessage("AIがアウトラインを生成中...");
    try {
      const response = await adminFetch("/api/admin/claude/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicStr,
          keywords: allKeywords,
          clusterAxis,
          articleRole,
          targetReader,
          volume,
          hubSlug: articleRole === "child" && hubSlug.trim() ? hubSlug.trim() : undefined,
          mainKeywordVariants: mainKeywordVariants.length ? mainKeywordVariants : undefined,
          avoidKeywords: avoidKw.length ? avoidKw : undefined,
          coOccurrenceWords: coOccurArray.length ? coOccurArray : undefined,
          deepDiveText: deepDiveText || undefined,
          userFeedbackOnDeepDive: userFeedbackOnDeepDive.trim() || undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setOutline(data.outline);
        setStep("outline");
      } else {
        alert("アウトライン生成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      alert("アウトライン生成に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleUpdateOutline = async () => {
    if (!revisionRequest.trim()) {
      alert("修正点を入力してください");
      return;
    }
    if (!outline || !primaryKeyword) {
      alert("アウトラインとキーワードが必要です");
      return;
    }
    setLoading(true);
    setLoadingMessage("AIがアウトラインを更新中...");
    try {
      const allKeywords = [
        primaryKeyword,
        ...secondaryKeywords.split(",").map((k) => k.trim()),
      ].filter(Boolean);
      const response = await adminFetch("/api/admin/claude/update-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline,
          revisionRequest,
          keywords: allKeywords,
          clusterAxis,
          articleRole,
          targetReader,
          volume,
          hubSlug: articleRole === "child" && hubSlug.trim() ? hubSlug.trim() : undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setOutline(data.outline);
        setRevisionRequest("");
        alert("アウトラインを更新しました");
      } else {
        const errorData = await response.json();
        alert(`アウトライン更新に失敗しました: ${errorData.error || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("Failed to update outline:", error);
      alert("アウトライン更新に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGenerateContent = async () => {
    if (!primaryKeyword || !outline) return;
    const topicStr = mainKeywordRepresentative || primaryKeyword;
    const allKeywords = [topicStr, ...secondaryKeywords.split(",").map((k) => k.trim())].filter(Boolean);
    const coOccurArray = coOccurrenceWords.split(/[,\s\n]+/).map((s) => s.trim()).filter(Boolean);
    const avoidKw = [
      ...new Set(
        (intentGroupConflicts as { keywords?: string[] }[])
          .flatMap((c) => c.keywords ?? [])
          .filter(Boolean),
      ),
    ];
    setLoading(true);
    setLoadingMessage("AIが本文を執筆中...");
    try {
      const response = await adminFetch("/api/admin/claude/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicStr,
          keywords: allKeywords,
          outline,
          clusterAxis,
          articleRole,
          targetReader,
          volume,
          hubSlug: articleRole === "child" && hubSlug.trim() ? hubSlug.trim() : undefined,
          mainKeywordVariants: mainKeywordVariants.length ? mainKeywordVariants : undefined,
          avoidKeywords: avoidKw.length ? avoidKw : undefined,
          coOccurrenceWords: coOccurArray.length ? coOccurArray : undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        await handleCreatePost(data.content);
      } else {
        alert("本文生成に失敗しました");
        setLoading(false);
        setLoadingMessage("");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("本文生成に失敗しました");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCreatePost = async (generatedContent?: string) => {
    const contentToUse = generatedContent || content;
    if (!outline || !contentToUse || !primaryKeyword) return;
    setLoadingMessage("記事を作成中...");
    try {
      const postData = {
        title: (outline.title && outline.title.trim()) || primaryKeyword || "無題",
        ...(outline.slug && outline.slug.trim() && { slug: outline.slug.trim() }),
        description: outline.description?.trim() || outline.introduction?.trim() || "",
        date: new Date().toISOString().split("T")[0],
        author: "Nectere編集部",
        category: "学習のコツ",
        categoryType: "article",
        relatedBusiness: selectedRelatedBusiness,
        tags: [],
        seo: {
          primaryKeyword: primaryKeyword,
          secondaryKeywords: secondaryKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        },
        clusterAxis,
        articleRole,
        targetReader,
        locale: "ja",
        published: false,
        content: contentToUse,
      };
      const response = await adminFetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/admin/posts/${data.slug}`);
      } else {
        alert("記事の作成に失敗しました");
        setLoading(false);
        setLoadingMessage("");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("記事の作成に失敗しました");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleReset = () => {
    if (confirm("現在の作業内容を破棄して最初からやり直しますか？この操作は取り消せません。")) {
      localStorage.removeItem(STORAGE_KEY);
      setStep("keywords");
      setPrimaryKeyword("");
      setSecondaryKeywords("");
      setCoOccurrenceWords("");
      setClusterAxis("other");
      setArticleRole("child");
      setTargetReader("both");
      setVolume("standard");
      setHubSlug("");
      setDeepDiveText("");
      setUserFeedbackOnDeepDive("");
      setOutline(null);
      setContent("");
      setIsRestored(false);
      setImagePrompts([]);
    }
  };

  const handleRestoreProgress = async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: DraftData = JSON.parse(saved);
        setPrimaryKeyword(data.primaryKeyword || "");
        setSecondaryKeywords(
          Array.isArray(data.secondaryKeywords)
            ? data.secondaryKeywords.join(", ")
            : data.secondaryKeywords || "",
        );
        setCoOccurrenceWords(data.coOccurrenceWords ?? "");
        setClusterAxis(data.clusterAxis ?? "other");
        setArticleRole(data.articleRole ?? "child");
        setTargetReader(data.targetReader ?? "both");
        setVolume(data.volume ?? "standard");
        setHubSlug(data.hubSlug ?? "");
        setDeepDiveText(data.deepDiveText ?? "");
        setUserFeedbackOnDeepDive(data.userFeedbackOnDeepDive ?? "");
        setOutline(data.outline);
        setContent(data.content);
        setIsRestored(true);
        const stepToRestore =
          data.step && ["keywords", "deepDive", "outline", "content"].includes(data.step)
            ? data.step
            : data.content && data.outline ? "outline"
            : data.outline ? "outline"
            : data.deepDiveText ? "deepDive"
            : "keywords";
        setStep(stepToRestore);
        if (data.content && data.outline && data.primaryKeyword) {
          await handleCreatePost(data.content);
        } else {
          alert("進捗を復元しました");
        }
      } else {
        alert("保存された進捗がありません");
      }
    } catch (error) {
      console.error("Failed to restore progress:", error);
      alert("進捗の復元に失敗しました");
    }
  };

  const hasSavedProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const data: DraftData = JSON.parse(saved);
      return !!(data.primaryKeyword || data.deepDiveText || data.outline || data.content);
    } catch {
      return false;
    }
  };


  const handleGenerateImagePrompts = async () => {
    if (!primaryKeyword && !outline?.title) return;
    const topic = outline?.title || mainKeywordRepresentative || primaryKeyword;
    const sectionHeadings = outline?.sections?.map((s: { heading: string }) => s.heading) ?? [];
    setLoadingImagePrompts(true);
    try {
      const response = await adminFetch("/api/admin/claude/generate-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, clusterAxis, articleRole, volume, sections: sectionHeadings }),
      });
      if (response.ok) {
        const data = await response.json();
        setImagePrompts(data.prompts ?? []);
      } else {
        alert("画像プロンプトの生成に失敗しました");
      }
    } catch {
      alert("画像プロンプトの生成に失敗しました");
    } finally {
      setLoadingImagePrompts(false);
    }
  };

  const handleCopyImagePrompt = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedImageIndex(index);
      setTimeout(() => setCopiedImageIndex(null), 2000);
    });
  };

  // 記事設定の軸・ロール・ボリュームのラベルを取得
  const axisLabel = CLUSTER_AXIS_OPTIONS.find((o) => o.value === clusterAxis)?.label ?? clusterAxis;
  const roleLabel = ARTICLE_ROLE_OPTIONS.find((o) => o.value === articleRole)?.label ?? articleRole;
  const readerLabel = TARGET_READER_OPTIONS.find((o) => o.value === targetReader)?.label ?? targetReader;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事作成</h1>
          <p className="mt-2 text-gray-600">
            キーワードを選択してAIが記事を生成
          </p>
        </div>
        {(step !== "keywords" || deepDiveText || outline || content) && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            最初からやり直す
          </button>
        )}
      </div>

      {/* 復元通知 */}
      {isRestored && step !== "keywords" && (deepDiveText || outline || content) && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-soft-lg flex items-start gap-3">
          <LuSparkles className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">作業を復元しました</p>
            <p className="text-sm text-gray-700 mt-1">
              前回の続きから作業を続けられます。最初からやり直す場合は「最初からやり直す」ボタンをクリックしてください。
            </p>
          </div>
        </div>
      )}

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center flex-1">
            {["キーワード", "深掘り", "アウトライン", "本文"].map((label, index) => {
              const steps: ArticleStep[] = ["keywords", "deepDive", "outline", "content"];
              const currentIndex = steps.indexOf(step);
              const isActive = index <= currentIndex;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                      isActive ? "bg-primary text-white shadow-soft" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`ml-2 font-medium ${isActive ? "text-primary" : "text-gray-600"}`}>
                    {label}
                  </span>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${index < currentIndex ? "bg-primary" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {hasSavedProgress() && (
            <button
              onClick={handleRestoreProgress}
              className="ml-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <LuSparkles className="w-4 h-4" />
              進捗を復元
            </button>
          )}
        </div>
      </div>

      {/* Step 1: キーワード選択 */}
      {step === "keywords" && (
        <div className="space-y-6">
          {/* キーワード選択カード */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ステップ 1: キーワードを選択
            </h2>
            <div className="space-y-4">
              <KeywordSelector
                onSelect={handleKeywordSelect}
                initialKeyword={primaryKeyword}
              />

              {/* キーワード競合警告 */}
              {conflicts.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <LuTriangleAlert className="w-5 h-5" />
                    キーワード競合
                  </h4>
                  <ul className="space-y-1">
                    {conflicts.map((conflict) => (
                      <li key={conflict.keyword} className="text-sm text-yellow-700">
                        「{(conflict as { displayLabel?: string }).displayLabel ?? conflict.keyword}」は{" "}
                        {conflict.articles.length} 件の記事で使用されています
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 同趣旨キーワード競合警告 */}
              {intentGroupConflicts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <LuTriangleAlert className="w-5 h-5" />
                    同趣旨のキーワードの分散
                  </h4>
                  <ul className="space-y-2">
                    {intentGroupConflicts.map((c, i) => (
                      <li
                        key={(c as { sameIntentKey?: string }).sameIntentKey ?? i}
                        className="text-sm text-amber-700"
                      >
                        {c.message}
                        <span className="block mt-1 text-xs">
                          キーワード: {c.keywords?.join(", ")} | 記事: {c.existingArticles?.join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 共起語 */}
              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  共起語（任意）
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  ラッコキーワード等で得た、読者が一緒に求めやすい語をカンマまたは改行で入力
                </p>
                <textarea
                  value={coOccurrenceWords}
                  onChange={(e) => setCoOccurrenceWords(e.target.value)}
                  placeholder="例: 両立, 時間, スケジュール"
                  className="w-full min-h-[80px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
                />
              </div>
            </div>
          </div>

          {/* 記事設定カード（4軸クラスター） */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">記事設定</h2>
            <p className="text-sm text-gray-500 mb-5">
              キーワード選択時に自動入力されます。必要に応じて変更してください。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* クラスター軸 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  クラスター軸
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLUSTER_AXIS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setClusterAxis(opt.value)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        clusterAxis === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 記事種別 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  記事種別
                </label>
                <div className="flex gap-3">
                  {ARTICLE_ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setArticleRole(opt.value);
                        // ハブ記事に切り替えたら自動で重量に
                        if (opt.value === "hub") setVolume("heavy");
                      }}
                      className={`flex-1 px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        articleRole === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 対象読者 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  対象読者
                </label>
                <div className="flex gap-2">
                  {TARGET_READER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTargetReader(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        targetReader === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文字数ボリューム */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  文字数ボリューム
                </label>
                <div className="flex flex-col gap-2">
                  {VOLUME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setVolume(opt.value)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        volume === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ハブ記事スラッグ（子記事のみ表示） */}
            {articleRole === "child" && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ハブ記事スラッグ（任意）
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  この子記事をリンクさせるハブ記事の slug を入力すると、内部リンクが自動挿入されます
                </p>
                <input
                  type="text"
                  value={hubSlug}
                  onChange={(e) => setHubSlug(e.target.value)}
                  placeholder="例: baseball-study-time-axis-hub"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* 生成ボタン */}
          <button
            onClick={handleGenerateDeepDive}
            disabled={loading || !primaryKeyword}
            className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
          >
            <LuSparkles className="w-5 h-5" />
            {loading ? "AI生成中..." : "深掘りを生成"}
          </button>
        </div>
      )}

      {/* Step 2: 深掘り（5W1H×マズロー） */}
      {step === "deepDive" && (
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ステップ 2: 検索意図・マズロー深掘り
          </h2>
          {/* 記事設定サマリ */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">{axisLabel}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">{roleLabel}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">{readerLabel}</span>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            5W1Hとマズローの欲求五段階に基づく深掘り結果です。必要に応じて補足・修正を追記してからアウトラインを生成してください。
          </p>

          {deepDiveText ? (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">深掘り結果</h3>
                <div className="prose prose-sm max-w-none text-gray-700 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{deepDiveText}</ReactMarkdown>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-base font-bold text-gray-900 mb-2">
                  補足・修正（任意）
                </label>
                <textarea
                  value={userFeedbackOnDeepDive}
                  onChange={(e) => setUserFeedbackOnDeepDive(e.target.value)}
                  placeholder="深掘り結果へのコメントや修正したい点を入力。アウトライン設計に反映されます。"
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep("keywords")}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  戻る
                </button>
                <button
                  onClick={handleGenerateOutline}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
                >
                  <LuSparkles className="w-5 h-5" />
                  {loading ? "AI生成中..." : "アウトラインを生成"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setStep("keywords")}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                戻る
              </button>
              <button
                onClick={handleGenerateDeepDive}
                disabled={loading || !primaryKeyword}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <LuSparkles className="w-5 h-5" />
                {loading ? "生成中..." : "深掘りを生成"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: アウトライン確認 */}
      {step === "outline" && outline && (
        <>
          {/* キーワード＋記事設定バッジ */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(mainKeywordRepresentative || primaryKeyword) && (
              <Chip variant="keyword" size="lg">
                {mainKeywordRepresentative || primaryKeyword}
              </Chip>
            )}
            {secondaryKeywords &&
              secondaryKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
                .map((keyword: string, index: number) => (
                  <Chip key={index} variant="keyword-secondary" size="lg">
                    {keyword}
                  </Chip>
                ))}
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium self-center">{axisLabel}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium self-center">{roleLabel}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium self-center">{readerLabel}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側: アウトライン確認 */}
            <div className="bg-white rounded-2xl shadow-soft-lg p-6 flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                ステップ 3: アウトラインを確認
              </h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">タイトル</h3>
                  <p className="text-lg">{outline.title}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">導入文</h3>
                  <p className="text-gray-700">{outline.introduction}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">セクション構成</h3>
                  <div className="space-y-3">
                    {outline.sections.map((section: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-bold text-gray-900 mb-2">{section.heading}</h4>
                        <ul className="space-y-1 ml-4">
                          {section.subheadings.map((sub: string, subIndex: number) => (
                            <li key={subIndex} className="text-sm text-gray-700">• {sub}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">まとめ</h3>
                  <p className="text-gray-700">{outline.conclusion}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setStep("deepDive");
                    setRevisionRequest("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  戻る
                </button>
                <button
                  onClick={handleGenerateContent}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
                >
                  <LuSparkles className="w-5 h-5" />
                  {loading ? "AI執筆中..." : "本文を生成"}
                </button>
              </div>
            </div>

            {/* 右側: アウトライン修正 */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-soft-lg p-6 h-fit">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <LuSparkles className="w-5 h-5 text-gray-600" />
                アウトラインを修正
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                修正したい点を入力してください。AIがアウトラインを更新します。
              </p>
              <textarea
                value={revisionRequest}
                onChange={(e) => setRevisionRequest(e.target.value)}
                placeholder="例: タイトルをもっと具体的にしてください。セクション3に実例を追加してください。"
                className="w-full min-h-[200px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
              />
              <button
                onClick={handleUpdateOutline}
                disabled={loading || !revisionRequest.trim()}
                className="w-full mt-4 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
              >
                <LuSparkles className="w-5 h-5" />
                {loading ? "更新中..." : "アウトラインを更新"}
              </button>
            </div>
          </div>

          {/* 画像プロンプト（Nanobanana用） */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-soft-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <LuImage className="w-5 h-5 text-gray-600" />
                Nanobanana 画像プロンプト
              </h3>
              <button
                type="button"
                onClick={handleGenerateImagePrompts}
                disabled={loadingImagePrompts}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <LuSparkles className="w-4 h-4" />
                {loadingImagePrompts ? "生成中..." : imagePrompts.length ? "再生成" : "プロンプトを生成"}
              </button>
            </div>
            {imagePrompts.length === 0 && !loadingImagePrompts && (
              <p className="text-sm text-gray-500">
                アウトラインの内容をもとに、各配置箇所のNanobanana用プロンプトを生成します。
              </p>
            )}
            {imagePrompts.length > 0 && (
              <div className="space-y-3">
                {imagePrompts.map((p, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{p.label}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyImagePrompt(p.fullPrompt, i)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {copiedImageIndex === i ? (
                          <><LuCheck className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">コピー済み</span></>
                        ) : (
                          <><LuCopy className="w-3.5 h-3.5" />コピー</>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">{p.fullPrompt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ローディングオーバーレイ */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div
                  className="absolute inset-2 border-4 border-primary/30 border-t-transparent rounded-full animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1s" }}
                ></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {loadingMessage || "処理中..."}
              </h3>
              <p className="text-gray-600 text-center text-sm">
                AIが最高の記事を作成しています。
                <br />
                少々お待ちください...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
