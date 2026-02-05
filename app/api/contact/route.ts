import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/lib/i18n';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  inquiryType: z.string().min(1),
  message: z.string().min(10),
  privacy: z.boolean().refine((val) => val === true),
});

function getLocaleFromRequest(request: NextRequest): string {
  // URLからロケールを取得（例: /ja/contact, /en/contact）
  const pathname = request.nextUrl.pathname;
  const pathLocale = pathname.split('/')[1];
  
  if (locales.includes(pathLocale as any)) {
    return pathLocale;
  }
  
  // Accept-Languageヘッダーから取得
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // 簡易的な実装: 最初の言語コードを取得
    const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (locales.includes(lang as any)) {
      return lang;
    }
  }
  
  // デフォルトは日本語
  return 'ja';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const locale = getLocaleFromRequest(request);
    const t = await getTranslations({ locale, namespace: 'contact' });
    
    // Validation
    const validatedData = contactSchema.parse(body);

    // TODO: Implement email sending functionality
    // - Use SendGrid, Resend, or other email services
    // - Or use Firebase Functions for email sending
    console.log('Contact form submission:', validatedData);

    return NextResponse.json(
      { message: t('success') },
      { status: 200 }
    );
  } catch (error) {
    const locale = getLocaleFromRequest(request);
    const t = await getTranslations({ locale, namespace: 'contact' });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: t('error'), details: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: t('error') },
      { status: 500 }
    );
  }
}
