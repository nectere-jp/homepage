import { getAllPosts, getAllCategories, getAllTags } from "@/lib/blog";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsCard } from "@/components/cards/NewsCard";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BusinessProvider } from "@/contexts/BusinessContext";

export default async function BlogPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    tag?: string;
    type?: "article" | "press-release" | "other";
    business?: "translation" | "web-design" | "print" | "nobilva" | "teachit";
  }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const searchParams = await props.searchParams;

  const posts = await getAllPosts(locale);
  const categories = await getAllCategories(locale);
  const tags = await getAllTags(locale);

  // カテゴリータイプ、事業、カテゴリー、タグでフィルタ
  let filteredPosts = posts;

  if (searchParams.type) {
    filteredPosts = filteredPosts.filter(
      (p) => p.categoryType === searchParams.type,
    );
  }

  if (searchParams.business) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.relatedBusiness &&
        searchParams.business &&
        p.relatedBusiness.includes(searchParams.business),
    );
  }

  if (searchParams.category) {
    filteredPosts = filteredPosts.filter(
      (p) => p.category === searchParams.category,
    );
  }

  if (searchParams.tag) {
    filteredPosts = filteredPosts.filter(
      (p) => searchParams.tag && p.tags.includes(searchParams.tag),
    );
  }

  // 事業でフィルタリングされている場合、BusinessContextを設定
  const business = searchParams.business || null;

  return (
    <BusinessProvider business={business}>
      <main className="min-h-screen">
        <Section
          backgroundColor="white"
          padding="md"
          className="pt-24 md:pt-32"
        >
          <Container>
            <SectionHeader
              mainTitle={
                locale === "ja" ? "お役立ち情報とお知らせ" : "Blog"
              }
              accentTitle="Blog"
            />

            {/* フィルター */}
            <BlogFilters
              categories={categories}
              tags={tags}
              currentType={searchParams.type}
              currentBusiness={searchParams.business}
              currentCategory={searchParams.category}
              currentTag={searchParams.tag}
            />

            {/* 記事一覧 */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  href={`/blog/${post.slug}`}
                  delay={index * 50}
                />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">記事がありません</p>
              </div>
            )}
          </Container>
        </Section>
      </main>
    </BusinessProvider>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  return {
    title: "Blog - Nectere",
    description: "スポーツと勉強の両立に役立つ情報をお届けします。",
  };
}
