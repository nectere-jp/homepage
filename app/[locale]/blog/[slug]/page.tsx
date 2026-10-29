import { notFound } from "next/navigation";
import Link from "next/link";
import * as fs from "fs";
import * as path from "path";
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
import { StickyMobileCTA } from "@/components/blog/StickyMobileCTA";
import { BASE_URL } from "@/lib/seo";
import { NOBILVA_DEFINITION, NOBILVA_SERVICE_URL, NECTERE_ORG_REF } from "@/lib/nobilva";

/** ブログの publisher 用 Organization 構造化データ（lib/nobilva.ts の共通定義を使用） */
const PUBLISHER_ORGANIZATION = NECTERE_ORG_REF;

/** 中村龍人 著『野球をがんばる中学生の高校受験』の Book 構造化データ */
const KINDLE_BOOK_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Book",
  "@id": "https://www.amazon.co.jp/dp/B0HM1HKQBN#book",
  name: "野球をがんばる中学生の高校受験",
  alternativeHeadline: "野球推薦・内申・英検・引退後の勉強まで",
  inLanguage: "ja",
  bookFormat: "https://schema.org/EBook",
  url: "https://www.amazon.co.jp/dp/B0HM1HKQBN",
  sameAs: "https://www.amazon.co.jp/dp/B0HM1HKQBN",
  image: "https://www.nectere.jp/images/nobilva/kindle/yakyu-koukou-juken-cover.jpg",
  author: {
    "@type": "Person",
    "@id": "https://ryuto.tokyo/#person",
    name: "中村龍人",
    url: "https://ryuto.tokyo",
  },
  editor: {
    "@type": "Person",
    name: "養田貴大",
  },
  publisher: {
    "@type": "Organization",
    name: "Nectere",
    url: "https://www.nectere.jp",
  },
} as const;

/** Book 構造化データを出すスラッグ */
const BOOK_JSON_LD_SLUGS = new Set([
  "baseball-career-path-hub",
  "kindle-yakyu-koukou-juken",
]);

/**
 * public/ 配下の PNG/JPEG から寸法を同期的に取得して、ReactMarkdown の
 * <img> に width/height を注入する。レイアウトシフト対策 (CLS)。
 * 外部依存を増やさないため、PNG と JPEG のヘッダのみ自前で読む。
 */
const imageSizeCache = new Map<string, { w: number; h: number } | null>();

