import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const trackSchema = z.object({
  slug: z.string().min(1),
  event: z.enum([
    'page_view',
    'cta_click',
    'cta_click_outbound',
    'section_view',
    'scroll_depth',
    'session_end',
    'invalid_campaign',
    'signup',
  ]),
  sessionId: z.string().optional(),
  campaignSlug: z.string().nullish(),
  payload: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, event, sessionId, campaignSlug, payload } =
      trackSchema.parse(body);

    const { firestore } = getFirebaseAdmin();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    const doc: Record<string, unknown> = {
      slug,
      event,
      date: dateStr,
      createdAt: Timestamp.now(),
    };
    if (sessionId) doc.sessionId = sessionId;
    if (campaignSlug) doc.campaignSlug = campaignSlug;
    if (payload) doc.payload = payload;

    await firestore.collection('teamEvents').add(doc);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('[Team Track] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
