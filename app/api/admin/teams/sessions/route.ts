import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { Query, DocumentData } from 'firebase-admin/firestore';

/**
 * GET /api/admin/teams/sessions?slug=urayasu[&campaign=flyer-0517][&device=mobile][&limit=50]
 *
 * teamSessions コレクションから、指定チームのセッションサマリーを
 * 新しい順に返す。詳細（イベント時系列）は /sessions/[sessionId] 経由で取得する。
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const sp = request.nextUrl.searchParams;
  const slug = sp.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  const campaign = sp.get('campaign');
  const device = sp.get('device');
  const limit = Math.min(parseInt(sp.get('limit') || '50', 10) || 50, 200);

  const { firestore } = getFirebaseAdmin();
  let q: Query<DocumentData> = firestore
    .collection('teamSessions')
    .where('teamSlug', '==', slug);

  if (campaign) q = q.where('campaignSlug', '==', campaign);
  if (device) q = q.where('device', '==', device);

  q = q.orderBy('endedAt', 'desc').limit(limit);

  try {
    const snap = await q.get();
    const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ sessions });
  } catch (error) {
    // Firestore 複合インデックス未作成時はエラーメッセージに作成リンクが出る
    console.error('[Team Sessions] Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
