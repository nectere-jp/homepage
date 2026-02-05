import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default async function BlogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string; tag?: string };
}) {
  unstable_setRequestLocale(locale);

  const posts = await getAllPosts(locale);
  const categories = await getAllCategories(locale);
  const tags = await getAllTags(locale);

  // カテゴリーまたはタグでフィルタ
  let filteredPosts = posts;
  if (searchParams.category) {
    filteredPosts = posts.filter(p => p.category === searchParams.category);
  } else if (searchParams.tag) {
    filteredPosts = posts.filter(p => p.tags.includes(searchParams.tag));
  }

  return (
    <main className="min-h-screen">
      <Section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            title="Blog"
            subtitle="お役立ち情報とお知らせ"
          />

          {/* カテゴリーフィルター */}
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !searchParams.category && !searchParams.tag
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </Link>
            {categories.map(category => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchParams.category === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </Link>
            ))}
          </div>

          {/* 記事一覧 */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="h-full bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
                  {post.image && (
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            {post.category}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">記事がありません</p>
            </div>
          )}

          {/* タグクラウド */}
          {tags.length > 0 && (
            <div className="mt-16">
              <h3 className="text-lg font-bold text-gray-900 mb-4">タグ</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-primary hover:text-white transition-colors"
                  >
                    #{tag}
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

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return {
    title: 'Blog - Nectere',
    description: 'スポーツと勉強の両立に役立つ情報をお届けします。',
  };
}
