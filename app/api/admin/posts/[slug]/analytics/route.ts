import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getNobilvaEvents, isQuotaError } from '@/lib/analytics/events-cache';

/**
 * 単一記事の詳細分析 API。
 *  - 日次 PV / UU（折れ線）
 *  - スクロール深度のヒストグラム（0-20 / 20-40 / 40-60 / 60-80 / 80-100）
 *  - 流入元内訳
 *  - CTA クリック内訳（cta_id ごと）
 *  - セッション一覧（この記事を訪れたセッション + 記事での CTA クリック時刻 +
 *    非LINE CTA クリック後の /diagnosis → 診断開始 → 診断完了 の到達ステップ）
 */

export type PostCtaType = 'line' | 'consult' | 'kindle' | 'other';

export interface PostCtaClick {
  at: string;
  ctaId: string;
  ctaType: PostCtaType;
}

export interface PostSessionMilestone {
  kind: 'diagnosis_page' | 'diagnosis_start' | 'diagnosis_step' | 'diagnosis_complete';
  at: string;
  label?: string;
}

export interface PostSession {
  id: string;
  startTime: string;
  source: string;
  device: 'mobile' | 'pc' | 'unknown';
  internal: boolean;
  articleEntryTime: string;
  articleMaxScroll: number;
  articleDurationSec: number;
  ctaClicks: PostCtaClick[];
  /** 最初の非LINE CTA クリック以降に到達したステップ (時系列) */
  postCtaMilestones: PostSessionMilestone[];
}

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
  sessions: PostSession[];
}

