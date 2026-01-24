import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-blue text-lg font-bold mb-4">{t('companyInfo')}</h3>
            <p className="text-gray-600 mb-2">Nectere</p>
            <p className="text-gray-600 text-sm">
              {t('address')}: [要確認]
            </p>
            <p className="text-gray-600 text-sm">
              {t('phone')}: [要確認]
            </p>
            <p className="text-gray-600 text-sm">
              {t('email')}: [要確認]
            </p>
          </div>

          <div>
            <h3 className="text-blue text-lg font-bold mb-4">{t('sitemap')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/#services`} className="text-gray-600 hover:text-pink transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/#mission`} className="text-gray-600 hover:text-pink transition-colors">
                  Mission
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/company`} className="text-gray-600 hover:text-pink transition-colors">
                  Company
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/news`} className="text-gray-600 hover:text-pink transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-600 hover:text-pink transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-600 hover:text-pink transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-600 hover:text-pink transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          {t('copyright')}
        </div>
      </div>
    </footer>
  );
}
