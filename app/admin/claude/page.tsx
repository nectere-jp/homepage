"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuSparkles, LuFilePlus, LuTriangleAlert } from "react-icons/lu";
import { KeywordSelector } from "@/components/admin/KeywordSelector";

export default function ClaudePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"keywords" | "outline" | "content">("keywords");
  const [loading, setLoading] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [outline, setOutline] = useState<any>(null);
  const [content, setContent] = useState("");

  // URLパラメータからキーワードを取得
  useEffect(() => {
    const keyword = searchParams.get("keyword");
    if (keyword) {
      setPrimaryKeyword(keyword);
    }
  }, [searchParams]);

  const handleGenerateOutline = async () => {
    if (!primaryKeyword) {
      alert("主要キーワードを選択してください");
      return;
    }

    setLoading(true);
    try {
      const allKeywords = [primaryKeyword, ...secondaryKeywords];
      const response = await fetch("/api/admin/claude/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: primaryKeyword,
          keywords: allKeywords,
          targetLength: 2000,
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
    }
  };

  const handleGenerateContent = async () => {
    if (!primaryKeyword || !outline) return;

    setLoading(true);
    try {
      const allKeywords = [primaryKeyword, ...secondaryKeywords];
      const response = await fetch("/api/admin/claude/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: primaryKeyword,
          keywords: allKeywords,
          outline,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setStep("content");
      } else {
        alert("本文生成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("本文生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!outline || !content || !primaryKeyword) return;

    setLoading(true);
    try {
      // 記事を直接作成
      const postData = {
        title: outline.title,
        description: outline.introduction,
        date: new Date().toISOString().split("T")[0],
        author: "Nectere編集部",
        category: "学習のコツ",
        categoryType: "article",
        relatedBusiness: [], // 後で編集ページで設定
        tags: [],
        seo: {
          primaryKeyword: primaryKeyword,
          secondaryKeywords: secondaryKeywords,
        },
        locale: "ja",
        published: false, // 下書きとして作成
        content,
      };

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("記事を下書きとして作成しました。編集ページで詳細を設定してください。");
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

  const handleKeywordSelect = (primary: string, secondary: string[]) => {
    setPrimaryKeyword(primary);
    setSecondaryKeywords(secondary);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">記事作成</h1>
        <p className="mt-2 text-gray-600">
          キーワードを選択してAIが記事を生成
        </p>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {["キーワード", "アウトライン", "本文", "作成"].map(
            (label, index) => {
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
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        index < currentIndex ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Step 1: キーワード選択 */}
      {step === "keywords" && (
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ステップ 1: キーワードを選択
          </h2>
          <KeywordSelector
            onSelect={handleKeywordSelect}
            initialKeyword={primaryKeyword}
          />
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
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ステップ 3: アウトラインを確認
          </h2>
          <div className="space-y-4">
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
                    <h4 className="font-bold text-gray-900 mb-2">
                      {section.heading}
                    </h4>
                    <ul className="space-y-1 ml-4">
                      {section.subheadings.map(
                        (sub: string, subIndex: number) => (
                          <li key={subIndex} className="text-sm text-gray-700">
                            • {sub}
                          </li>
                        )
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

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep("keywords");
                  setOutline(null);
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
        </div>
      )}

      {/* Step 3: 本文確認 */}
      {step === "content" && content && (
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ステップ 3: 本文を確認
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 max-h-96 overflow-y-auto">
                {content}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-700">
                ✅ 本文が生成されました！記事編集ページで最終調整してください。
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep("outline");
                  setContent("");
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                戻る
              </button>
              <button
                onClick={handleCreatePost}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
              >
                <LuFilePlus className="w-5 h-5" />
                {loading ? "作成中..." : "記事を作成して編集"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
