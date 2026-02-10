import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/blog";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { NewsCard } from "@/components/cards/NewsCard";
import { remarkCtaPlugin } from "@/lib/remark-cta-plugin";
import { rehypeCtaPlugin } from "@/lib/rehype-cta-plugin";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Heading } from "@/components/blog/Heading";

export default async function BlogPostPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const { locale, slug } = params;

  const post = await getPostBySlug(slug);

  if (!post || post.locale !== locale || post.published === false) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug);

  // Check if this is a Nobilva article
  const isNobilva = post.relatedBusiness?.includes("nobilva");
  const isTeachIt = post.relatedBusiness?.includes("teachit");

  // Determine the primary business
  // NobilvaやTeachItの記事の場合は、それらを優先する
  let primaryBusiness:
    | "nobilva"
    | "teachit"
    | "translation"
    | "web-design"
    | "print"
    | undefined;
  if (isNobilva) {
    primaryBusiness = "nobilva";
  } else if (isTeachIt) {
    primaryBusiness = "teachit";
  } else {
    primaryBusiness = post.relatedBusiness?.[0] as
      | "nobilva"
      | "teachit"
      | "translation"
      | "web-design"
      | "print"
      | undefined;
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

  const publishedDateLabel = (() => {
    const d = new Date(post.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  })();

  const toc = (
    <TableOfContents
      content={post.content}
      theme={isNobilva ? "nobilva" : "default"}
    />
  );

  const proseThemeClass = isNobilva
    ? "prose-nobilva"
    : isTeachIt
      ? "prose-teachit"
      : "prose-default";

  return (
    <main className="min-h-screen bg-white">
      {/* ページのbusinessデータ（Header/Footer用） */}
      {primaryBusiness && (
        <script
          type="application/json"
          id="page-business-data"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ business: primaryBusiness }),
          }}
        />
      )}
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Section
        className="pt-24 pb-16 md:pt-32 md:pb-24"
        backgroundColor="white"
      >
        <Container>
          {/* グリッドレイアウト: 本文と目次を左右に配置 */}
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
                      <Link
                        href={`/${locale}/blog?category=${encodeURIComponent(post.category)}`}
                        className={`font-medium hover:underline transition-colors ${isNobilva ? "text-nobilva-accent" : "text-primary"}`}
                      >
                        {post.category}
                      </Link>
                    </>
                  )}
                </div>
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

              {/* 目次（モバイル表示） */}
              <aside className="lg:hidden mb-8">{toc}</aside>

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

              {/* 著者情報 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">著者: {post.author}</p>
              </div>
            </article>

            {/* 目次（デスクトップ表示） */}
            <aside className="hidden lg:block lg:w-[320px] lg:flex-none lg:sticky lg:top-32 lg:self-start">
              {toc}
            </aside>
          </div>

          {/* 関連記事 */}
          {relatedPosts.length > 0 && (
            <div className="max-w-5xl mx-auto mt-16">
              <h2
                className={`text-2xl font-bold mb-6 ${isNobilva ? "text-nobilva-accent" : "text-gray-900"}`}
              >
                関連記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <NewsCard
                    key={relatedPost.slug}
                    title={relatedPost.title}
                    date={relatedPost.date}
                    excerpt={relatedPost.description}
                    thumbnailUrl={relatedPost.image}
                    category={relatedPost.category}
                    categoryType={relatedPost.categoryType}
                    relatedBusiness={relatedPost.relatedBusiness}
                    tags={relatedPost.tags}
                    href={`/${locale}/blog/${relatedPost.slug}`}
                    delay={index * 50}
                    theme={isNobilva ? "nobilva" : "default"}
                  />
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
