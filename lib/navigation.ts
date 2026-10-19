export const NAV_ITEMS = [
  { key: 'services', href: '/#business' },
  { key: 'company', href: '/company' },
  { key: 'news', href: '/blog', absolute: true },
  { key: 'contact', href: '/contact' },
] as const;

export const NOBILVA_NAV_ITEMS = [
  { key: 'top', href: '/services/nobilva' },
  { key: 'solution', href: '/services/nobilva/how-it-works' },
  { key: 'forTeams', href: '/services/nobilva/for-teams' },
  { key: 'faq', href: '/services/nobilva/faq' },
] as const;

/**
 * フッターの法的情報。Nectere サイト全体のフッターは「法務情報」1 項目に集約し、
 * 個別文書は /legal 一覧から辿る形。
 */
export const LEGAL_ITEMS = [
  { key: 'legalIndex', href: '/legal' },
] as const;

/**
 * Nobilva ページ用のフッター。申込みをするページから、プライバシーポリシー・利用規約・
 * 特定商取引法に基づく表記への直接リンクを提供する（特商法第 11 条の表示義務に対応）。
 */
export const NOBILVA_LEGAL_ITEMS = [
  { key: 'privacyPolicy' as const, href: '/legal/privacy-policy#nobilva' },
  { key: 'terms' as const, href: '/legal/nobilva/terms-of-service' },
  { key: 'tokushoho' as const, href: '/legal/nobilva/commercial-disclosure' },
  { key: 'legalIndex' as const, href: '/legal' },
] as const;

export type NavItemKey = (typeof NAV_ITEMS)[number]['key'] | (typeof NOBILVA_NAV_ITEMS)[number]['key'];
export type LegalItemKey = (typeof LEGAL_ITEMS)[number]['key'] | 'tokushoho' | 'privacyPolicy' | 'terms';