const BLOG_PATH_RE = /^\/(?:ja\/|en\/|de\/)?blog\/([^/?#]+)/;
const DIAGNOSIS_PATH_RE = /^\/(?:ja\/|en\/|de\/)?(?:services\/nobilva\/)?diagnosis/;

const CTA_EVENT_TYPES = new Set([
  'cta_click',
  'cta_diagnosis_click',
  'cta_line_click',
  'cta_kindle_click',
]);

/** eventType から CTA 種別を判定 (storage には cta_type を持たないため event_type で代替) */
function ctaTypeFromEvent(eventType: string, ctaId?: string): PostCtaType {
  if (eventType === 'cta_line_click') return 'line';
  if (eventType === 'cta_diagnosis_click') return 'consult';
  if (eventType === 'cta_kindle_click') return 'kindle';
  // 旧データ (eventType='cta_click') は section (cta_id) から推測
  const id = (ctaId || '').toLowerCase();
  if (id.includes('line') || id.startsWith('line-')) return 'line';
  if (id.includes('consult') || id.startsWith('diagnosis-')) return 'consult';
  if (id.includes('kindle') || id.startsWith('kindle-')) return 'kindle';
  return 'other';
}

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

  // daily 配列は i=days-1..0 の days 件 (today-(days-1) 〜 today) を生成するので、
  // Firestore クエリの下限もその最古日と一致させないと
  // Σ(daily.pageViews) と totals.pageViews が食い違う。
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  const startDateStr = startDate.toISOString().slice(0, 10);

  let docs;
  try {
    docs = await getNobilvaEvents({ startDateStr });
  } catch (error) {
    if (isQuotaError(error)) {
      return NextResponse.json(
        { error: 'Firestore の読み取りクォータに達しました。しばらく時間を置いてから再読み込みしてください。' },
        { status: 429 },
      );
    }
    console.error('[posts/[slug]/analytics] fetch failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  // ── Pass 1: 全イベントを sessionId でグルーピング & この記事スコープの集計 ──
  interface RawEvent {
    time: number;
    eventType: string;
    path: string;
    section?: string;
    diagnosisStep?: string;
    scrollPercent?: number;
    ref?: string;
    referrer?: string;
  }
  interface SessionBuilder {
    events: RawEvent[];
    /** 時系列でソート後に導出。Pass 1 では未設定。 */
    ref?: string;
    referrer?: string;
    internal?: boolean;
    device?: 'mobile' | 'pc';
    /** events を time 昇順ソート済みか */
    sorted?: boolean;
  }
  const sessionMap = new Map<string, SessionBuilder>();

  let pageViews = 0;
  let ctaClicks = 0;
  let scrollSum = 0;
  let scrollCount = 0;
  const articleSessions = new Set<string>();
  const daily = new Map<string, { pageViews: number; sessions: Set<string> }>();
  const scrollHistogram = new Map<string, number>();
  const ctaMap = new Map<string, number>();

  for (const doc of docs) {
    const d = doc.data();
    const isInternal = d.internal === true;
    if (internalFilter === 'exclude' && isInternal) continue;
    if (internalFilter === 'only' && !isInternal) continue;

    const path = (d.path as string | undefined) ?? '';
    const eventType = d.eventType as string;
    const date = (d.date as string) || 'unknown';
    const sessionId = d.sessionId as string | undefined;
    const section = d.section as string | undefined;
    const diagnosisStep = d.diagnosisStep as string | undefined;
    const scrollPercent = d.scrollPercent as number | undefined;
    const refCode = d.ref as string | undefined;
    const referrer = d.referrer as string | undefined;
    // createdAt が無いイベントは Date.now() にフォールバックするとタイムラインを汚染する
    // (sort で末尾に浮上し、無関係な diagnosis_* を『この CTA 由来』と誤認する)。
    // マイルストーン走査の前提が崩れるので黙って捨てる。
    const createdSec = d.createdAt?.seconds as number | undefined;
    if (typeof createdSec !== 'number') continue;
    const time = createdSec;

    // 全セッションのイベントを溜める (後で記事訪問セッションのみを抽出するため)
    // ref/referrer は events-cache の orderBy('date','desc') で newest-first になるため、
    // ここで『最初に見かけた値』を採ると最新日の値になってしまう。
    // 時系列ソート後に Pass 2 で改めて最古時刻の値を拾う。
    if (sessionId) {
      let s = sessionMap.get(sessionId);
      if (!s) {
        s = { events: [] };
        sessionMap.set(sessionId, s);
      }
      if (isInternal) s.internal = true;
      const dev = d.device as 'mobile' | 'pc' | undefined;
      if (dev && !s.device) s.device = dev;
      s.events.push({ time, eventType, path, section, diagnosisStep, scrollPercent, ref: refCode, referrer });
    }

    // この記事スコープの集計
    const m = path.match(BLOG_PATH_RE);
    const slug = m?.[1];
    if (slug !== targetSlug) continue;

    if (sessionId) articleSessions.add(sessionId);

    if (eventType === 'page_view') {
      pageViews++;
      if (!daily.has(date)) daily.set(date, { pageViews: 0, sessions: new Set() });
      const bucket = daily.get(date)!;
      bucket.pageViews++;
      if (sessionId) bucket.sessions.add(sessionId);
    } else if (CTA_EVENT_TYPES.has(eventType)) {
      ctaClicks++;
      const ctaId = section || 'unknown';
      ctaMap.set(ctaId, (ctaMap.get(ctaId) ?? 0) + 1);
    } else if (eventType === 'scroll_depth') {
      if (typeof scrollPercent === 'number' && scrollPercent > 0) {
        const clipped = Math.min(100, Math.max(0, scrollPercent));
        scrollSum += clipped;
        scrollCount++;
        const b = bucketFor(clipped);
        scrollHistogram.set(b, (scrollHistogram.get(b) ?? 0) + 1);
      }
    }
  }

  // ── Pass 2: 記事訪問セッションの events を時系列ソートし、最古時刻の ref/referrer を導出 ──
  for (const sid of articleSessions) {
    const s = sessionMap.get(sid);
    if (!s || s.sorted) continue;
    s.events.sort((a, b) => a.time - b.time);
    s.sorted = true;
    for (const e of s.events) {
      if (e.ref && !s.ref) s.ref = e.ref;
      if (e.referrer && !s.referrer) s.referrer = e.referrer;
      if (s.ref && s.referrer) break;
    }
  }

  // ── Pass 3: 流入元 (この記事を訪問したセッションのランディング ref/referrer) ──
  const sources = new Map<string, Set<string>>();
  for (const sid of articleSessions) {
    const s = sessionMap.get(sid);
    if (!s) continue;
    const source = s.ref ? `ref:${s.ref}` : classifyReferrer(s.referrer);
    if (!sources.has(source)) sources.set(source, new Set());
    sources.get(source)!.add(sid);
  }

  // ── Pass 4: セッション詳細 (記事訪問 + CTA 時刻 + 非LINE CTA 後のマイルストーン) ──
  const postSessions: PostSession[] = [];
  for (const sid of articleSessions) {
    const s = sessionMap.get(sid);
    if (!s || s.events.length === 0) continue;

    const articleEvents = s.events.filter((e) => BLOG_PATH_RE.exec(e.path)?.[1] === targetSlug);
    if (articleEvents.length === 0) continue;

    const articleEntry = articleEvents.find((e) => e.eventType === 'page_view') ?? articleEvents[0];
    const articleLast = articleEvents[articleEvents.length - 1];
    const maxScroll = articleEvents.reduce((max, e) => {
      if (e.eventType === 'scroll_depth' && typeof e.scrollPercent === 'number') {
        return Math.max(max, Math.min(100, Math.max(0, e.scrollPercent)));
      }
      return max;
    }, 0);

    const sessionCtas: PostCtaClick[] = articleEvents
      .filter((e) => CTA_EVENT_TYPES.has(e.eventType))
      .map((e) => ({
        at: new Date(e.time * 1000).toISOString(),
        ctaId: e.section || 'unknown',
        ctaType: ctaTypeFromEvent(e.eventType, e.section),
      }));

    const firstNonLineCta = s.events.find(
      (e) =>
        CTA_EVENT_TYPES.has(e.eventType) &&
        ctaTypeFromEvent(e.eventType, e.section) !== 'line' &&
        BLOG_PATH_RE.exec(e.path)?.[1] === targetSlug,
    );
    const postCtaMilestones: PostSessionMilestone[] = [];
    if (firstNonLineCta) {
      // 別記事の page_view が入ったら「記事外に離脱した」とみなしてそれ以降は帰属しない。
      // そうしないと A→B→診断完了 のとき A と B の両方に CV がダブルカウントされる。
      let seenDiagPage = false;
      let seenStart = false;
      let seenComplete = false;
      for (const e of s.events) {
        if (e.time < firstNonLineCta.time) continue;
        if (e.eventType === 'page_view') {
          const otherSlug = BLOG_PATH_RE.exec(e.path)?.[1];
          if (otherSlug && otherSlug !== targetSlug) break; // 別記事に離脱
        }
        const iso = new Date(e.time * 1000).toISOString();
        if (e.eventType === 'page_view' && DIAGNOSIS_PATH_RE.test(e.path) && !seenDiagPage) {
          postCtaMilestones.push({ kind: 'diagnosis_page', at: iso });
          seenDiagPage = true;
        } else if (e.eventType === 'diagnosis_start' && !seenStart) {
          postCtaMilestones.push({ kind: 'diagnosis_start', at: iso });
          seenStart = true;
        } else if (e.eventType === 'diagnosis_step') {
          postCtaMilestones.push({ kind: 'diagnosis_step', at: iso, label: e.diagnosisStep });
        } else if (e.eventType === 'diagnosis_complete' && !seenComplete) {
          postCtaMilestones.push({ kind: 'diagnosis_complete', at: iso });
          seenComplete = true;
        }
      }
    }

    const sourceLabel = s.ref ? `ref:${s.ref}` : classifyReferrer(s.referrer);
    postSessions.push({
      id: sid,
      startTime: new Date(s.events[0].time * 1000).toISOString(),
      source: sourceLabel,
      device: s.device || 'unknown',
      internal: !!s.internal,
      articleEntryTime: new Date(articleEntry.time * 1000).toISOString(),
      articleMaxScroll: maxScroll,
      articleDurationSec: Math.max(0, Math.round(articleLast.time - articleEntry.time)),
      ctaClicks: sessionCtas,
      postCtaMilestones,
    });
  }
  postSessions.sort((a, b) => (a.startTime < b.startTime ? 1 : -1));

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
      uniqueSessions: articleSessions.size,
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
    sessions: postSessions.slice(0, 150),
  } satisfies PostDetailAnalytics);
}
