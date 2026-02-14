import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ja',
  localePrefix: 'always',
});

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  // リダイレクトの場合はそのまま返す
  if (response.status >= 300 && response.status < 400) {
    return response;
  }
  // サーバー（root layout）で html lang を正しく出すため locale をヘッダーで渡す
  const pathname = request.nextUrl.pathname;
  const segment = pathname.split('/').filter(Boolean)[0];
  const locale = segment && locales.includes(segment as (typeof locales)[number]) ? segment : 'ja';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-locale', locale);
  const newResponse = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.forEach((value, key) => newResponse.headers.set(key, value));
  return newResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
