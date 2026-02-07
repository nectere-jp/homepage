import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales } from './i18n';

const middleware = createMiddleware({
  locales,
  defaultLocale: 'ja',
  localePrefix: 'always',
});

export default function proxy(request: NextRequest) {
  return middleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
