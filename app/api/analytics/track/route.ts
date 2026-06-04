import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const eventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'section_view',
    'cta_click',
    'diagnosis_start',
    'diagnosis_step',
    'diagnosis_complete',
  ]),
  path: z.string().min(1),
  section: z.string().optional(),
  diagnosisStep: z.string().optional(),
  sessionId: z.string().min(1),
  screenWidth: z.number(),
  // UTM & attribution
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  ref: z.string().optional(),
  team: z.string().optional(),
  referrer: z.string().optional(),
});

/** 複数イベントを一括送信できるバッチ対応 */
const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = batchSchema.parse(body);

    const { firestore } = getFirebaseAdmin();
    const userAgent = request.headers.get('user-agent') || '';
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    // bot の簡易除外
    if (/bot|crawl|spider|slurp|lighthouse/i.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const batch = firestore.batch();
    const col = firestore.collection('nobilvaAnalytics');

    for (const event of events) {
      const docRef = col.doc();
      // undefined のフィールドは Firestore に書き込まれないよう除去
      const data: Record<string, unknown> = {
        eventType: event.eventType,
        path: event.path,
        sessionId: event.sessionId,
        screenWidth: event.screenWidth,
        userAgent,
        date: dateStr,
        createdAt: Timestamp.now(),
      };
      if (event.section) data.section = event.section;
      if (event.diagnosisStep) data.diagnosisStep = event.diagnosisStep;
      if (event.utmSource) data.utmSource = event.utmSource;
      if (event.utmMedium) data.utmMedium = event.utmMedium;
      if (event.utmCampaign) data.utmCampaign = event.utmCampaign;
      if (event.utmContent) data.utmContent = event.utmContent;
      if (event.utmTerm) data.utmTerm = event.utmTerm;
      if (event.ref) data.ref = event.ref;
      if (event.team) data.team = event.team;
      if (event.referrer) data.referrer = event.referrer;

      batch.set(docRef, data);
    }

    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    console.error('[Analytics] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
