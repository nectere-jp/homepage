'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Container } from './layout/Container';
import { NAV_ITEMS, LEGAL_ITEMS, NOBILVA_LEGAL_ITEMS, NOBILVA_NAV_ITEMS, TEACHIT_NAV_ITEMS } from '@/lib/navigation';
import { useBusiness } from '@/contexts/BusinessContext';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const { business } = useBusiness();

  const isNobilva = pathname?.includes('/services/nobilva') || business === 'nobilva';
  const isTeachIt = pathname?.includes('/services/teachit') || business === 'teachit';
  const navItems = isNobilva ? NOBILVA_NAV_ITEMS : isTeachIt ? TEACHIT_NAV_ITEMS : NAV_ITEMS;
  const headerT = useTranslations('header');

  return (
    <footer className="bg-white border-t border-gray-200">
      <Container className="py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12 mx-8 md:mx-16 lg:mx-24">
          {/* ロゴ（左側） */}
          <div className="flex-shrink-0">
            <Link href={`/${locale}${isNobilva ? '/services/nobilva' : isTeachIt ? '/services/teachit' : ''}`} className="flex items-center">
              {isTeachIt ? (
                <span className="text-3xl md:text-4xl font-black text-teachit-main">
                  Teach It
                </span>
              ) : (
                <div
                  className={`relative h-10 md:h-12 shrink-0 ${
                    isNobilva ? "w-[135px] md:w-[180px]" : "w-[120px] md:w-[150px]"
                  }`}
                >
                  <Image
                    src={isNobilva ? "/images/logo_nobilva.png" : "/images/logo.png"}
                    alt={isNobilva ? "Nobilva" : "Nectere"}
                    fill
                    sizes="(min-width: 768px) 180px, 150px"
                    className="object-contain object-left"
                  />
                </div>
              )}
            </Link>
          </div>

          {/* メニュー（右側） */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="text-left">
              <h3 className={`text-lg font-bold mb-4 ${isNobilva ? 'text-blue' : 'text-blue'}`}>{t('sitemap')}</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className={`transition-colors ${
                        isNobilva ? 'text-text hover:text-nobilva-accent' : isTeachIt ? 'text-text hover:text-teachit-accent' : 'text-text hover:text-pink'
                      }`}
                    >
                      {(isNobilva || isTeachIt) ? headerT(item.key as any) : t(item.key as any)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-left">
              <h3 className={`text-lg font-bold mb-4 ${isNobilva ? 'text-blue' : 'text-blue'}`}>{t('legal')}</h3>
              <ul className="space-y-2">
                {(isNobilva ? NOBILVA_LEGAL_ITEMS : LEGAL_ITEMS).map((item) => (
                  <li key={item.key}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className={`transition-colors ${
                        isNobilva ? 'text-text hover:text-nobilva-accent' : isTeachIt ? 'text-text hover:text-teachit-accent' : 'text-text hover:text-pink'
                      }`}
                    >
                      {t(item.key as any)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 text-center text-gray-600 text-xs mx-8 md:mx-16 lg:mx-24">
          {(isNobilva || isTeachIt) && (
            <div className="mb-4 flex flex-col items-center gap-2">
              <div className="text-text/70 text-sm mb-1">{t('operatedBy')}</div>
              <Link href={`/${locale}`} className="inline-block">
                <div className="relative h-8 w-[96px] shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="Nectere"
                    fill
                    sizes="96px"
                    className="object-contain object-left opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              </Link>
            </div>
          )}
          {t('copyright')}
        </div>
      </Container>
    </footer>
  );
}
