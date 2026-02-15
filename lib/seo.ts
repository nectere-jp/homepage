/**
 * SEO用ヘルパー（hreflang / alternates）
 * 日本を主軸にした多言語サイトで、検索エンジンに言語別URLを正しく伝える
 */

import { locales } from '@/i18n';

/** サイトの正規ベースURL（sitemap・robotsと統一） */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://nectere.jp';

/** sitemap に含め・検索結果に出すロケール（ja のみ） */
export const INDEXABLE_LOCALES = ['ja'] as const;

/**
 * 指定パスに対する正規（canonical）URL（常に ja 版）
 * @param path - ロケールを含まないパス（'' はトップ、'/company' など）
 */
export function getCanonicalUrl(path: string): string {
  const normalized = path === '' || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}/ja${normalized}`;
}

/**
 * 指定パスに対する各言語の絶対URLを返す（metadata.alternates.languages 用）
 * x-default は ja の URL を指す
 * @param path - ロケールを含まないパス（'' はトップ、'/company' など）
 */
export function getAlternatesLanguages(path: string): Record<string, string> {
  const normalized = path === '' || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const languages = Object.fromEntries(
    locales.map((locale) => [
      locale,
      `${BASE_URL}/${locale}${normalized}`,
    ])
  ) as Record<string, string>;
  languages['x-default'] = `${BASE_URL}/ja${normalized}`;
  return languages;
}
