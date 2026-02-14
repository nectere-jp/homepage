/**
 * SEO用ヘルパー（hreflang / alternates）
 * 日本を主軸にした多言語サイトで、検索エンジンに言語別URLを正しく伝える
 */

import { locales } from '@/i18n';

/** サイトの正規ベースURL（sitemap・robotsと統一） */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://nectere.jp';

/**
 * 指定パスに対する各言語の絶対URLを返す（metadata.alternates.languages 用）
 * @param path - ロケールを含まないパス（'' はトップ、'/company' など）
 */
export function getAlternatesLanguages(path: string): Record<string, string> {
  const normalized = path === '' || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      `${BASE_URL}/${locale}${normalized}`,
    ])
  ) as Record<string, string>;
}