function getLocalImageDims(src: string | undefined): { w: number; h: number } | null {
  if (!src || !src.startsWith("/")) return null;
  const cached = imageSizeCache.get(src);
  if (cached !== undefined) return cached;
  try {
    const abs = path.join(process.cwd(), "public", src);
    const buf = fs.readFileSync(abs);
    let dim: { w: number; h: number } | null = null;
    if (
      buf.length > 24 &&
      buf.readUInt32BE(0) === 0x89504e47 &&
      buf.readUInt32BE(4) === 0x0d0a1a0a
    ) {
      dim = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    } else if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        // SOF0-SOF15 (但し DHT=0xC4, DAC=0xCC, JPG=0xC8 は除外)
        if (
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 &&
          marker !== 0xcc &&
          marker !== 0xc8
        ) {
          dim = { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
          break;
        }
        const segLen = buf.readUInt16BE(i + 2);
        i += 2 + segLen;
      }
    }
    imageSizeCache.set(src, dim);
    return dim;
  } catch {
    imageSizeCache.set(src, null);
    return null;
  }
}

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

  // Determine the primary business (Nobilva 記事を優先)
  let primaryBusiness:
    | "nobilva"
    | "kimisen"
    | "translation"
    | "web-design"
    | "print"
    | undefined;
  if (isNobilva) {
    primaryBusiness = "nobilva";
  } else {
    primaryBusiness = post.relatedBusiness?.[0] as
      | "nobilva"
      | "kimisen"
      | "translation"
      | "web-design"
      | "print"
      | undefined;
  }

  // 構造化データ（JSON-LD）
  const authorSameAs = author?.socialLinks?.map((l) => l.url) ?? [];
  const isPersonAuthor = author?.id !== "nectere";
  const authorJsonLd = {
    "@type": isPersonAuthor ? ("Person" as const) : ("Organization" as const),
    ...(author?.jsonLdId && { "@id": author.jsonLdId }),
    name: post.author,
    ...(author?.bio && { description: author.bio }),
    ...(author?.profileUrl && { url: author.profileUrl }),
    ...(authorSameAs.length > 0 && { sameAs: authorSameAs }),
    // Person の場合のみ affiliation と jobTitle を付与 (role 文字列から jobTitle を抽出)
    ...(isPersonAuthor && author?.role && { jobTitle: author.role }),
    ...(isPersonAuthor && { affiliation: NECTERE_ORG_REF }),
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image ? `https://www.nectere.jp${post.image}` : undefined,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: authorJsonLd,
    publisher: PUBLISHER_ORGANIZATION,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${slug}`,
    },
    keywords: [post.seo.primaryKeyword, ...post.seo.secondaryKeywords]
      .filter((k) => k && !/^kw_[a-z0-9_]+$/i.test(k))
      .join(", "),
  };

  const formatJaDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  const publishedDateLabel = formatJaDate(post.date);
  const modifiedDateLabel = post.dateModified ? formatJaDate(post.dateModified) : null;

  const toc = (
    <TableOfContents
      content={post.content}
      theme={isNobilva ? "nobilva" : "default"}
    />
  );

  const proseThemeClass = isNobilva ? "prose-nobilva" : "prose-default";

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
      {/* Book 構造化データ: 中村龍人 著『野球をがんばる中学生の高校受験』の関連記事ページで出力 */}
      {BOOK_JSON_LD_SLUGS.has(slug) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(KINDLE_BOOK_JSON_LD) }}
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
                    table: ({ children, ...rest }) => (
                      // スマホで列が多い表が潰れずに横スクロールできるよう、wrapper で overflow-x:auto。
                      // table は w-max + min-w-full で「内容分の幅、ただし画面を下回ることはない」。
                      // CSS 側 .blog-table-scroll で、はみ出しているときだけ右端に薄いシャドウを出す
                      <div className="blog-table-scroll my-6 overflow-x-auto -mx-4 md:mx-0 max-w-none">
                        <table className="w-max min-w-full border-collapse !my-0" {...rest}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children, ...rest }) => (
                      <th {...rest} className="whitespace-nowrap">{children}</th>
                    ),
                    td: ({ children, ...rest }) => (
                      <td {...rest} className="align-top" style={{ minWidth: '8em' }}>{children}</td>
                    ),
                    p: ({ children, node, ...rest }) => {
                      const first = (node as { children?: Array<{ type?: string; value?: string }> } | undefined)?.children?.[0];
                      const text = first?.type === 'text' ? first.value ?? '' : '';
                      if (text.startsWith('出典：')) {
                        return (
                          <p className="not-prose block -mt-4 mb-6 text-sm leading-relaxed text-gray-500">
                            {children}
                          </p>
                        );
                      }
                      return <p {...rest}>{children}</p>;
                    },
                    img: ({ src, alt, ...rest }) => {
                      // 書影画像は本文幅の半分で中央寄せに制約（画面幅100%で縦長の表紙が崩れないよう）
                      const isBookCover = typeof src === 'string' && src.includes('/nobilva/kindle/');
                      if (isBookCover) {
                        return (
                          <img
                            src={src}
                            alt={alt ?? ''}
                            loading="lazy"
                            className="block mx-auto my-6 w-full max-w-[260px] md:max-w-[320px] h-auto border border-gray-200"
                            {...rest}
                          />
                        );
                      }
                      // public/ 配下の画像なら width/height を注入してレイアウトシフトを防ぐ。
                      // CSS 側で max-width:100%/height:auto が当たっているので、
                      // 属性としてのピクセル値はアスペクト比の宣言として機能する。
                      const dims = typeof src === 'string' ? getLocalImageDims(src) : null;
                      return (
                        <img
                          src={src}
                          alt={alt ?? ''}
                          loading="lazy"
                          {...(dims ? { width: dims.w, height: dims.h } : {})}
                          {...rest}
                        />
                      );
                    },
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
                      // 本文中インラインリンクの cta_id 抽出: `?cta=xxx` が付いていれば
                      // それを data-track-cta として付与し、href からは除去する
                      // (Markdown で `[text](/path?cta=engine_intro)` と書けるようにする仕組み)
                      let ctaTrackId: string | undefined;
                      let cleanHref = href;
                      if (href) {
                        const m = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
                        if (m) {
                          const [, base, query = '', hash = ''] = m;
                          if (query) {
                            const sp = new URLSearchParams(query.slice(1));
                            const cta = sp.get('cta');
                            if (cta) {
                              ctaTrackId = cta;
                              sp.delete('cta');
                              const q = sp.toString();
                              cleanHref = base + (q ? `?${q}` : '') + hash;
                            }
                          }
                        }
                      }
                      // 内部ブログリンクの検証
                      const blogMatch = cleanHref?.match(/^\/(?:ja\/|en\/|de\/)?blog\/([^/?#]+)/);
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
                            href={cleanHref}
                            {...(ctaTrackId ? { 'data-track-cta': ctaTrackId } : {})}
                            className="not-prose flex flex-col sm:flex-row sm:items-center my-4 border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 hover:bg-gray-50 transition-colors no-underline group"
                          >
                            {/* サムネイル: スマホは全幅、PC は左 180-200px、どちらも 1200/630 の比率を維持。
                                テキストが縦に長くてもサムネが引き伸ばされず、残り余白はサムネ上下で等分される */}
                            <span className="block w-full sm:w-44 md:w-52 sm:flex-none bg-gray-100 overflow-hidden" style={{ aspectRatio: '1200 / 630' }}>
                              {meta?.image && (
                                <img
                                  src={meta.image}
                                  alt=""
                                  className="block w-full h-full object-cover !my-0 !rounded-none"
                                />
                              )}
                            </span>
                            <span className="flex-1 min-w-0 p-4 md:p-5 no-underline">
                              {/* line-clamp-2 は display:-webkit-box なので block とは共存できない (後勝ちで block が勝ってクランプが効かない)。block を外す */}
                              <span className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors no-underline line-clamp-2">
                                {meta?.title || children}
                              </span>
                              {meta?.description && (
                                <span className="mt-1.5 text-sm md:text-base text-gray-500 line-clamp-2 no-underline">
                                  {meta.description}
                                </span>
                              )}
                            </span>
                          </a>
                        );
                      }
                      // 外部リンク
                      const isExternal = cleanHref?.startsWith('http');
                      return (
                        <a
                          href={cleanHref}
                          {...(ctaTrackId ? { 'data-track-cta': ctaTrackId } : {})}
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
                <div className={`flex items-start gap-4 p-5 bg-gray-50 ${isNobilva ? "rounded-none" : "rounded-2xl"}`}>
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
                    {/* 著書: Nobilva 記事のみ。data-track-cta は classifyCtaType で kindle に分類される */}
                    {isNobilva && author?.books && author.books.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">著書</p>
                        {author.books.map((book) => {
                          const coverDims = getLocalImageDims(book.cover);
                          return (
                            <a
                              key={book.url}
                              href={book.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-track-cta="author_box_kindle"
                              className="group mt-2 flex items-start gap-3"
                            >
                              <img
                                src={book.cover}
                                alt={book.title}
                                loading="lazy"
                                {...(coverDims ? { width: coverDims.w, height: coverDims.h } : {})}
                                className="w-12 h-auto flex-none border border-gray-200"
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-900 leading-snug group-hover:text-nobilva-accent group-hover:underline">
                                  {book.title}
                                </span>
                                <span className="block text-xs text-gray-600 mt-1">{book.subtitle}</span>
                                <span className="block text-xs text-gray-500 mt-0.5">
                                  {book.credit}／Kindle版
                                </span>
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nobilva（ノビルバ）について */}
              {/* 本文中の面談 CTA (.cta-block-nobilva) と同じ構造（角丸なし・黄色の見出し帯・対角グラデ）。
                  CV 導線ではなく説明枠なので、背景は淡色・ボタンは白地にして面談 CTA より一段弱くする */}
              <aside className="relative mt-8 overflow-hidden bg-nobilva-light shadow-md">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom right, transparent 50%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.06) 100%)",
                  }}
                />
                <div className="relative flex flex-col gap-4 p-6 md:p-8">
                  <h2
                    className="m-0 bg-nobilva-main px-4 py-3 text-lg md:text-xl font-black leading-tight text-gray-900"
                    style={{ wordBreak: "keep-all" }}
                  >
                    Nobilva（ノビルバ）<wbr />について
                  </h2>
                  <p className="m-0 text-sm md:text-base leading-relaxed text-gray-700">
                    {NOBILVA_DEFINITION}
                  </p>
                  <Link
                    href={NOBILVA_SERVICE_URL}
                    className="self-center inline-flex items-center justify-center rounded-lg border-2 border-nobilva-accent bg-white px-6 py-3 text-sm md:text-base font-bold text-nobilva-accent shadow-sm transition-colors hover:bg-nobilva-accent hover:text-white"
                  >
                    サービスページを見る →
                  </Link>
                </div>
              </aside>
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
      {post.stickyCta && (
        <StickyMobileCTA
          consultTrack={`sticky_consult_${slug}`}
          lineTrack={`sticky_line_${slug}`}
        />
      )}
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
  };
}
