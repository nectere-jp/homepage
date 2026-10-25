import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * 全記事を 1 リクエストで集計する分析 API。
 * nobilvaAnalytics を期間で絞り、path から記事 slug を抽出して集約する。
 *
 * 返却フィールド:
 *  - pageViews: 期間内の page_view 件数
 *  - uniqueSessions: ユニークセッション数
 *  - avgScrollDepth: 送信された scroll_depth の平均（各セッションの max 値の平均）
 *  - ctaClicks: cta_click 系の合計
 *  - daily: 日次 PV（スパークライン用）
 */

export interface PostAnalyticsRow {
  slug: string;
  pageViews: number;
  uniqueSessions: number;
  avgScrollDepth: number;
  ctaClicks: number;
  daily: Array<{ date: string; pageViews: number }>;
}

export interface PostAnalyticsResponse {
  days: number;
  startDate: string;
  rows: PostAnalyticsRow[];
}

const BLOG_PATH_RE = /^\/(?:ja\/|en\/|de\/)?blog\/([^/?#]+)/;

function slugFromPath(path: string | undefined): string | null {
  if (!path) return null;
  const m = path.match(BLOG_PATH_RE);
  return m?.[1] ?? null;
}

const CTA_EVENT_TYPES = new Set([
  'cta_click',
  'cta_diagnosis_click',
  'cta_line_click',
  'cta_kindle_click',
]);

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

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

  // slug ごとの集計コンテナ
  type Bucket = {
    pageViews: number;
    sessions: Set<string>;
    ctaClicks: number;
    scrollSum: number;
    scrollCount: number;
    daily: Map<string, number>;
  };
  const bySlug = new Map<string, Bucket>();

  const getBucket = (slug: string): Bucket => {
    let b = bySlug.get(slug);
    if (!b) {
      b = {
        pageViews: 0,
        sessions: new Set(),
        ctaClicks: 0,
        scrollSum: 0,
        scrollCount: 0,
        daily: new Map(),
      };
      bySlug.set(slug, b);
    }
    return b;
  };

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const isInternal = d.internal === true;
    if (internalFilter === 'exclude' && isInternal) continue;
    if (internalFilter === 'only' && !isInternal) continue;

    const slug = slugFromPath(d.path as string | undefined);
    if (!slug) continue;

    const bucket = getBucket(slug);
    const eventType = d.eventType as string;
    const date = (d.date as string) || 'unknown';
    const sessionId = d.sessionId as string | undefined;
    if (sessionId) bucket.sessions.add(sessionId);

    if (eventType === 'page_view') {
      bucket.pageViews++;
      bucket.daily.set(date, (bucket.daily.get(date) ?? 0) + 1);
    } else if (CTA_EVENT_TYPES.has(eventType)) {
      bucket.ctaClicks++;
    } else if (eventType === 'scroll_depth') {
      const pct = d.scrollPercent as number | undefined;
      if (typeof pct === 'number' && pct > 0) {
        bucket.scrollSum += Math.min(100, Math.max(0, pct));
        bucket.scrollCount++;
      }
    }
  }

  // 期間内の日付リスト（スパークラインのギャップを 0 で埋めるため）
  const dateList: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateList.push(d.toISOString().slice(0, 10));
  }

  const rows: PostAnalyticsRow[] = Array.from(bySlug.entries())
    .map(([slug, b]) => ({
      slug,
      pageViews: b.pageViews,
      uniqueSessions: b.sessions.size,
      avgScrollDepth: b.scrollCount > 0 ? Math.round(b.scrollSum / b.scrollCount) : 0,
      ctaClicks: b.ctaClicks,
      daily: dateList.map((date) => ({
        date,
        pageViews: b.daily.get(date) ?? 0,
      })),
    }))
    .sort((a, b) => b.pageViews - a.pageViews);

  return NextResponse.json({
    days,
    startDate: startDateStr,
    rows,
  } satisfies PostAnalyticsResponse);
}
