import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * 単一記事の詳細分析 API。
 *  - 日次 PV / UU（折れ線）
 *  - スクロール深度のヒストグラム（0-20 / 20-40 / 40-60 / 60-80 / 80-100）
 *  - 流入元内訳
 *  - CTA クリック内訳（cta_id ごと）
 */

export interface PostDetailAnalytics {
  slug: string;
  days: number;
  totals: {
    pageViews: number;
    uniqueSessions: number;
    avgScrollDepth: number;
    ctaClicks: number;
  };
  daily: Array<{ date: string; pageViews: number; uniqueSessions: number }>;
  scrollHistogram: Array<{ bucket: string; count: number }>;
  sources: Array<{ source: string; sessions: number }>;
  ctaBreakdown: Array<{ ctaId: string; clicks: number }>;
}

const BLOG_PATH_RE = /^\/(?:ja\/|en\/|de\/)?blog\/([^/?#]+)/;

const CTA_EVENT_TYPES = new Set([
  'cta_click',
  'cta_diagnosis_click',
  'cta_line_click',
  'cta_kindle_click',
]);

function classifyReferrer(referrer: string | undefined): string {
  if (!referrer) return '直接アクセス';
  if (/google\./i.test(referrer)) return 'Google検索';
  if (/yahoo\./i.test(referrer)) return 'Yahoo検索';
  if (/bing\./i.test(referrer)) return 'Bing検索';
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

function bucketFor(pct: number): string {
  if (pct <= 20) return '0-20%';
  if (pct <= 40) return '21-40%';
  if (pct <= 60) return '41-60%';
  if (pct <= 80) return '61-80%';
  return '81-100%';
}

const BUCKETS = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { slug: targetSlug } = await params;
  const { searchParams } = request.nextUrl;
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 1), 365);
  const internalFilter =
    (searchParams.get('internal') || 'exclude') as 'exclude' | 'only' | 'all';

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('nobilvaAnalytics')
    .where('date', '>=', startDateStr)
    .limit(100000)
    .get();

  let pageViews = 0;
  let ctaClicks = 0;
  let scrollSum = 0;
  let scrollCount = 0;
  const sessions = new Set<string>();
  const daily = new Map<string, { pageViews: number; sessions: Set<string> }>();
  const scrollHistogram = new Map<string, number>();
  const sources = new Map<string, Set<string>>(); // source → sessionIds
  const ctaMap = new Map<string, number>();
  // session → referrer（最初に見かけたものを採用）
  const sessionReferrer = new Map<string, string>();
  const sessionRef = new Map<string, string>();

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const isInternal = d.internal === true;
    if (internalFilter === 'exclude' && isInternal) continue;
    if (internalFilter === 'only' && !isInternal) continue;

    const path = d.path as string | undefined;
    const m = path?.match(BLOG_PATH_RE);
    const slug = m?.[1];
    if (slug !== targetSlug) continue;

    const eventType = d.eventType as string;
    const date = (d.date as string) || 'unknown';
    const sessionId = d.sessionId as string | undefined;

    if (sessionId) {
      sessions.add(sessionId);
      const refCode = d.ref as string | undefined;
      const referrer = d.referrer as string | undefined;
      if (refCode && !sessionRef.has(sessionId)) sessionRef.set(sessionId, refCode);
      if (referrer && !sessionReferrer.has(sessionId)) sessionReferrer.set(sessionId, referrer);
    }

    if (eventType === 'page_view') {
      pageViews++;
      if (!daily.has(date)) daily.set(date, { pageViews: 0, sessions: new Set() });
      const bucket = daily.get(date)!;
      bucket.pageViews++;
      if (sessionId) bucket.sessions.add(sessionId);
    } else if (CTA_EVENT_TYPES.has(eventType)) {
      ctaClicks++;
      const ctaId = (d.section as string | undefined) || 'unknown';
      ctaMap.set(ctaId, (ctaMap.get(ctaId) ?? 0) + 1);
    } else if (eventType === 'scroll_depth') {
      const pct = d.scrollPercent as number | undefined;
      if (typeof pct === 'number' && pct > 0) {
        const clipped = Math.min(100, Math.max(0, pct));
        scrollSum += clipped;
        scrollCount++;
        const b = bucketFor(clipped);
        scrollHistogram.set(b, (scrollHistogram.get(b) ?? 0) + 1);
      }
    }
  }

  // sessionReferrer / sessionRef → source 集計
  for (const sid of sessions) {
    const refCode = sessionRef.get(sid);
    const referrer = sessionReferrer.get(sid);
    const source = refCode ? `ref:${refCode}` : classifyReferrer(referrer);
    if (!sources.has(source)) sources.set(source, new Set());
    sources.get(source)!.add(sid);
  }

  // 期間を埋めた日次配列（グラフのギャップ防止）
  const dailyArray: PostDetailAnalytics['daily'] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const b = daily.get(date);
    dailyArray.push({
      date,
      pageViews: b?.pageViews ?? 0,
      uniqueSessions: b?.sessions.size ?? 0,
    });
  }

  return NextResponse.json({
    slug: targetSlug,
    days,
    totals: {
      pageViews,
      uniqueSessions: sessions.size,
      avgScrollDepth: scrollCount > 0 ? Math.round(scrollSum / scrollCount) : 0,
      ctaClicks,
    },
    daily: dailyArray,
    scrollHistogram: BUCKETS.map((b) => ({ bucket: b, count: scrollHistogram.get(b) ?? 0 })),
    sources: Array.from(sources.entries())
      .map(([source, s]) => ({ source, sessions: s.size }))
      .sort((a, b) => b.sessions - a.sessions),
    ctaBreakdown: Array.from(ctaMap.entries())
      .map(([ctaId, clicks]) => ({ ctaId, clicks }))
      .sort((a, b) => b.clicks - a.clicks),
  } satisfies PostDetailAnalytics);
}
