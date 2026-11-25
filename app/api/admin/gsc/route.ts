import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { isGscConfigured, querySearchAnalytics, type GscDimension } from '@/lib/gsc';

/**
 * Search Console の数字を、直近の期間と前の同じ長さの期間で比べて返す。
 *
 * GET /api/admin/gsc?days=7&dimension=page|query|date&limit=200&page=/blog/xxx
 *  - Search Console のデータは 2〜3 日遅れるので、終わりの日は 3 日前にそろえる
 *  - 返す行: キー、今の期間と前の期間のクリック・表示回数・CTR・平均順位
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  if (!isGscConfigured()) {
    return NextResponse.json({ error: 'Search Console is not configured' }, { status: 503 });
  }

  const sp = request.nextUrl.searchParams;
  const days = Math.min(Math.max(parseInt(sp.get('days') || '7', 10) || 7, 1), 90);
  const dimension = (['page', 'query', 'date'].includes(sp.get('dimension') || '')
    ? sp.get('dimension')
    : 'page') as GscDimension;
  const limit = Math.min(Math.max(parseInt(sp.get('limit') || '200', 10) || 200, 1), 1000);
  const pageContains = sp.get('page') || undefined;

  const day = (offset: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - offset);
    return d.toISOString().slice(0, 10);
  };
  const lag = 3;
  const cur = { startDate: day(lag + days - 1), endDate: day(lag) };
  const prev = { startDate: day(lag + days * 2 - 1), endDate: day(lag + days) };

  try {
    const [curRows, prevRows, curTotal, prevTotal] = await Promise.all([
      querySearchAnalytics({ ...cur, dimensions: [dimension], rowLimit: 1000, pageContains }),
      querySearchAnalytics({ ...prev, dimensions: [dimension], rowLimit: 1000, pageContains }),
      querySearchAnalytics({ ...cur, dimensions: [], pageContains }),
      querySearchAnalytics({ ...prev, dimensions: [], pageContains }),
    ]);
    const prevMap = new Map(prevRows.map((r) => [r.keys[0], r]));
    const rows = curRows
      .map((r) => {
        const p = prevMap.get(r.keys[0]);
        return {
          key: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: Number(r.ctr.toFixed(4)),
          position: Number(r.position.toFixed(1)),
          prev: p
            ? {
                clicks: p.clicks,
                impressions: p.impressions,
                ctr: Number(p.ctr.toFixed(4)),
                position: Number(p.position.toFixed(1)),
              }
            : null,
        };
      })
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, limit);
    return NextResponse.json({
      dimension,
      current: cur,
      previous: prev,
      totals: { current: curTotal[0] ?? null, previous: prevTotal[0] ?? null },
      rows,
    });
  } catch (error) {
    console.error('[gsc] query failed', error);
    return NextResponse.json({ error: String((error as Error).message || error) }, { status: 502 });
  }
}
