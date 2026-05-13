export const NAV_ITEMS = [
  { key: 'services', href: '/#business' },
  { key: 'company', href: '/company' },
  { key: 'news', href: '/blog' },
  { key: 'contact', href: '/contact' },
] as const;

export const NOBILVA_NAV_ITEMS = [
  { key: 'solution', href: '/services/nobilva#how-we-work' },
  { key: 'pricing', href: '/services/nobilva#pricing' },
  { key: 'careerPath', href: '/services/nobilva/career-path' },
  { key: 'forTeams', href: '/services/nobilva/for-teams' },
  { key: 'faq', href: '/services/nobilva#faq' },
] as const;

export const TEACHIT_NAV_ITEMS = [
  { key: 'solution', href: '/services/teachit#features' },
  { key: 'flow', href: '/services/teachit#flow' },
  { key: 'faq', href: '/services/teachit#faq' },
  { key: 'contact', href: '/services/teachit#contact' },
] as const;

export const LEGAL_ITEMS = [
  { key: 'privacyPolicy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
] as const;

/** Nobilva ページ用：特定商取引法に基づく表記を追加 */
export const NOBILVA_LEGAL_ITEMS = [
  ...LEGAL_ITEMS,
  { key: 'tokushoho' as const, href: '/services/nobilva/tokushoho' },
] as const;

export type NavItemKey = (typeof NAV_ITEMS)[number]['key'] | (typeof NOBILVA_NAV_ITEMS)[number]['key'] | (typeof TEACHIT_NAV_ITEMS)[number]['key'];
export type LegalItemKey = (typeof LEGAL_ITEMS)[number]['key'];
