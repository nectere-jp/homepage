'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/lib/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const isNobilva = pathname?.includes('/services/nobilva');
  const isTeachIt = pathname?.includes('/services/teachit');

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 text-sm font-medium transition-colors ${
            locale === loc
              ? isNobilva 
                ? 'text-nobilva-accent border-b-2 border-nobilva-accent' 
                : isTeachIt
                ? 'text-teachit-accent border-b-2 border-teachit-accent'
                : 'text-pink border-b-2 border-pink'
              : isNobilva 
                ? 'text-blue hover:text-nobilva-accent' 
                : isTeachIt
                ? 'text-blue hover:text-teachit-accent'
                : 'text-text hover:text-pink'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
