import { getAllPosts, getAllCategories, getAllTags } from "@/lib/blog";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsCard } from "@/components/cards/NewsCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NobilvaArticlesPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    tag?: string;
  }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const searchParams = await props.searchParams;

  const t = await getTranslations({ locale, namespace: "nobilva.articles" });
  const tNobilva = await getTranslations({ locale, namespace: "nobilva" });
  const posts = await getAllPosts(locale);

  // Filter Nobilva-related posts only
  let filteredPosts = posts.filter(
    (p) => p.relatedBusiness && p.relatedBusiness.includes("nobilva"),
  );

  // Get categories and tags from Nobilva posts
  const categories = Array.from(
    new Set(filteredPosts.map((p) => p.category).filter(Boolean)),
  );
  const tags = Array.from(new Set(filteredPosts.flatMap((p) => p.tags || [])));

  // Apply category filter
  if (searchParams.category) {
    filteredPosts = filteredPosts.filter(
      (p) => p.category === searchParams.category,
    );
  }

  // Apply tag filter
  if (searchParams.tag) {
    filteredPosts = filteredPosts.filter(
      (p) => searchParams.tag && p.tags.includes(searchParams.tag),
    );
  }

  return (
    <main className="min-h-screen bg-nobilva-light">
      <Section backgroundColor="transparent" padding="md">
        <Container>
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm text-gray-600">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="hover:text-nobilva-accent transition-colors"
                >
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href={`/${locale}/services/nobilva`}
                  className="hover:text-nobilva-accent transition-colors"
                >
                  Nobilva
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900">{t("title")}</li>
            </ol>
          </nav>

          <SectionHeader
            mainTitle={
              locale === "ja" ? t("title") : tNobilva("sections.articles")
            }
            theme="nobilva"
          />
          <p className="text-center text-text/80 text-base md:text-lg mb-12">
            {t("description")}
          </p>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-nobilva-accent">
                  {t("filter.allCategories")}:
                </span>
                <Link
                  href={`/${locale}/services/nobilva/articles`}
                  className={`px-4 py-2 rounded-none text-sm transition-colors ${
                    !searchParams.category
                      ? "bg-nobilva-accent text-white"
                      : "bg-white text-nobilva-accent hover:bg-nobilva-light border border-nobilva-accent"
                  }`}
                >
                  すべて
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/${locale}/services/nobilva/articles?category=${encodeURIComponent(
                      category,
                    )}`}
                    className={`px-4 py-2 rounded-none text-sm transition-colors ${
                      searchParams.category === category
                        ? "bg-nobilva-accent text-white"
                        : "bg-white text-nobilva-accent hover:bg-nobilva-light border border-nobilva-accent"
                    }`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}

            {/* Tag Filter */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-nobilva-accent">
                  {t("filter.allTags")}:
                </span>
                {tags.slice(0, 10).map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/services/nobilva/articles?tag=${encodeURIComponent(
                      tag,
                    )}`}
                    className={`px-3 py-1 rounded-none text-xs transition-colors ${
                      searchParams.tag === tag
                        ? "bg-nobilva-accent text-white"
                        : "bg-white text-nobilva-accent hover:bg-nobilva-light border border-nobilva-accent"
                    }`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <NewsCard
                key={post.slug}
                title={post.title}
                date={post.date}
                excerpt={post.description}
                thumbnailUrl={post.image}
                category={post.category}
                categoryType={post.categoryType}
                relatedBusiness={post.relatedBusiness}
                tags={post.tags}
                href={`/${locale}/blog/${post.slug}`}
                delay={index * 0.05}
                theme="nobilva"
              />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">{t("noArticles")}</p>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "nobilva.articles" });

  return {
    title: `${t("title")} - Nobilva`,
    description: t("description"),
  };
}
