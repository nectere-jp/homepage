import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/** 日別サマリー */
export interface DailySummary {
  date: string;
  pageViews: number;
  uniqueSessions: number;
  sectionViews: Record<string, number>;
  ctaClicks: Record<string, number>;
  diagnosisStarts: number;
  diagnosisCompletes: number;
}

/** ページ別集計 */
export interface PageSummary {
  path: string;
  pageViews: number;
  uniqueSessions: number;
}

/** 診断ファネル */
export interface FunnelStep {
  step: string;
  count: number;
}

/** ref コード別集計 */
export interface RefSummary {
  ref: string;
  pageViews: number;
  uniqueSessions: number;
  ctaClicks: number;
  diagnosisCompletes: number;
}

/** ref なし（直接アクセス）の集計 */
export interface DirectStats {
  pageViews: number;
  uniqueSessions: number;
  ctaClicks: number;
  diagnosisCompletes: number;
}

export interface AnalyticsResponse {
  daily: DailySummary[];
  pages: PageSummary[];
  funnel: FunnelStep[];
  refs: RefSummary[];
  directStats: DirectStats;
  totalPageViews: number;
  totalUniqueSessions: number;
  totalDiagnosisCompletes: number;
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

  // ── 集計用マップ ──
  const dailyMap = new Map<string, {
    pageViews: number;
    sessions: Set<string>;
    sectionViews: Record<string, number>;
    ctaClicks: Record<string, number>;
    diagnosisStarts: number;
    diagnosisCompletes: number;
  }>();

  const pageMap = new Map<string, {
    pageViews: number;
    sessions: Set<string>;
  }>();

  const refMap = new Map<string, {
    pageViews: number;
    sessions: Set<string>;
    ctaClicks: number;
    diagnosisCompletes: number;
  }>();

  // ref なしセッションの追跡
  const directSessions = new Set<string>();
  let directPageViews = 0;
  let directCtaClicks = 0;
  let directDiagnosisCompletes = 0;

  const funnelMap = new Map<string, Set<string>>();
  const allSessions = new Set<string>();
  // ref 付きセッション (直接アクセス判定用)
  const refSessions = new Set<string>();

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const eventType = d.eventType as string;
    const date = d.date as string;
    const sessionId = d.sessionId as string;
    const path = d.path as string;
    const section = d.section as string | undefined;
    const diagnosisStep = d.diagnosisStep as string | undefined;
    const refCode = d.ref as string | undefined;

    allSessions.add(sessionId);

    // ── 日別 ──
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        pageViews: 0,
        sessions: new Set(),
        sectionViews: {},
        ctaClicks: {},
        diagnosisStarts: 0,
        diagnosisCompletes: 0,
      });
    }
    const daily = dailyMap.get(date)!;
    daily.sessions.add(sessionId);

    if (eventType === 'page_view') {
      daily.pageViews++;
    } else if (eventType === 'section_view' && section) {
      daily.sectionViews[section] = (daily.sectionViews[section] || 0) + 1;
    } else if (eventType === 'cta_click' && section) {
      daily.ctaClicks[section] = (daily.ctaClicks[section] || 0) + 1;
    } else if (eventType === 'diagnosis_start') {
      daily.diagnosisStarts++;
    } else if (eventType === 'diagnosis_complete') {
      daily.diagnosisCompletes++;
    }

    // ── ページ別 ──
    if (eventType === 'page_view') {
      if (!pageMap.has(path)) {
        pageMap.set(path, { pageViews: 0, sessions: new Set() });
      }
      const page = pageMap.get(path)!;
      page.pageViews++;
      page.sessions.add(sessionId);
    }

    // ── ref コード別 / 直接アクセス ──
    if (refCode) {
      refSessions.add(sessionId);
      if (!refMap.has(refCode)) {
        refMap.set(refCode, { pageViews: 0, sessions: new Set(), ctaClicks: 0, diagnosisCompletes: 0 });
      }
      const r = refMap.get(refCode)!;
      r.sessions.add(sessionId);
      if (eventType === 'page_view') r.pageViews++;
      if (eventType === 'cta_click') r.ctaClicks++;
      if (eventType === 'diagnosis_complete') r.diagnosisCompletes++;
    } else {
      directSessions.add(sessionId);
      if (eventType === 'page_view') directPageViews++;
      if (eventType === 'cta_click') directCtaClicks++;
      if (eventType === 'diagnosis_complete') directDiagnosisCompletes++;
    }

    // ── 診断ファネル (セッション単位) ──
    if (eventType === 'diagnosis_start') {
      if (!funnelMap.has('start')) funnelMap.set('start', new Set());
      funnelMap.get('start')!.add(sessionId);
    } else if (eventType === 'diagnosis_step' && diagnosisStep) {
      if (!funnelMap.has(diagnosisStep)) funnelMap.set(diagnosisStep, new Set());
      funnelMap.get(diagnosisStep)!.add(sessionId);
    } else if (eventType === 'diagnosis_complete') {
      if (!funnelMap.has('complete')) funnelMap.set('complete', new Set());
      funnelMap.get('complete')!.add(sessionId);
    }
  }

  // ── レスポンス構築 ──
  const daily: DailySummary[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, d]) => ({
      date,
      pageViews: d.pageViews,
      uniqueSessions: d.sessions.size,
      sectionViews: d.sectionViews,
      ctaClicks: d.ctaClicks,
      diagnosisStarts: d.diagnosisStarts,
      diagnosisCompletes: d.diagnosisCompletes,
    }));

  const pages: PageSummary[] = Array.from(pageMap.entries())
    .map(([path, p]) => ({
      path,
      pageViews: p.pageViews,
      uniqueSessions: p.sessions.size,
    }))
    .sort((a, b) => b.pageViews - a.pageViews);

  const funnelStepOrder = ['start', 'basics', 'student', 'concerns', 'career', 'source', 'schedule', 'confirm', 'complete'];
  const funnel: FunnelStep[] = funnelStepOrder
    .filter((step) => funnelMap.has(step))
    .map((step) => ({
      step,
      count: funnelMap.get(step)!.size,
    }));

  const refs: RefSummary[] = Array.from(refMap.entries())
    .map(([ref, r]) => ({
      ref,
      pageViews: r.pageViews,
      uniqueSessions: r.sessions.size,
      ctaClicks: r.ctaClicks,
      diagnosisCompletes: r.diagnosisCompletes,
    }))
    .sort((a, b) => b.uniqueSessions - a.uniqueSessions);

  // 直接アクセス = ref コードが一度も付いていないセッション
  const pureDirectSessions = new Set([...directSessions].filter((s) => !refSessions.has(s)));
  const directStats: DirectStats = {
    pageViews: directPageViews,
    uniqueSessions: pureDirectSessions.size,
    ctaClicks: directCtaClicks,
    diagnosisCompletes: directDiagnosisCompletes,
  };

  let totalPageViews = 0;
  let totalDiagnosisCompletes = 0;
  for (const d of daily) {
    totalPageViews += d.pageViews;
    totalDiagnosisCompletes += d.diagnosisCompletes;
  }

  const result: AnalyticsResponse = {
    daily,
    pages,
    funnel,
    refs,
    directStats,
    totalPageViews,
    totalUniqueSessions: allSessions.size,
    totalDiagnosisCompletes,
  };

  return NextResponse.json(result);
}
