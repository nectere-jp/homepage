import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { INDEXABLE_LOCALES } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nectere.jp';

  // インデックス対象ロケール（ja）のみの静的ページ
  const staticRoutes = [
    { path: '', priority: 1, changeFrequency: 'monthly' as const },
    { path: '/company', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/services/nobilva', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services/nobilva/articles', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services/teachit', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
  ];

  const staticPages = INDEXABLE_LOCALES.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );

  // インデックス対象ロケール（ja）のみのブログ記事
  const allPosts = await getAllPosts();
  const blogPages = INDEXABLE_LOCALES.flatMap((locale) => {
    const localePosts = allPosts.filter((post) => post.locale === locale);
    return localePosts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  });

  // adminパスは含めない（robots.tsで除外済み）
  return [...staticPages, ...blogPages];
}
