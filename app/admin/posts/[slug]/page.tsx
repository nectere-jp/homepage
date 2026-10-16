"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost, BusinessType } from "@/lib/blog";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "@/lib/toast";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import {
  PostForm,
  EMPTY_POST_FORM_DATA,
  type PostFormData,
} from "@/components/admin/posts/PostForm";

export default function EditPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [params, setParams] = useState<{ slug: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [initialData, setInitialData] = useState<PostFormData>(EMPTY_POST_FORM_DATA);
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    props.params.then(setParams);
  }, [props.params]);

  useEffect(() => {
    if (!params) return;
    const fetchPost = async () => {
      try {
        const response = await adminFetch(`/api/admin/posts/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          const p: BlogPost = data.post;
          setPost(p);
          setInitialData({
            title: p.title,
            slug: p.slug,
            description: p.description,
            date: p.date,
            author: p.author,
            category: p.category,
            categoryType: p.categoryType || "article",
            relatedBusiness: (p.relatedBusiness || []) as BusinessType[],
            tags: p.tags || [],
            image: p.image || "",
            primaryKeyword: p.seo.primaryKeyword,
            secondaryKeywords: p.seo.secondaryKeywords || [],
            locale: p.locale,
            published: p.published !== false,
          });
          setInitialContent(p.content);
        } else {
          toast.error("記事が見つかりません");
          router.push("/admin/posts");
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toast.error("記事の読み込みに失敗しました");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params, router]);

  const handleSubmit = async (data: PostFormData, content: string) => {
    if (!params) return;
    setSaving(true);
    try {
      const postData = {
        title: data.title,
        newSlug: data.slug !== params.slug ? data.slug : undefined,
        description: data.description,
        date: data.date,
        author: data.author,
        category: data.category,
        categoryType: data.categoryType,
        relatedBusiness:
          data.categoryType === "article" ? data.relatedBusiness : undefined,
        tags: data.tags.filter(Boolean),
        image: data.image,
        seo: {
          primaryKeyword: data.primaryKeyword,
          secondaryKeywords: data.secondaryKeywords.filter(Boolean),
        },
        locale: data.locale,
        published: data.published,
        content,
      };
      const response = await adminFetch(`/api/admin/posts/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "記事を更新しました");
        router.push("/admin/posts");
      } else {
        toast.error("記事の更新に失敗しました");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("記事の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !params) return <LoadingSpinner />;
  if (!post) return null;

  const articlePath = `/blog/${initialData.slug || params.slug}`;

  return (
    <PostForm
      mode="edit"
      initialData={initialData}
      initialContent={initialContent}
      originalSlug={params.slug}
      post={post}
      onSubmit={handleSubmit}
      submitting={saving}
      onCancel={() => router.push("/admin/posts")}
      header={
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
            {initialData.published && (
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
      }
    />
  );
}
