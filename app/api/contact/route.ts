import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  inquiryType: z.string().min(1),
  message: z.string().min(10),
  privacy: z.boolean().refine((val) => val === true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = contactSchema.parse(body);

    // 将来的にメール送信機能を実装
    // 現時点ではログ出力
    console.log('Contact form submission:', validatedData);

    // TODO: メール送信機能の実装
    // - SendGrid、Resend、またはその他のメールサービスを使用
    // - またはFirebase Functionsを使用してメール送信

    return NextResponse.json(
      { message: 'お問い合わせを受け付けました。ありがとうございます。' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
