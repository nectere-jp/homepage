import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export interface TeamStats {
  slug: string;
  pageViews: number;
  /** 面談・LINE をあわせた CTA クリック総数 */
  ctaClicks: number;
  consultClicks: number;
  lineClicks: number;
  signups: number;
  daily: Record<
    string,
    {
      pageViews: number;
      ctaClicks: number;
      consultClicks: number;
      lineClicks: number;
      signups: number;
    }
  >;
}

/**
 * CTA の種類を payload / ctaId から推定する。
 *  - payload.ctaType が入っていれば採用
 *  - 無ければ ctaId が `_line` で終わるかで判定（過去データ互換）
 */
function resolveCtaType(
  payloadCtaType: unknown,
  ctaId: unknown,
): 'consult' | 'line' {
  if (payloadCtaType === 'consult' || payloadCtaType === 'line') {
    return payloadCtaType;
  }
  if (typeof ctaId === 'string' && ctaId.endsWith('_line')) {
    return 'line';
  }
  return 'consult';
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const slug = request.nextUrl.searchParams.get('slug');
  // ?internal=all でテスト閲覧も含める。デフォルトは除外。
  const internalMode = request.nextUrl.searchParams.get('internal') ?? 'exclude';

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
    const isInternal = data.internal === true;
    if (internalMode === 'exclude' && isInternal) continue;
    if (internalMode === 'only' && !isInternal) continue;
    const s = data.slug as string;
    const event = data.event as string;
    const date = (data.date as string) || 'unknown';

    if (!statsMap.has(s)) {
      statsMap.set(s, {
        slug: s,
        pageViews: 0,
        ctaClicks: 0,
        consultClicks: 0,
        lineClicks: 0,
        signups: 0,
        daily: {},
      });
    }
    const stats = statsMap.get(s)!;

    if (!stats.daily[date]) {
      stats.daily[date] = {
        pageViews: 0,
        ctaClicks: 0,
        consultClicks: 0,
        lineClicks: 0,
        signups: 0,
      };
    }

    if (event === 'page_view') {
      stats.pageViews++;
      stats.daily[date].pageViews++;
    } else if (event === 'cta_click') {
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      const ctaType = resolveCtaType(payload.ctaType, payload.ctaId);
      stats.ctaClicks++;
      stats.daily[date].ctaClicks++;
      if (ctaType === 'line') {
        stats.lineClicks++;
        stats.daily[date].lineClicks++;
      } else {
        stats.consultClicks++;
        stats.daily[date].consultClicks++;
      }
    } else if (event === 'signup') {
      stats.signups++;
      stats.daily[date].signups++;
    }
  }

  const analytics = Array.from(statsMap.values());
  return NextResponse.json({ analytics });
}
