import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

// ── 型定義 ──

export interface DailySummary {
  date: string;
  sessions: number;
  pageViews: number;
  ctaClicks: number;
  diagnosisStarts: number;
  diagnosisCompletes: number;
}

export interface SourceSummary {
  source: string;
  type: 'ref' | 'organic';
  sessions: number;
  pageViews: number;
  ctaClicks: number;
  diagnosisStarts: number;
  diagnosisCompletes: number;
}

export interface SessionSummary {
  id: string;
  startTime: string;
  source: string;
  entryPage: string;
  pages: string[];
  pageDepths: Record<string, number>; // path → max scroll percent (0-100)
  ctaClicked: boolean;
  diagnosisStarted: boolean;
  diagnosisCompleted: boolean;
  duration: number; // seconds
}

export interface FunnelStep {
  step: string;
  count: number;
}

export interface AnalyticsResponse {
  totalSessions: number;
  totalPageViews: number;
  totalDiagnosisStarts: number;
  totalDiagnosisCompletes: number;
  daily: DailySummary[];
  sources: SourceSummary[];
  sessions: SessionSummary[];
  pageFunnel: FunnelStep[];
  scrollDepth: FunnelStep[];
  diagnosisFunnel: FunnelStep[];
}

function classifyReferrer(referrer: string | undefined): string {
  if (!referrer) return '直接アクセス';
  if (/google\./i.test(referrer)) return 'Google検索';
  if (/yahoo\./i.test(referrer)) return 'Yahoo検索';
  if (/bing\./i.test(referrer)) return 'Bing検索';
  return referrer;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = request.nextUrl;
  const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 90);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection('nobilvaAnalytics')
    .where('date', '>=', startDateStr)
    .orderBy('date', 'desc')
    .limit(50000)
    .get();

  // ── イベントをセッション単位にグルーピング ──
  const sessionMap = new Map<string, {
    events: Array<{
      time: number;
      eventType: string;
      path: string;
      section?: string;
      diagnosisStep?: string;
      scrollPercent?: number;
    }>;
    ref?: string;
    referrer?: string;
  }>();

  const dailyMap = new Map<string, {
    sessions: Set<string>;
    pageViews: number;
    ctaClicks: number;
    diagnosisStarts: number;
    diagnosisCompletes: number;
  }>();

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const eventType = d.eventType as string;
    const date = d.date as string;
    const sessionId = d.sessionId as string;
    const path = d.path as string;
    const section = d.section as string | undefined;
    const diagnosisStep = d.diagnosisStep as string | undefined;
    const refCode = d.ref as string | undefined;
    const referrer = d.referrer as string | undefined;
    const time = d.createdAt?.seconds ?? Math.floor(Date.now() / 1000);

    // セッション構築
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, { events: [] });
    }
    const session = sessionMap.get(sessionId)!;
    if (refCode && !session.ref) session.ref = refCode;
    if (referrer && !session.referrer) session.referrer = referrer;
    const scrollPercent = d.scrollPercent as number | undefined;
    session.events.push({ time, eventType, path, section, diagnosisStep, scrollPercent });

    // 日別集計
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { sessions: new Set(), pageViews: 0, ctaClicks: 0, diagnosisStarts: 0, diagnosisCompletes: 0 });
    }
    const daily = dailyMap.get(date)!;
    daily.sessions.add(sessionId);
    if (eventType === 'page_view') daily.pageViews++;
    else if (eventType === 'cta_click') daily.ctaClicks++;
    else if (eventType === 'diagnosis_start') daily.diagnosisStarts++;
    else if (eventType === 'diagnosis_complete') daily.diagnosisCompletes++;
  }

  // ── セッションを解析して各種集計を構築 ──
  const sourceMap = new Map<string, {
    type: 'ref' | 'organic';
    sessions: Set<string>;
    pageViews: number;
    ctaClicks: number;
    diagnosisStarts: number;
    diagnosisCompletes: number;
  }>();

  const scrollSections = new Map<string, Set<string>>();
  const diagnosisFunnelMap = new Map<string, Set<string>>();

  // ページ遷移ファネル用マイルストーン
  const milestone = {
    lpView: new Set<string>(),
    subpageView: new Set<string>(),
    blogView: new Set<string>(),
    ctaClick: new Set<string>(),
    diagnosisPage: new Set<string>(),
    diagnosisStart: new Set<string>(),
    diagnosisComplete: new Set<string>(),
  };

  let totalPageViews = 0;
  let totalDiagnosisStarts = 0;
  let totalDiagnosisCompletes = 0;

  const sessions: SessionSummary[] = [];

  for (const [sessionId, s] of sessionMap) {
    s.events.sort((a, b) => a.time - b.time);

    // 流入元判定
    const isRef = !!s.ref;
    const source = isRef ? `ref:${s.ref}` : classifyReferrer(s.referrer);
    const sourceType: 'ref' | 'organic' = isRef ? 'ref' : 'organic';

    const pages: string[] = [];
    const pageDepths = new Map<string, number>();
    const lpSections = new Set<string>();
    let ctaClicked = false;
    let diagnosisStarted = false;
    let diagnosisCompleted = false;
    let pvCount = 0;
    let ctaCount = 0;
    let dsCount = 0;
    let dcCount = 0;

    for (const e of s.events) {
      switch (e.eventType) {
        case 'page_view':
          if (!pages.length || pages[pages.length - 1] !== e.path) pages.push(e.path);
          pvCount++;
          break;
        case 'section_view':
          if (e.section) {
            lpSections.add(e.section);
            if (!scrollSections.has(e.section)) scrollSections.set(e.section, new Set());
            scrollSections.get(e.section)!.add(sessionId);
          }
          break;
        case 'scroll_depth':
          if (e.scrollPercent != null) {
            const cur = pageDepths.get(e.path) || 0;
            if (e.scrollPercent > cur) pageDepths.set(e.path, e.scrollPercent);
          }
          break;
        case 'cta_click':
          ctaClicked = true;
          ctaCount++;
          break;
        case 'diagnosis_start':
          diagnosisStarted = true;
          dsCount++;
          if (!diagnosisFunnelMap.has('start')) diagnosisFunnelMap.set('start', new Set());
          diagnosisFunnelMap.get('start')!.add(sessionId);
          break;
        case 'diagnosis_step':
          if (e.diagnosisStep) {
            if (!diagnosisFunnelMap.has(e.diagnosisStep)) diagnosisFunnelMap.set(e.diagnosisStep, new Set());
            diagnosisFunnelMap.get(e.diagnosisStep)!.add(sessionId);
          }
          break;
        case 'diagnosis_complete':
          diagnosisCompleted = true;
          dcCount++;
          if (!diagnosisFunnelMap.has('complete')) diagnosisFunnelMap.set('complete', new Set());
          diagnosisFunnelMap.get('complete')!.add(sessionId);
          break;
      }
    }

    totalPageViews += pvCount;
    totalDiagnosisStarts += dsCount;
    totalDiagnosisCompletes += dcCount;

    // ページ遷移ファネル用マイルストーン
    for (const p of pages) {
      if (p === '/ja/services/nobilva') milestone.lpView.add(sessionId);
      else if (p === '/ja/services/nobilva/diagnosis') milestone.diagnosisPage.add(sessionId);
      else if (p.startsWith('/ja/services/nobilva/')) milestone.subpageView.add(sessionId);
      else if (p.startsWith('/ja/blog/')) milestone.blogView.add(sessionId);
    }
    if (ctaClicked) milestone.ctaClick.add(sessionId);
    if (diagnosisStarted) milestone.diagnosisStart.add(sessionId);
    if (diagnosisCompleted) milestone.diagnosisComplete.add(sessionId);

    // 流入元集計
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { type: sourceType, sessions: new Set(), pageViews: 0, ctaClicks: 0, diagnosisStarts: 0, diagnosisCompletes: 0 });
    }
    const src = sourceMap.get(source)!;
    src.sessions.add(sessionId);
    src.pageViews += pvCount;
    src.ctaClicks += ctaCount;
    src.diagnosisStarts += dsCount;
    src.diagnosisCompletes += dcCount;

    sessions.push({
      id: sessionId,
      startTime: new Date(s.events[0].time * 1000).toISOString(),
      source,
      entryPage: pages[0] || '-',
      pages,
      pageDepths: Object.fromEntries(pageDepths),
      ctaClicked,
      diagnosisStarted,
      diagnosisCompleted,
      duration: s.events.length > 1
        ? Math.round(s.events[s.events.length - 1].time - s.events[0].time)
        : 0,
    });
  }

  sessions.sort((a, b) => b.startTime.localeCompare(a.startTime));

  // ── レスポンス構築 ──
  const daily: DailySummary[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, d]) => ({
      date,
      sessions: d.sessions.size,
      pageViews: d.pageViews,
      ctaClicks: d.ctaClicks,
      diagnosisStarts: d.diagnosisStarts,
      diagnosisCompletes: d.diagnosisCompletes,
    }));

  const sources: SourceSummary[] = Array.from(sourceMap.entries())
    .map(([source, s]) => ({
      source,
      type: s.type,
      sessions: s.sessions.size,
      pageViews: s.pageViews,
      ctaClicks: s.ctaClicks,
      diagnosisStarts: s.diagnosisStarts,
      diagnosisCompletes: s.diagnosisCompletes,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  // ページ遷移ファネル
  const pageFunnel: FunnelStep[] = [
    { step: 'site_visit', count: sessionMap.size },
    { step: 'lp_view', count: milestone.lpView.size },
    { step: 'blog_view', count: milestone.blogView.size },
    { step: 'subpage_view', count: milestone.subpageView.size },
    { step: 'cta_click', count: milestone.ctaClick.size },
    { step: 'diagnosis_page', count: milestone.diagnosisPage.size },
    { step: 'diagnosis_start', count: milestone.diagnosisStart.size },
    { step: 'diagnosis_complete', count: milestone.diagnosisComplete.size },
  ];

  const sectionOrder = [
    'hero', 'empathy', 'concerns', 'three-pillars', 'day-flow',
    'results', 'year-roadmap', 'pricing', 'comparison', 'coach-message',
    'career-path', 'team-referral', 'faq', 'articles', 'final-cta',
  ];
  const scrollDepth: FunnelStep[] = sectionOrder
    .filter((s) => scrollSections.has(s))
    .map((s) => ({ step: s, count: scrollSections.get(s)!.size }));

  const funnelOrder = ['start', 'basics', 'student', 'concerns', 'career', 'source', 'schedule', 'confirm', 'complete'];
  const diagnosisFunnel: FunnelStep[] = funnelOrder
    .filter((s) => diagnosisFunnelMap.has(s))
    .map((s) => ({ step: s, count: diagnosisFunnelMap.get(s)!.size }));

  return NextResponse.json({
    totalSessions: sessionMap.size,
    totalPageViews,
    totalDiagnosisStarts,
    totalDiagnosisCompletes,
    daily,
    sources,
    sessions: sessions.slice(0, 200),
    pageFunnel,
    scrollDepth,
    diagnosisFunnel,
  } satisfies AnalyticsResponse);
}
