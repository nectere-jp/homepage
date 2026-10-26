import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * nobilvaAnalytics の doc を sessionId でグルーピングする共通処理。
 *
 * /api/admin/analytics (全体ダッシュボード) と
 * /api/admin/posts/[slug]/analytics (記事ごと) の両方で同じ grouping が必要で、
 * 従来は byte 単位でほぼ同じコードが 2 箇所にあり、修正が片方だけに入ると
 * 集計が食い違う事故が起きていた。
 *
 * 保証:
 *  - events は time 昇順にソート済み
 *  - ref/referrer は時系列最古の非空値 (= ランディング時の値) を採用
 *  - createdAt を持たない doc は捨てる (Date.now() フォールバックしない)
 */

export interface RawEvent {
  time: number;
  eventType: string;
  path: string;
  section?: string;
  diagnosisStep?: string;
  scrollPercent?: number;
  date: string;
  ref?: string;
  referrer?: string;
}

export interface SessionBuilder {
  events: RawEvent[];
  /** 時系列最古の非空 ref */
  ref?: string;
  /** 時系列最古の非空 referrer */
  referrer?: string;
  internal?: boolean;
  device?: 'mobile' | 'pc';
}

export type InternalFilter = 'exclude' | 'only' | 'all';

export interface GroupOptions {
  internalFilter: InternalFilter;
}

/**
 * docs をセッション単位にグルーピングして返す。
 * 各 session.events は time 昇順にソート済み、ref/referrer は最古時刻の値。
 */
export function groupEventsBySession(
  docs: QueryDocumentSnapshot[],
  { internalFilter }: GroupOptions,
): Map<string, SessionBuilder> {
  const sessionMap = new Map<string, SessionBuilder>();

  for (const doc of docs) {
    const d = doc.data();
    const isInternal = d.internal === true;
    if (internalFilter === 'exclude' && isInternal) continue;
    if (internalFilter === 'only' && !isInternal) continue;

    // createdAt が無い doc を Date.now() にフォールバックすると sort で末尾に浮上し、
    // 無関係な milestone を誤帰属させるため捨てる。
    const createdSec = d.createdAt?.seconds as number | undefined;
    if (typeof createdSec !== 'number') continue;

    const sessionId = d.sessionId as string | undefined;
    if (!sessionId) continue;

    let s = sessionMap.get(sessionId);
    if (!s) {
      s = { events: [] };
      sessionMap.set(sessionId, s);
    }
    if (isInternal) s.internal = true;
    const dev = d.device as 'mobile' | 'pc' | undefined;
    if (dev && !s.device) s.device = dev;

    s.events.push({
      time: createdSec,
      eventType: d.eventType as string,
      path: (d.path as string | undefined) ?? '',
      section: d.section as string | undefined,
      diagnosisStep: d.diagnosisStep as string | undefined,
      scrollPercent: d.scrollPercent as number | undefined,
      date: (d.date as string) || 'unknown',
      ref: d.ref as string | undefined,
      referrer: d.referrer as string | undefined,
    });
  }

  // 時系列ソート + ref/referrer を『時間的に最古の非空値』で確定
  // (events-cache の orderBy desc で doc は newest-first で来るため、
  //  push 順に first-wins すると最新日の値を拾ってしまう)
  for (const s of sessionMap.values()) {
    s.events.sort((a, b) => a.time - b.time);
    for (const e of s.events) {
      if (e.ref && !s.ref) s.ref = e.ref;
      if (e.referrer && !s.referrer) s.referrer = e.referrer;
      if (s.ref && s.referrer) break;
    }
  }

  return sessionMap;
}
