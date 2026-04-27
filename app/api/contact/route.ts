import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { locales } from '@/i18n';
import { createContactInquiry } from '@/lib/firebase/admin';
import { sendAdminNotificationEmail, sendAutoReplyEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  inquiryType: z.string().min(1),
  message: z.string().min(10),
  privacy: z.boolean().refine((val) => val === true),
});

/** APIルートでは next-intl のミドルウェアが動かないため、メッセージを直接読み込む */
async function getContactMessages(locale: string): Promise<{ success: string; error: string }> {
  const safeLocale = locales.includes(locale as (typeof locales)[number]) ? locale : 'ja';
  const messages = (await import(`@/messages/${safeLocale}.json`)).default as {
    contact?: { success?: string; error?: string };
  };
  const contact = messages?.contact;
  return {
    success: contact?.success ?? 'Thank you for your inquiry. We will contact you soon.',
    error: contact?.error ?? 'Failed to send. Please try again.',
  };
}

function getLocaleFromRequest(request: NextRequest): string {
  const bodyLocale = request.nextUrl.searchParams.get('locale');
  if (bodyLocale && locales.includes(bodyLocale as (typeof locales)[number])) {
    return bodyLocale;
  }
  const pathname = request.nextUrl.pathname;
  const pathLocale = pathname.split('/')[1];
  if (locales.includes(pathLocale as (typeof locales)[number])) {
    return pathLocale;
  }
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (locales.includes(lang as (typeof locales)[number])) {
      return lang;
    }
  }
  return 'ja';
}

export async function POST(request: NextRequest) {
  let locale = getLocaleFromRequest(request);
  try {
    const body = await request.json();
    if (typeof body?.locale === 'string' && locales.includes(body.locale as (typeof locales)[number])) {
      locale = body.locale;
    }
    const messages = await getContactMessages(locale);

    // Validation（locale はスキーマに含めない）
    const { locale: _locale, ...rest } = body as Record<string, unknown> & { locale?: string };
    const validatedData = contactSchema.parse(rest);

    // Firestoreに保存
    const contactData = {
      name: validatedData.name,
      email: validatedData.email,
      company: validatedData.company,
      phone: validatedData.phone,
      inquiryType: validatedData.inquiryType,
      message: validatedData.message,
    };

    console.log('[Contact] Step 1: Starting Firestore save...');
    const savedContact = await createContactInquiry(contactData);
    console.log('[Contact] Step 2: Firestore saved:', savedContact.id);

    // メール送信（並列実行、各結果を個別にログ）
    const [adminResult, autoReplyResult] = await Promise.allSettled([
      sendAdminNotificationEmail(contactData),
      sendAutoReplyEmail(contactData),
    ]);
    if (adminResult.status === 'rejected') {
      console.error('[Contact] Admin notification failed:', adminResult.reason);
    }
    if (autoReplyResult.status === 'rejected') {
      console.error('[Contact] Auto-reply failed:', autoReplyResult.reason);
    }
    if (adminResult.status === 'fulfilled' && autoReplyResult.status === 'fulfilled') {
      console.log('Emails sent successfully');
    }

    return NextResponse.json(
      { message: messages.success },
      { status: 200 }
    );
  } catch (error) {
    const messages = await getContactMessages(locale);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: messages.error, details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Contact] Unhandled error:', error instanceof Error ? { message: error.message, stack: error.stack } : error);
    return NextResponse.json(
      { error: messages.error },
      { status: 500 }
    );
  }
}
