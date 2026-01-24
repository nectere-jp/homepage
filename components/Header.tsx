'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { motion } from 'framer-motion';

export function Header() {
  const t = useTranslations('header');
  const locale = useLocale();

  const navItems = [
    { key: 'services', href: `/${locale}/#services` },
    { key: 'mission', href: `/${locale}/#mission` },
    { key: 'roadmap', href: `/${locale}/#roadmap` },
    { key: 'company', href: `/${locale}/company` },
    { key: 'news', href: `/${locale}/news` },
    { key: 'contact', href: `/${locale}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-blue text-2xl font-bold">
            Nectere
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-gray-700 hover:text-pink transition-colors font-medium"
              >
                {t(item.key as any)}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
