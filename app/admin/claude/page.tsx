"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuSparkles } from "react-icons/lu";
import type { BusinessType, ClusterAxis, ArticleRole, TargetReader } from "@/lib/blog";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "@/lib/toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { DEFAULT_AUTHOR } from "@/lib/authors";
import {
  STORAGE_KEY,
  CLUSTER_AXIS_OPTIONS,
  ARTICLE_ROLE_OPTIONS,
  TARGET_READER_OPTIONS,
  type ArticleStep,
  type Volume,
  type DraftData,
} from "@/components/admin/claude/constants";
import { StepProgress } from "@/components/admin/claude/StepProgress";
import { LoadingOverlay } from "@/components/admin/claude/LoadingOverlay";
import { KeywordsStep } from "@/components/admin/claude/KeywordsStep";
import { DeepDiveStep } from "@/components/admin/claude/DeepDiveStep";
import { OutlineStep } from "@/components/admin/claude/OutlineStep";

export default function ClaudePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmDialog = useConfirm();
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

  // UI状態
  const [isRestored, setIsRestored] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [intentGroupConflicts, setIntentGroupConflicts] = useState<any[]>([]);
  const [cannibalizeRisks, setCannibalizeRisks] = useState<any[]>([]);
  const [selectedRelatedBusiness, setSelectedRelatedBusiness] = useState<BusinessType[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>(DEFAULT_AUTHOR);

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

  const checkKeywordConflicts = useCallback(async (keywords: string[], currentHubSlug?: string) => {
    if (keywords.length === 0) {
      setConflicts([]);
      setIntentGroupConflicts([]);
      setCannibalizeRisks([]);
      return;
    }
    try {
      const response = await adminFetch("/api/admin/keywords/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, hubSlug: currentHubSlug || undefined }),
      });
      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts || []);
        setIntentGroupConflicts(data.intentGroupConflicts || []);
        setCannibalizeRisks(data.cannibalizeRisks || []);
      }
    } catch (error) {
      console.error("Failed to check conflicts:", error);
    }
  }, []);

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

        if (g.clusterAxis) setClusterAxis(g.clusterAxis);
        if (g.articleRole) {
          setArticleRole(g.articleRole);
          if (g.articleRole === "hub") setVolume("heavy");
        }
        if (g.hubArticleSlug) {
          setHubSlug(g.hubArticleSlug);
          const allKw = [primaryKeyword, ...secondaryKeywords.split(",").map((s: string) => s.trim())].filter(Boolean);
          checkKeywordConflicts(allKw, g.hubArticleSlug);
        }
      })
      .catch(() => {
        setMainKeywordRepresentative(primaryKeyword);
        setMainKeywordVariants([]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryKeyword]);

  const handleKeywordSelect = useCallback(
    (primary: string, secondary: string[], relatedBusiness: BusinessType[]) => {
      setPrimaryKeyword(primary);
      setSecondaryKeywords(secondary.join(", "));
      setSelectedRelatedBusiness(relatedBusiness);
      const allKeywords = [primary, ...secondary].filter(Boolean);
      checkKeywordConflicts(allKeywords);
    },
    [checkKeywordConflicts],
  );

  const handleGenerateDeepDive = async () => {
    if (!primaryKeyword) {
      toast.error("主要キーワードを入力してください");
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
        toast.error("深掘り生成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to generate deep dive:", error);
      toast.error("深掘り生成に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGenerateOutline = async () => {
    if (!primaryKeyword) {
      toast.error("主要キーワードを入力してください");
      return;
    }
    const topicStr = mainKeywordRepresentative || primaryKeyword;
    const allKeywords = [topicStr, ...secondaryKeywords.split(",").map((k) => k.trim())].filter(Boolean);
    const coOccurArray = coOccurrenceWords.split(/[,\s\n]+/).map((s) => s.trim()).filter(Boolean);
    const avoidKw = [
      ...new Set([
        ...(intentGroupConflicts as { keywords?: string[] }[])
          .flatMap((c) => c.keywords ?? []),
        ...(cannibalizeRisks as { keyword?: string; risk?: string }[])
          .filter((r) => r.risk === "high" || r.risk === "medium")
          .map((r) => r.keyword ?? ""),
      ].filter(Boolean)),
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
        toast.error("アウトライン生成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      toast.error("アウトライン生成に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleUpdateOutline = async () => {
    if (!revisionRequest.trim()) {
      toast.error("修正点を入力してください");
      return;
    }
    if (!outline || !primaryKeyword) {
      toast.error("アウトラインとキーワードが必要です");
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
          deepDiveText: deepDiveText || undefined,
          userFeedbackOnDeepDive: userFeedbackOnDeepDive || undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setOutline(data.outline);
        setRevisionRequest("");
        toast.success("アウトラインを更新しました");
      } else {
        const errorData = await response.json();
        toast.error(`アウトライン更新に失敗しました: ${errorData.error || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("Failed to update outline:", error);
      toast.error("アウトライン更新に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCreatePost = useCallback(
    async (generatedContent?: string) => {
      const contentToUse = generatedContent || content;
      if (!outline || !contentToUse || !primaryKeyword) return;
      setLoadingMessage("記事を作成中...");
      try {
        const postData = {
          title: (outline.title && outline.title.trim()) || primaryKeyword || "無題",
          ...(outline.slug && outline.slug.trim() && { slug: outline.slug.trim() }),
          description: outline.description?.trim() || outline.introduction?.trim() || "",
          date: new Date().toISOString().split("T")[0],
          author: selectedAuthor,
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
          toast.error("記事の作成に失敗しました");
          setLoading(false);
          setLoadingMessage("");
        }
      } catch (error) {
        console.error("Failed to create post:", error);
        toast.error("記事の作成に失敗しました");
        setLoading(false);
        setLoadingMessage("");
      }
    },
    [
      content, outline, primaryKeyword, secondaryKeywords, selectedAuthor,
      selectedRelatedBusiness, clusterAxis, articleRole, targetReader, router,
    ],
  );

  const handleGenerateContent = async () => {
    if (!primaryKeyword || !outline) return;
    const topicStr = mainKeywordRepresentative || primaryKeyword;
    const allKeywords = [topicStr, ...secondaryKeywords.split(",").map((k) => k.trim())].filter(Boolean);
    const coOccurArray = coOccurrenceWords.split(/[,\s\n]+/).map((s) => s.trim()).filter(Boolean);
    const avoidKw = [
      ...new Set([
        ...(intentGroupConflicts as { keywords?: string[] }[])
          .flatMap((c) => c.keywords ?? []),
        ...(cannibalizeRisks as { keyword?: string; risk?: string }[])
          .filter((r) => r.risk === "high" || r.risk === "medium")
          .map((r) => r.keyword ?? ""),
      ].filter(Boolean)),
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
        toast.error("本文生成に失敗しました");
        setLoading(false);
        setLoadingMessage("");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      toast.error("本文生成に失敗しました");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleReset = async () => {
    const ok = await confirmDialog({
      title: "現在の作業内容を破棄して最初からやり直しますか？この操作は取り消せません。",
      confirmLabel: "削除",
      variant: "danger",
    });
    if (ok) {
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
          toast.success("進捗を復元しました");
        }
      } else {
        toast.error("保存された進捗がありません");
      }
    } catch (error) {
      console.error("Failed to restore progress:", error);
      toast.error("進捗の復元に失敗しました");
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

  const axisLabel = CLUSTER_AXIS_OPTIONS.find((o) => o.value === clusterAxis)?.label ?? clusterAxis;
  const roleLabel = ARTICLE_ROLE_OPTIONS.find((o) => o.value === articleRole)?.label ?? articleRole;
  const readerLabel = TARGET_READER_OPTIONS.find((o) => o.value === targetReader)?.label ?? targetReader;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事作成</h1>
          <p className="mt-2 text-gray-600">キーワードを選択してAIが記事を生成</p>
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

      <StepProgress
        step={step}
        showRestoreButton={hasSavedProgress()}
        onRestore={handleRestoreProgress}
      />

      {step === "keywords" && (
        <KeywordsStep
          primaryKeyword={primaryKeyword}
          secondaryKeywords={secondaryKeywords}
          coOccurrenceWords={coOccurrenceWords}
          onKeywordSelect={handleKeywordSelect}
          onCoOccurrenceChange={setCoOccurrenceWords}
          conflicts={conflicts}
          intentGroupConflicts={intentGroupConflicts}
          cannibalizeRisks={cannibalizeRisks}
          clusterAxis={clusterAxis}
          onClusterAxisChange={setClusterAxis}
          articleRole={articleRole}
          onArticleRoleChange={setArticleRole}
          targetReader={targetReader}
          onTargetReaderChange={setTargetReader}
          volume={volume}
          onVolumeChange={setVolume}
          hubSlug={hubSlug}
          onHubSlugChange={setHubSlug}
          selectedAuthor={selectedAuthor}
          onSelectedAuthorChange={setSelectedAuthor}
          loading={loading}
          onGenerateDeepDive={handleGenerateDeepDive}
        />
      )}

      {step === "deepDive" && (
        <DeepDiveStep
          deepDiveText={deepDiveText}
          userFeedbackOnDeepDive={userFeedbackOnDeepDive}
          onUserFeedbackChange={setUserFeedbackOnDeepDive}
          axisLabel={axisLabel}
          roleLabel={roleLabel}
          readerLabel={readerLabel}
          loading={loading}
          primaryKeyword={primaryKeyword}
          onBack={() => setStep("keywords")}
          onGenerateDeepDive={handleGenerateDeepDive}
          onGenerateOutline={handleGenerateOutline}
        />
      )}

      {step === "outline" && outline && (
        <OutlineStep
          outline={outline}
          mainKeywordRepresentative={mainKeywordRepresentative}
          primaryKeyword={primaryKeyword}
          secondaryKeywords={secondaryKeywords}
          axisLabel={axisLabel}
          roleLabel={roleLabel}
          readerLabel={readerLabel}
          clusterAxis={clusterAxis}
          content={content}
          revisionRequest={revisionRequest}
          onRevisionRequestChange={setRevisionRequest}
          loading={loading}
          onBack={() => {
            setStep("deepDive");
            setRevisionRequest("");
          }}
          onGenerateContent={handleGenerateContent}
          onUpdateOutline={handleUpdateOutline}
        />
      )}

      {loading && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
}
