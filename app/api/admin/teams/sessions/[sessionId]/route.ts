import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * GET /api/admin/teams/sessions/[sessionId]
 *
 * teamSessions のサマリーと、同じ sessionId で記録された teamEvents の
 * 時系列を返す。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  const { firestore } = getFirebaseAdmin();

  try {
    const sessionDoc = await firestore
      .collection('teamSessions')
      .doc(sessionId)
      .get();

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const eventsSnap = await firestore
      .collection('teamEvents')
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt', 'asc')
      .get();

    const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      session: { id: sessionDoc.id, ...sessionDoc.data() },
      events,
    });
  } catch (error) {
    console.error('[Team Session Detail] Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
