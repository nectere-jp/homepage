import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createContactInquiry } from '@/lib/firebase/admin';
import { sendDiagnosisAdminEmail, sendDiagnosisAutoReplyEmail } from '@/lib/email';

const diagnosisSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  grade: z.string().min(1),
  club: z.string().min(1),
  concerns: z.array(z.string()),
  concernOther: z.string().optional(),
  careerDirection: z.string().optional(),
  source: z.string().optional(),
  scheduleSlots: z.array(z.string()),
  scheduleCustom: z.string().optional(),
  noSlotAvailable: z.boolean().optional(),
});

export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = diagnosisSchema.parse(body);

    // 診断データを構造化メッセージとしてFirestoreに保存
    const messageParts = [
      `【学年】${data.grade}`,
      `【野球の所属】${data.club}`,
      `【お悩み】${[...data.concerns, data.concernOther].filter(Boolean).join('、') || '未入力'}`,
      `【志望進路】${data.careerDirection || '未入力'}`,
      `【きっかけ】${data.source || '未入力'}`,
      `【希望日時】${data.noSlotAvailable ? `候補なし: ${data.scheduleCustom}` : data.scheduleSlots.join(' / ')}`,
    ];

    const savedContact = await createContactInquiry({
      name: data.name,
      email: data.email,
      phone: data.phone,
      inquiryType: 'nobilva-diagnosis',
      message: messageParts.join('\n'),
    });
    console.log('[Diagnosis] Firestore saved:', savedContact.id);

    // メール送信（並列）
    const [adminResult, autoReplyResult] = await Promise.allSettled([
      sendDiagnosisAdminEmail(data),
      sendDiagnosisAutoReplyEmail(data),
    ]);
    if (adminResult.status === 'rejected') {
      console.error('[Diagnosis] Admin notification failed:', adminResult.reason);
    }
    if (autoReplyResult.status === 'rejected') {
      console.error('[Diagnosis] Auto-reply failed:', autoReplyResult.reason);
    }

    return NextResponse.json({ message: 'お申し込みを受け付けました。' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: error.errors },
        { status: 400 },
      );
    }
    console.error('[Diagnosis] Unhandled error:', error instanceof Error ? { message: error.message, stack: error.stack } : error);
    return NextResponse.json({ error: '送信に失敗しました。しばらく経ってから再度お試しください。' }, { status: 500 });
  }
}
