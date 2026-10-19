"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "@/lib/toast";
import {
  PostForm,
  EMPTY_POST_FORM_DATA,
  type PostFormData,
} from "@/components/admin/posts/PostForm";

export default function NewPostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<PostFormData>(EMPTY_POST_FORM_DATA);
  const [initialContent, setInitialContent] = useState("");

  // Claude で生成されたデータを読み込む
  useEffect(() => {
    const claudeData = localStorage.getItem("claude_generated_post");
    if (!claudeData) return;
    try {
      const data = JSON.parse(claudeData);
      const secondaryKeywords: string[] = Array.isArray(data.secondaryKeywords)
        ? data.secondaryKeywords
        : data.secondaryKeywords
          ? data.secondaryKeywords.split(",").map((k: string) => k.trim())
          : [];
      const tags: string[] = Array.isArray(data.tags)
        ? data.tags
        : data.tags
          ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [];
      setInitialData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        category: data.category || prev.category,
        primaryKeyword: data.primaryKeyword || prev.primaryKeyword,
        secondaryKeywords,
        tags,
      }));
      setInitialContent(data.content || "");
      localStorage.removeItem("claude_generated_post");
    } catch (error) {
      console.error("Failed to load Claude data:", error);
    }
  }, []);

  const handleSubmit = async (data: PostFormData, content: string) => {
    setSubmitting(true);
    try {
      const postData = {
        ...data,
        slug: data.slug || undefined,
        tags: data.tags.filter(Boolean),
        relatedBusiness:
          data.categoryType === "article" ? data.relatedBusiness : undefined,
        seo: {
          primaryKeyword: data.primaryKeyword,
          secondaryKeywords: data.secondaryKeywords.filter(Boolean),
        },
        content,
      };
      const response = await adminFetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "記事を作成しました");
        router.push("/admin/posts");
      } else {
        toast.error("記事の作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("記事の作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PostForm
      mode="new"
      initialData={initialData}
      initialContent={initialContent}
      onSubmit={handleSubmit}
      submitting={submitting}
      onCancel={() => router.back()}
      header={
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規記事作成</h1>
          <p className="mt-2 text-gray-600">マークダウンで記事を執筆</p>
        </div>
      }
    />
  );
}
