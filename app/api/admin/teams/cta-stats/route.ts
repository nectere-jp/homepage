import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getNobilvaEvents } from '@/lib/analytics/events-cache';
import { groupEventsBySession, type SessionBuilder } from '@/lib/analytics/session-grouping';
import {
  buildPageCtaStats,
  CTA_VIEW_START_DATE,
  type PageCtaStats,
} from '@/lib/analytics/cta-stats';

/**
 * GET /api/admin/teams/cta-stats?slug=urayasu[&internal=exclude|only|all]
 *
 * チームページの CTA ごとの到達とクリックを返す。
 * チーム計測（teamEvents）には CTA の表示イベントが無いので、サイト全体の計測
 * （nobilvaAnalytics の cta_view / クリック）をチームページのパスで絞って数える。
 * そのため、チーム計測の閲覧数とはセッションの数え方が違い、数は一致しない。
 */

const DAYS = 90;
const TEAM_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export interface TeamCtaStatsResponse {
  /** データが 1 件も無いときは null */
  page: PageCtaStats | null;
  /** 数え始めた日 (YYYY-MM-DD) */
  since: string;
  days: number;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug || !TEAM_SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  const internalMode = request.nextUrl.searchParams.get('internal') ?? 'exclude';

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS);
  const startDateStr = startDate.toISOString().slice(0, 10);

  try {
    const docs = await getNobilvaEvents({ startDateStr });
    // /api/admin/analytics と同じく、内部アクセスはセッション単位で丸ごと外す
    const sessionMap = groupEventsBySession(docs, { internalFilter: 'all' });
    const sessions: [string, SessionBuilder][] = [];
    for (const entry of sessionMap) {
      const isInternal = !!entry[1].internal;
      if (internalMode === 'exclude' && isInternal) continue;
      if (internalMode === 'only' && !isInternal) continue;
      sessions.push(entry);
    }

    const teamPathSuffix = `/services/nobilva/teams/${slug}`;
    const pages = buildPageCtaStats(sessions, {
      includePath: (path) => path.endsWith(teamPathSuffix),
    });

    return NextResponse.json({
      page: pages[0] ?? null,
      since: startDateStr > CTA_VIEW_START_DATE ? startDateStr : CTA_VIEW_START_DATE,
      days: DAYS,
    } satisfies TeamCtaStatsResponse);
  } catch (error) {
    console.error('[Team CTA Stats] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
