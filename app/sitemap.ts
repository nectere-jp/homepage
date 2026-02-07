import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { locales } from '@/i18n';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nectere.jp';

  // 各ロケールごとの静的ページ
  const staticRoutes = [
    { path: '', priority: 1, changeFrequency: 'monthly' as const },
    { path: '/company', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/services/nobilva', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services/nobilva/articles', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services/teachit', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
  ];

  const staticPages = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );

  // 各ロケールごとのブログ記事
  const allPosts = await getAllPosts();
  const blogPages = locales.flatMap((locale) => {
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
