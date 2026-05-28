import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createContactInquiry, getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendDiagnosisAdminEmail, sendDiagnosisAutoReplyEmail } from '@/lib/email';

const diagnosisSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  grade: z.string().min(1),
  club: z.string().min(1),
  concerns: z.array(z.string()),
  concernOther: z.string().optional(),
  careerDirections: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  scheduleSlots: z.array(z.string()),
  scheduleCustom: z.string().optional(),
  noSlotAvailable: z.boolean().optional(),
  teamSlug: z.string().optional(),
});

export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = diagnosisSchema.parse(body);

    // フロントから配列で受け取ったものを文字列に結合
    const careerDirection = data.careerDirections?.join('、') || undefined;
    const source = data.sources?.join('、') || undefined;

    // 診断データを構造化メッセージとしてFirestoreに保存
    const messageParts = [
      `【学年】${data.grade}`,
      `【野球の所属】${data.club}`,
      `【お悩み】${[...data.concerns, data.concernOther].filter(Boolean).join('、') || '未入力'}`,
      `【志望進路】${careerDirection || '未入力'}`,
      `【きっかけ】${source || '未入力'}`,
      `【希望日時】${data.noSlotAvailable ? `候補なし: ${data.scheduleCustom}` : data.scheduleSlots.join(' / ')}`,
      ...(data.teamSlug ? [`【チーム経由】${data.teamSlug}`] : []),
    ];

    const savedContact = await createContactInquiry({
      name: data.name,
      email: data.email,
      ...(data.phone ? { phone: data.phone } : {}),
      inquiryType: 'nobilva-diagnosis',
      message: messageParts.join('\n'),
    });
    console.log('[Diagnosis] Firestore saved:', savedContact.id);

    // メール送信（並列）— email関数はcareerDirection/source（単数・文字列）を期待
    const emailData = { ...data, careerDirection, source };
    const [adminResult, autoReplyResult] = await Promise.allSettled([
      sendDiagnosisAdminEmail(emailData),
      sendDiagnosisAutoReplyEmail(emailData),
    ]);
    if (adminResult.status === 'rejected') {
      console.error('[Diagnosis] Admin notification failed:', adminResult.reason);
    }
    if (autoReplyResult.status === 'rejected') {
      console.error('[Diagnosis] Auto-reply failed:', autoReplyResult.reason);
    }

    // チーム経由の場合は signup イベントを記録
    if (data.teamSlug) {
      const { firestore } = getFirebaseAdmin();
      const now = new Date();
      await firestore.collection('teamEvents').add({
        slug: data.teamSlug,
        event: 'signup',
        date: now.toISOString().slice(0, 10),
        createdAt: Timestamp.now(),
      });
      console.log('[Diagnosis] Team signup tracked:', data.teamSlug);
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
