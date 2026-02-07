import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/blog";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default async function BlogPostPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const { locale, slug } = params;
  unstable_setRequestLocale(locale);

  const post = await getPostBySlug(slug);

  if (!post || post.locale !== locale || post.published === false) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug);

  // Check if this is a Nobilva article
  const isNobilva = post.relatedBusiness?.includes("nobilva");

  // 構造化データ（JSON-LD）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image ? `https://nectere.jp${post.image}` : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Nectere",
      logo: {
        "@type": "ImageObject",
        url: "https://nectere.jp/images/logo.png",
      },
    },
    keywords: [post.seo.primaryKeyword, ...post.seo.secondaryKeywords].join(
      ", ",
    ),
  };

  return (
    <main className={`min-h-screen ${isNobilva ? "bg-nobilva-light" : ""}`}>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Section
        className="py-16 md:py-24"
        backgroundColor={isNobilva ? "transparent" : undefined}
      >
        <Container>
          <article className="max-w-3xl mx-auto">
            {/* パンくずリスト */}
            <nav className="mb-8 text-sm text-gray-600">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href={`/${locale}`}
                    className={`transition-colors ${isNobilva ? "hover:text-nobilva-accent" : "hover:text-primary"}`}
                  >
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                {isNobilva && (
                  <>
                    <li>
                      <Link
                        href={`/${locale}/services/nobilva`}
                        className="hover:text-nobilva-accent transition-colors"
                      >
                        Nobilva
                      </Link>
                    </li>
                    <li>/</li>
                  </>
                )}
                <li>
                  <Link
                    href={`/${locale}/blog`}
                    className={`transition-colors ${isNobilva ? "hover:text-nobilva-accent" : "hover:text-primary"}`}
                  >
                    Blog
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900">{post.title}</li>
              </ol>
            </nav>

            {/* ヘッダー */}
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <time dateTime={post.date}>
                  {(() => {
                    const d = new Date(post.date);
                    const year = d.getFullYear();
                    const month = d.getMonth() + 1;
                    const day = d.getDate();
                    return `${year}年${month}月${day}日`;
                  })()}
                </time>
                {post.category && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/${locale}/blog?category=${encodeURIComponent(post.category)}`}
                      className={`font-medium hover:underline transition-colors ${isNobilva ? "text-nobilva-accent" : "text-primary"}`}
                    >
                      {post.category}
                    </Link>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <p className="text-lg text-gray-600">{post.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                    className={`px-3 py-1 text-sm transition-colors ${
                      isNobilva
                        ? "rounded-none bg-nobilva-light text-nobilva-accent border border-nobilva-accent hover:bg-nobilva-accent hover:text-white"
                        : "rounded bg-gray-100 text-gray-700 hover:bg-primary hover:text-white"
                    }`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </header>

            {/* アイキャッチ画像 */}
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

            {/* 本文 */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* 著者情報 */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">著者: {post.author}</p>
            </div>
          </article>

          {/* 関連記事 */}
          {relatedPosts.length > 0 && (
            <div className="max-w-5xl mx-auto mt-16">
              <h2
                className={`text-2xl font-bold mb-6 ${isNobilva ? "text-nobilva-accent" : "text-gray-900"}`}
              >
                関連記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/${locale}/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article
                      className={`h-full shadow-md overflow-hidden transition-shadow hover:shadow-xl bg-white ${isNobilva ? "rounded-none" : "rounded-lg"}`}
                    >
                      {relatedPost.image && (
                        <div className="aspect-video relative overflow-hidden bg-gray-100">
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3
                          className={`font-bold mb-2 transition-colors line-clamp-2 ${
                            isNobilva
                              ? "text-gray-900 group-hover:text-nobilva-accent"
                              : "text-gray-900 group-hover:text-primary"
                          }`}
                        >
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedPost.description}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}

export async function generateStaticParams() {
  const locales = ["ja", "en", "de"];
  const params = [];

  for (const locale of locales) {
    const posts = await getAllPosts(locale);
    params.push(
      ...posts.map((post) => ({
        locale,
        slug: post.slug,
      })),
    );
  }

  return params;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const { locale, slug } = params;
  const post = await getPostBySlug(slug);

  if (!post || post.locale !== locale) {
    return {
      title: "記事が見つかりません",
    };
  }

  // 構造化データ（JSON-LD）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image ? `https://nectere.jp${post.image}` : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Nectere",
      logo: {
        "@type": "ImageObject",
        url: "https://nectere.jp/images/logo.png",
      },
    },
    keywords: [post.seo.primaryKeyword, ...post.seo.secondaryKeywords].join(
      ", ",
    ),
  };

  return {
    title: `${post.title} - Nectere Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    other: {
      "application/ld+json": JSON.stringify(structuredData),
    },
  };
}
