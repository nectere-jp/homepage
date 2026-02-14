"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Heading } from "@/components/blog/Heading";
import { remarkCtaPlugin } from "@/lib/remark-cta-plugin";
import { rehypeCtaPlugin } from "@/lib/rehype-cta-plugin";
import type { BlogPost } from "@/lib/blog";

export default function BlogPreviewPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const [params, setParams] = useState<{ slug: string } | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    props.params.then(setParams);
  }, [props.params]);

  useEffect(() => {
    if (!params) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/posts/${params.slug}`);
        if (!res.ok) {
          setError("記事が見つかりません");
          setPost(null);
          return;
        }
        const data = await res.json();
        setPost(data.post);
        setError(null);
      } catch {
        setError("読み込みに失敗しました");
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  if (loading || !params) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-600">{error ?? "記事が見つかりません"}</p>
          <Link
            href="/admin/posts"
            className="mt-4 inline-block text-primary hover:underline"
          >
            記事一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const isNobilva = post.relatedBusiness?.includes("nobilva");
  const isTeachIt = post.relatedBusiness?.includes("teachit");
  const primaryBusiness = isNobilva
    ? "nobilva"
    : isTeachIt
      ? "teachit"
      : (post.relatedBusiness?.[0] as
          | "nobilva"
          | "teachit"
          | "translation"
          | "web-design"
          | "print"
          | undefined);
  const proseThemeClass = isNobilva
    ? "prose-nobilva"
    : isTeachIt
      ? "prose-teachit"
      : "prose-default";

  const publishedDateLabel = (() => {
    const d = new Date(post.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  })();

  const bannerClass = isNobilva
    ? "bg-nobilva-light border-nobilva-accent text-nobilva-accent"
    : isTeachIt
      ? "bg-teachit-light border-teachit-accent text-teachit-accent"
      : "bg-amber-100 border-amber-200 text-amber-900";
  const bannerLinkClass = isNobilva
    ? "text-nobilva-accent hover:text-nobilva-accent/80"
    : isTeachIt
      ? "text-teachit-accent hover:text-teachit-accent/80"
      : "text-amber-800 hover:text-amber-900";
  const draftBadgeClass = isNobilva
    ? "text-nobilva-accent"
    : isTeachIt
      ? "text-teachit-accent"
      : "text-amber-600";
  const categoryTextClass = isNobilva
    ? "font-medium text-nobilva-accent"
    : isTeachIt
      ? "font-medium text-teachit-accent"
      : "font-medium";

  return (
    <main className="min-h-screen bg-white">
      {/* ページのbusinessデータ（Header/Footer用・実際の記事ページと同様） */}
      {primaryBusiness && (
        <script
          type="application/json"
          id="page-business-data"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ business: primaryBusiness }),
          }}
        />
      )}
      {/* プレビューバナー */}
      <div
        className={`sticky top-0 z-10 border-b px-4 py-2 flex items-center justify-between gap-4 ${bannerClass}`}
      >
        <span className="text-sm font-medium">
          {post.published === false ? "下書きプレビュー" : "プレビュー"}
        </span>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/posts/${params.slug}`}
            className={`text-sm font-medium underline ${bannerLinkClass}`}
          >
            編集ページへ
          </Link>
          <Link
            href="/admin/posts"
            className={`text-sm font-medium underline ${bannerLinkClass}`}
          >
            記事一覧
          </Link>
        </div>
      </div>

      <Section
        className="pt-12 pb-16 md:pt-16 md:pb-24"
        backgroundColor="white"
      >
        <Container>
          <div className="lg:flex lg:gap-8 lg:items-start">
            <article className="max-w-3xl mx-auto lg:mx-0 lg:flex-1">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <time dateTime={post.date}>{publishedDateLabel}</time>
                  {post.category && (
                    <>
                      <span>•</span>
                      <span className={categoryTextClass}>{post.category}</span>
                    </>
                  )}
                  {post.published === false && (
                    <>
                      <span>•</span>
                      <span className={`font-medium ${draftBadgeClass}`}>
                        下書き
                      </span>
                    </>
                  )}
                </div>
                <p className="text-lg text-gray-600">{post.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(post.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 text-sm ${
                        isNobilva
                          ? "rounded-none bg-nobilva-light text-nobilva-accent border border-nobilva-accent"
                          : isTeachIt
                            ? "rounded bg-teachit-light text-teachit-accent border border-teachit-accent"
                            : "rounded bg-gray-100 text-gray-700"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </header>

              <aside className="lg:hidden mb-8">
                <TableOfContents
                  content={post.content}
                  theme={isNobilva ? "nobilva" : "default"}
                />
              </aside>

              {post.image && (
                <div
                  className={`mb-8 overflow-hidden ${isNobilva ? "rounded-none" : "rounded-lg"}`}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              <div className={`prose prose-lg max-w-none ${proseThemeClass}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkCtaPlugin]}
                  rehypePlugins={[rehypeCtaPlugin, rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <Heading level={1}>{children}</Heading>
                    ),
                    h2: ({ children }) => (
                      <Heading level={2}>{children}</Heading>
                    ),
                    h3: ({ children }) => (
                      <Heading level={3}>{children}</Heading>
                    ),
                    h4: ({ children }) => (
                      <Heading level={4}>{children}</Heading>
                    ),
                    h5: ({ children }) => (
                      <Heading level={5}>{children}</Heading>
                    ),
                    h6: ({ children }) => (
                      <Heading level={6}>{children}</Heading>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">著者: {post.author}</p>
              </div>
            </article>

            <aside className="hidden lg:block lg:w-[320px] lg:flex-none lg:sticky lg:top-24 lg:self-start">
              <TableOfContents
                content={post.content}
                theme={isNobilva ? "nobilva" : "default"}
              />
            </aside>
          </div>
        </Container>
      </Section>
    </main>
  );
}
