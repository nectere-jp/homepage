import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export interface TeamStats {
  slug: string;
  pageViews: number;
  ctaClicks: number;
  signups: number;
  daily: Record<string, { pageViews: number; ctaClicks: number; signups: number }>;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const slug = request.nextUrl.searchParams.get('slug');

  const { firestore } = getFirebaseAdmin();
  let query = firestore.collection('teamEvents').orderBy('createdAt', 'desc');
  if (slug) {
    query = query.where('slug', '==', slug) as typeof query;
  }
  // Limit to last 10000 events for safety
  query = query.limit(10000) as typeof query;

  const snapshot = await query.get();

  // Aggregate by slug
  const statsMap = new Map<string, TeamStats>();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const s = data.slug as string;
    const event = data.event as string;
    const date = (data.date as string) || 'unknown';

    if (!statsMap.has(s)) {
      statsMap.set(s, { slug: s, pageViews: 0, ctaClicks: 0, signups: 0, daily: {} });
    }
    const stats = statsMap.get(s)!;

    if (event === 'page_view') stats.pageViews++;
    else if (event === 'cta_click') stats.ctaClicks++;
    else if (event === 'signup') stats.signups++;

    if (!stats.daily[date]) {
      stats.daily[date] = { pageViews: 0, ctaClicks: 0, signups: 0 };
    }
    if (event === 'page_view') stats.daily[date].pageViews++;
    else if (event === 'cta_click') stats.daily[date].ctaClicks++;
    else if (event === 'signup') stats.daily[date].signups++;
  }

  const analytics = Array.from(statsMap.values());
  return NextResponse.json({ analytics });
}
