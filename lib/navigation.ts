export const NAV_ITEMS = [
  { key: 'services', href: '/#business' },
  { key: 'company', href: '/company' },
  { key: 'news', href: '/blog' },
  { key: 'contact', href: '/contact' },
] as const;

export const NOBILVA_NAV_ITEMS = [
  { key: 'solution', href: '/services/nobilva#features' },
  { key: 'pricing', href: '/services/nobilva#pricing' },
  { key: 'comparison', href: '/services/nobilva#comparison' },
  { key: 'flow', href: '/services/nobilva#flow' },
  { key: 'caseStudy', href: '/services/nobilva#case-study' },
  { key: 'contact', href: '/services/nobilva#contact' },
  { key: 'faq', href: '/services/nobilva#faq' },
  { key: 'articles', href: '/services/nobilva#articles' },
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

export type NavItemKey = (typeof NAV_ITEMS)[number]['key'] | (typeof NOBILVA_NAV_ITEMS)[number]['key'] | (typeof TEACHIT_NAV_ITEMS)[number]['key'];
export type LegalItemKey = (typeof LEGAL_ITEMS)[number]['key'];
