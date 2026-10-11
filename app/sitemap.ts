import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { INDEXABLE_LOCALES } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.nectere.jp';

  // /ja prefix を付けて出す静的ページ（サービス・法的・企業情報など）
  const localeStaticRoutes = [
    { path: '', priority: 1, changeFrequency: 'monthly' as const },
    { path: '/company', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/services/nobilva', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services/nobilva/articles', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services/nobilva/tokushoho', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/services/teachit', priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  const localeStaticPages = INDEXABLE_LOCALES.flatMap((locale) =>
    localeStaticRoutes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );

  // ブログは locale prefix なしを正規URLとする
  const blogIndex = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  };

  const allPosts = await getAllPosts();
  const jaPosts = allPosts.filter((post) => post.locale === 'ja');
  const blogPages = jaPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // adminパスは含めない（robots.tsで除外済み）
  return [...localeStaticPages, blogIndex, ...blogPages];
}
