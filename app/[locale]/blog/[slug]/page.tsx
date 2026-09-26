import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getPostBySlug, getAllPosts, getRelatedPosts, getAuthorByName } from "@/lib/blog";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { NewsCard } from "@/components/cards/NewsCard";
import { remarkCtaPlugin } from "@/lib/remark-cta-plugin";
import { rehypeCtaPlugin } from "@/lib/rehype-cta-plugin";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Heading } from "@/components/blog/Heading";
import { AuthorSocialLinks } from "@/components/blog/AuthorSocialLinks";
import { BASE_URL } from "@/lib/seo";

/** ブログの publisher 用 Organization 構造化データ（個人事業主・読み方を含む） */
const PUBLISHER_ORGANIZATION = {
  "@type": "Organization",
  name: "Nectere",
  legalName: "Nectere（屋号）",
  alternateName: "ネクター",
  description:
    "個人事業。屋号 Nectere（読み：ネクター）。",
  logo: {
    "@type": "ImageObject",
    url: "https://www.nectere.jp/images/logo.png",
  },
} as const;

export default async function BlogPostPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const { locale, slug } = params;

  // 拡張子を含むスラッグ（画像ファイル名など）は無効
  if (/\.\w+$/.test(slug)) {
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post || post.locale !== locale || post.published === false) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug);
  const author = await getAuthorByName(post.author);

  // 内部リンク検証用: 公開済み記事のslugセット
  const allPublishedPosts = await getAllPosts(locale);
  const publishedSlugs = new Set(allPublishedPosts.map((p) => p.slug));
  const publishedPostMap = new Map(
    allPublishedPosts.map((p) => [
      p.slug,
      { title: p.title, description: p.description, image: p.image },
    ]),
  );

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
  const authorSameAs = author?.socialLinks?.map((l) => l.url) ?? [];
  const authorJsonLd = {
    "@type": author?.id === "nectere" ? "Organization" as const : "Person" as const,
    name: post.author,
    ...(author?.bio && { description: author.bio }),
    ...(author?.profileUrl && { url: author.profileUrl }),
    ...(authorSameAs.length > 0 && { sameAs: authorSameAs }),
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image ? `https://www.nectere.jp${post.image}` : undefined,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: authorJsonLd,
    publisher: PUBLISHER_ORGANIZATION,
    keywords: [post.seo.primaryKeyword, ...post.seo.secondaryKeywords]
      .filter((k) => k && !/^kw_[a-z0-9_]+$/i.test(k))
      .join(", "),
  };

  const publishedDateLabel = (() => {
    const d = new Date(post.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  })();

  const modifiedDateLabel = post.dateModified
    ? (() => {
        const d = new Date(post.dateModified);
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      })()
    : null;

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
      {post.faq && post.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: post.faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            }),
          }}
        />
      )}
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
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                  <time dateTime={post.date}>{publishedDateLabel}</time>
                  {modifiedDateLabel && (
                    <>
                      <span>•</span>
                      <time
                        dateTime={post.dateModified}
                        className="text-gray-500"
                      >
                        更新日: {modifiedDateLabel}
                      </time>
                    </>
                  )}
                  {post.category && (
                    <>
                      <span>•</span>
                      <Link
                        href={`/blog?category=${encodeURIComponent(post.category)}`}
                        className={`font-medium hover:underline transition-colors ${isNobilva ? "text-nobilva-accent" : "text-primary"}`}
                      >
                        {post.category}
                      </Link>
                    </>
                  )}
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    {author?.avatar ? (
                      <img src={author.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-gray-300 inline-flex items-center justify-center text-[10px] text-white font-bold">{post.author.charAt(0)}</span>
                    )}
                    {post.author}
                  </span>
                </div>
                <p className="text-lg text-gray-600">{post.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
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
                  skipHtml={true}
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
                    a: ({ href, children, className, ...rest }) => {
                      // CTA プラグイン生成の <a> (ボタン / LINE QR) はクラスと style を素通し
                      // ここで拾わないと className/style が落ちて .cta-line-qr の display:none が効かない
                      if (
                        className?.includes('cta-block-button') ||
                        className?.includes('cta-line-qr')
                      ) {
                        return (
                          <a href={href} className={className} {...rest}>
                            {children}
                          </a>
                        );
                      }
                      // 内部ブログリンクの検証
                      const blogMatch = href?.match(/^\/(?:ja\/|en\/|de\/)?blog\/([^/?#]+)/);
                      if (blogMatch) {
                        const targetSlug = blogMatch[1];
                        // 存在しない or 非公開記事へのリンクは非表示
                        if (!publishedSlugs.has(targetSlug)) {
                          return null;
                        }
                        // 公開済み内部リンク: カード風表示（サムネ付き横並び）
                        const meta = publishedPostMap.get(targetSlug);
                        return (
                          <a
                            href={href}
                            className="not-prose flex gap-4 items-stretch my-4 border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 hover:bg-gray-50 transition-colors no-underline group"
                          >
                            <span className="block w-24 md:w-32 flex-none self-stretch bg-gray-100 overflow-hidden">
                              {meta?.image && (
                                <img
                                  src={meta.image}
                                  alt=""
                                  className="block w-full h-full object-cover !my-0 !rounded-none"
                                />
                              )}
                            </span>
                            <span className="flex-1 min-w-0 py-4 md:py-5 pr-4 md:pr-5 no-underline">
                              <span className="block text-base md:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors no-underline line-clamp-2">
                                {meta?.title || children}
                              </span>
                              {meta?.description && (
                                <span className="block mt-1.5 text-sm md:text-base text-gray-500 line-clamp-2 no-underline">
                                  {meta.description}
                                </span>
                              )}
                            </span>
                          </a>
                        );
                      }
                      // 外部リンク
                      const isExternal = href?.startsWith('http');
                      return (
                        <a
                          href={href}
                          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* 著者情報 */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                  {author?.avatar ? (
                    <img
                      src={author.avatar}
                      alt={post.author}
                      className="w-16 h-16 rounded-full object-cover flex-none"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-none text-white text-xl font-bold">
                      {post.author.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">
                      {author?.profileUrl ? (
                        <a
                          href={author.profileUrl}
                          target="_blank"
                          className="hover:underline"
                        >
                          {post.author}
                        </a>
                      ) : (
                        post.author
                      )}
                    </p>
                    {author?.role && (
                      <p className="text-sm text-gray-500 mt-0.5">{author.role}</p>
                    )}
                    {author?.bio && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{author.bio}</p>
                    )}
                    {author?.socialLinks && author.socialLinks.length > 0 && (
                      <AuthorSocialLinks links={author.socialLinks} className="mt-3" />
                    )}
                  </div>
                </div>
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
                    href={`/blog/${relatedPost.slug}`}
                    delay={index * 0.05}
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

  if (/\.\w+$/.test(slug)) {
    return { title: "記事が見つかりません" };
  }

  const post = await getPostBySlug(slug);

  if (!post || post.locale !== locale) {
    return {
      title: "記事が見つかりません",
    };
  }

  // 構造化データ（JSON-LD）
  const metaAuthor = await getAuthorByName(post.author);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image ? `https://www.nectere.jp${post.image}` : undefined,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: {
      "@type": metaAuthor?.id === "nectere" ? "Organization" as const : "Person" as const,
      name: post.author,
      ...(metaAuthor?.bio && { description: metaAuthor.bio }),
      ...(metaAuthor?.profileUrl && { url: metaAuthor.profileUrl }),
      ...((metaAuthor?.socialLinks?.length ?? 0) > 0 && {
        sameAs: metaAuthor!.socialLinks!.map((l) => l.url),
      }),
    },
    publisher: PUBLISHER_ORGANIZATION,
    keywords: [post.seo.primaryKeyword, ...post.seo.secondaryKeywords]
      .filter((k) => k && !/^kw_[a-z0-9_]+$/i.test(k))
      .join(", "),
  };

  // ブログは locale prefix なしを正規URLとする（旧 /:locale/blog/* は 301 で /blog/* にリダイレクト）
  const pageUrl = `${BASE_URL}/blog/${slug}`;
  const ogImageUrl = post.image ? `${BASE_URL}${post.image}` : undefined;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: pageUrl,
      siteName: "Nectere",
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }]
        : [],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      locale: locale === "ja" ? "ja_JP" : locale === "en" ? "en_US" : "de_DE",
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      "application/ld+json": JSON.stringify(structuredData),
    },
  };
}
