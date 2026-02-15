"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuSparkles, LuFilePlus, LuTriangleAlert } from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";
import { KeywordSelector } from "@/components/admin/KeywordSelector";
const STORAGE_KEY = "claude-article-draft";

interface DraftData {
  step: "keywords" | "outline" | "content";
  primaryKeyword: string;
  secondaryKeywords: string;
  outline: any;
  content: string;
}

export default function ClaudePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"keywords" | "outline" | "content">(
    "keywords",
  );
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [outline, setOutline] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isRestored, setIsRestored] = useState(false);
  const [revisionRequest, setRevisionRequest] = useState("");
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [intentGroupConflicts, setIntentGroupConflicts] = useState<any[]>([]);
  const [selectedKeywordPillar, setSelectedKeywordPillar] = useState<string | null>(null);

  // ページロード時にlocalStorageから状態を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: DraftData = JSON.parse(saved);
        // 実際に復元するデータがある場合のみ復元
        if (data.outline || data.content || data.primaryKeyword) {
          // 本文がある場合はアウトラインステップに戻す（Step3のUIは削除されているため）
          if (data.content && data.outline) {
            setStep("outline");
          } else {
            setStep(data.step);
          }
          setPrimaryKeyword(data.primaryKeyword || "");
          // 古いデータ（配列形式）にも対応
          setSecondaryKeywords(
            Array.isArray(data.secondaryKeywords)
              ? data.secondaryKeywords.join(", ")
              : data.secondaryKeywords || "",
          );
          setOutline(data.outline);
          setContent(data.content);
          setIsRestored(true);
        }
      }
    } catch (error) {
      console.error("Failed to restore draft:", error);
    }
  }, []);

  // URLパラメータからキーワードを取得（初回のみ、復元されていない場合）
  useEffect(() => {
    if (!isRestored) {
      const keyword = searchParams.get("keyword");
      if (keyword) {
        setPrimaryKeyword(keyword);
      }
    }
  }, [searchParams, isRestored]);

  // 状態が変更されたらlocalStorageに保存
  useEffect(() => {
    const data: DraftData = {
      step,
      primaryKeyword,
      secondaryKeywords,
      outline,
      content,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [step, primaryKeyword, secondaryKeywords, outline, content]);

  const handleGenerateOutline = async () => {
    if (!primaryKeyword) {
      alert("主要キーワードを入力してください");
      return;
    }

    setLoading(true);
    setLoadingMessage("AIがアウトラインを生成中...");
    try {
      const allKeywords = [
        primaryKeyword,
        ...secondaryKeywords.split(",").map((k) => k.trim()),
      ].filter(Boolean);
      const response = await fetch("/api/admin/claude/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: primaryKeyword,
          keywords: allKeywords,
          targetLength: 2000,
          ...(selectedKeywordPillar && { pillarSlug: selectedKeywordPillar }),
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
      const response = await fetch("/api/admin/claude/update-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline,
          revisionRequest,
          keywords: allKeywords,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutline(data.outline);
        setRevisionRequest("");
        alert("アウトラインを更新しました");
      } else {
        const errorData = await response.json();
        alert(
          `アウトライン更新に失敗しました: ${errorData.error || "不明なエラー"}`,
        );
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

    setLoading(true);
    setLoadingMessage("AIが本文を執筆中...");
    try {
      const allKeywords = [
        primaryKeyword,
        ...secondaryKeywords.split(",").map((k) => k.trim()),
      ].filter(Boolean);
      const response = await fetch("/api/admin/claude/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: primaryKeyword,
          keywords: allKeywords,
          outline,
          ...(selectedKeywordPillar && { pillarSlug: selectedKeywordPillar }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        // 本文生成後、自動的に記事を作成して編集画面に遷移
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
      // 記事を直接作成（タイトル・slug・descriptionはアウトラインで同時生成）
      const postData = {
        title: outline.title,
        ...(outline.slug && { slug: outline.slug }),
        description: outline.introduction,
        date: new Date().toISOString().split("T")[0],
        author: "Nectere編集部",
        category: "学習のコツ",
        categoryType: "article",
        relatedBusiness: [], // 後で編集ページで設定
        tags: [],
        seo: {
          primaryKeyword: primaryKeyword,
          secondaryKeywords: secondaryKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
        locale: "ja",
        published: false, // 下書きとして作成
        content: contentToUse,
      };

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const data = await response.json();
        // 成功したらlocalStorageをクリア
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

  // キーワード競合チェック
  const checkKeywordConflicts = useCallback(async (keywords: string[]) => {
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
  }, []);

  // 選択キーワードがクラスターの場合、ピラー情報を取得
  useEffect(() => {
    if (!primaryKeyword) {
      setSelectedKeywordPillar(null);
      return;
    }
    fetch(`/api/admin/keywords/master/${encodeURIComponent(primaryKeyword)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.pillarSlug && d.data?.keywordTier === "longtail") {
          setSelectedKeywordPillar(d.data.pillarSlug);
        } else {
          setSelectedKeywordPillar(null);
        }
      })
      .catch(() => setSelectedKeywordPillar(null));
  }, [primaryKeyword]);

  const handleKeywordSelect = useCallback(
    (primary: string, secondary: string[]) => {
      setPrimaryKeyword(primary);
      setSecondaryKeywords(secondary.join(", "));
      // キーワード変更時に競合チェックを実行
      const allKeywords = [primary, ...secondary].filter(Boolean);
      checkKeywordConflicts(allKeywords);
    },
    [checkKeywordConflicts],
  );

  const handleReset = () => {
    if (
      confirm(
        "現在の作業内容を破棄して最初からやり直しますか？この操作は取り消せません。",
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setStep("keywords");
      setPrimaryKeyword("");
      setSecondaryKeywords("");
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
        // 古いデータ（配列形式）にも対応
        setSecondaryKeywords(
          Array.isArray(data.secondaryKeywords)
            ? data.secondaryKeywords.join(", ")
            : data.secondaryKeywords || "",
        );
        setOutline(data.outline);
        setContent(data.content);
        setIsRestored(true);

        // 保存された進捗に応じて適切なステップに移動
        if (data.content && data.outline && data.primaryKeyword) {
          // 本文が既にある場合は自動的に記事を作成して編集画面に遷移
          await handleCreatePost(data.content);
        } else if (data.outline) {
          setStep("outline");
          alert("進捗を復元しました");
        } else if (data.primaryKeyword) {
          setStep("keywords");
          alert("進捗を復元しました");
        } else {
          setStep("keywords");
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
      return !!(data.primaryKeyword || data.outline || data.content);
    } catch {
      return false;
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事作成</h1>
          <p className="mt-2 text-gray-600">
            キーワードを選択してAIが記事を生成
          </p>
        </div>
        {(step !== "keywords" || outline || content) && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            最初からやり直す
          </button>
        )}
      </div>

      {/* 復元通知 - 実際に復元されたデータがある場合のみ表示 */}
      {isRestored && step !== "keywords" && (outline || content) && (
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
            {["キーワード", "アウトライン", "本文"].map((label, index) => {
              const steps = ["keywords", "outline", "content"];
              const currentIndex = steps.indexOf(step);
              const isActive = index <= currentIndex;

              return (
                <div key={label} className="flex items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-soft"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 font-medium ${
                      isActive ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    {label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        index < currentIndex ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
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
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <LuTriangleAlert className="w-5 h-5" />
                  意図グループの分散
                </h4>
                <ul className="space-y-2">
                  {intentGroupConflicts.map((c) => (
                    <li key={c.intentGroupId} className="text-sm text-amber-700">
                      {c.message}
                      <span className="block mt-1 text-xs">
                        キーワード: {c.keywords?.join(", ")} | 記事: {c.existingArticles?.join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* クラスター記事のピラー提案 */}
            {selectedKeywordPillar && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  クラスター記事です。ピラー「{selectedKeywordPillar}」への内部リンクを追加してください。
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerateOutline}
              disabled={loading || !primaryKeyword}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
            >
              <LuSparkles className="w-5 h-5" />
              {loading ? "AI生成中..." : "アウトラインを生成"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: アウトライン確認 */}
      {step === "outline" && outline && (
        <>
          {/* キーワードカード */}
          <div className="flex flex-wrap gap-3 mb-6">
            {primaryKeyword && (
              <Chip variant="keyword" size="lg">
                {primaryKeyword}
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
                  <h3 className="font-bold text-gray-900 mb-2">
                    セクション構成
                  </h3>
                  <div className="space-y-3">
                    {outline.sections.map((section: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-bold text-gray-900 mb-2">
                          {section.heading}
                        </h4>
                        <ul className="space-y-1 ml-4">
                          {section.subheadings.map(
                            (sub: string, subIndex: number) => (
                              <li
                                key={subIndex}
                                className="text-sm text-gray-700"
                              >
                                • {sub}
                              </li>
                            ),
                          )}
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
                    setStep("keywords");
                    setOutline(null);
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

            {/* 右側: アウトライン修正カード */}
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
                placeholder="例: タイトルをもっと具体的にしてください。セクション3に実例を追加してください。まとめにもっと行動喚起を強めてください。"
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
        </>
      )}

      {/* ローディングオーバーレイ */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              {/* スピナー */}
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div
                  className="absolute inset-2 border-4 border-primary/30 border-t-transparent rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1s",
                  }}
                ></div>
              </div>

              {/* メッセージ */}
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
