import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const trackSchema = z.object({
  slug: z.string().min(1),
  event: z.enum(['page_view', 'cta_click', 'signup']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, event } = trackSchema.parse(body);

    const { firestore } = getFirebaseAdmin();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // "2026-05-21"

    await firestore.collection('teamEvents').add({
      slug,
      event,
      date: dateStr,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('[Team Track] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
