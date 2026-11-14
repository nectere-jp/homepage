import type { SessionBuilder } from './session-grouping';
import { classifyCtaType, ctaTypeFromEvent, type CtaType } from './cta-types';

/**
 * ページごと・CTA ごとの「見た」「押した」をセッション単位で数える。
 *
 * 率を 100% 以下に保つため、延べ回数ではなくセッション数で数える:
 *  - 到達率 = その CTA を見たセッション ÷ そのページを開いたセッション
 *  - クリック率 = その CTA を押したセッション ÷ その CTA を見たセッション
 * CTA が半分隠れた状態で押されると cta_view が無いままクリックだけ届くので、
 * 押したセッションは見たセッションにも含める。
 */

/** cta_view の記録を始めた日。これより前のイベントを混ぜると率が歪むので集計から外す。 */
export const CTA_VIEW_START_DATE = '2026-10-16';

const CLICK_EVENT_TYPES = new Set([
  'cta_click',
  'cta_diagnosis_click',
  'cta_line_click',
  'cta_kindle_click',
]);

export interface CtaStat {
  ctaId: string;
  type: CtaType;
  /** この CTA を見たセッション数（押したセッションを含む） */
  viewSessions: number;
  /** この CTA を押したセッション数 */
  clickSessions: number;
  /** 押された延べ回数 */
  clicks: number;
}

export interface PageCtaStats {
  path: string;
  /** そのページを開いたセッション数 */
  sessions: number;
  ctas: CtaStat[];
}

export interface BuildPageCtaStatsOptions {
  /** 集計するページを絞る。省略時はすべてのページ */
  includePath?: (path: string) => boolean;
}

/** ブログ記事のパスか（記事ごとの CTA は /admin/posts 側で見る） */
export function isBlogArticlePath(path: string): boolean {
  return /^\/(?:ja\/|en\/|de\/)?blog\/[^/?#]+/.test(path);
}

/** クリックが 1 件も無い CTA の種類を、ID だけから決める */
function ctaTypeFromId(ctaId: string): CtaType {
  const type = classifyCtaType(ctaId);
  if (type !== 'other') return type;
  return ctaId.toLowerCase().includes('diagnosis') ? 'consult' : 'other';
}

interface CtaAccumulator {
  type: CtaType | null;
  viewSessions: Set<string>;
  clickSessions: Set<string>;
  clicks: number;
}

interface PageAccumulator {
  sessions: Set<string>;
  ctas: Map<string, CtaAccumulator>;
}

/**
 * @param sessions groupEventsBySession の結果（内部アクセスの除外などは呼び出し側で済ませる）
 */
export function buildPageCtaStats(
  sessions: Iterable<[string, SessionBuilder]>,
  { includePath }: BuildPageCtaStatsOptions = {},
): PageCtaStats[] {
  const pages = new Map<string, PageAccumulator>();

  const pageOf = (path: string): PageAccumulator => {
    let page = pages.get(path);
    if (!page) {
      page = { sessions: new Set(), ctas: new Map() };
      pages.set(path, page);
    }
    return page;
  };

  for (const [sessionId, session] of sessions) {
    for (const e of session.events) {
      // date は YYYY-MM-DD なので文字列のまま比べられる。'unknown' は開始日より後ろに並ぶので別に弾く
      if (e.date === 'unknown' || e.date < CTA_VIEW_START_DATE) continue;
      if (!e.path || (includePath && !includePath(e.path))) continue;

      if (e.eventType === 'page_view') {
        pageOf(e.path).sessions.add(sessionId);
        continue;
      }

      const isView = e.eventType === 'cta_view';
      const isClick = CLICK_EVENT_TYPES.has(e.eventType);
      if ((!isView && !isClick) || !e.section) continue;

      const page = pageOf(e.path);
      // page_view が届かなかったセッションも、CTA を見たならページは開いている
      page.sessions.add(sessionId);

      let cta = page.ctas.get(e.section);
      if (!cta) {
        cta = { type: null, viewSessions: new Set(), clickSessions: new Set(), clicks: 0 };
        page.ctas.set(e.section, cta);
      }
      cta.viewSessions.add(sessionId);
      if (isClick) {
        cta.clickSessions.add(sessionId);
        cta.clicks++;
        cta.type = ctaTypeFromEvent(e.eventType, e.section);
      }
    }
  }

  return Array.from(pages.entries())
    .filter(([, page]) => page.ctas.size > 0)
    .map(([path, page]) => ({
      path,
      sessions: page.sessions.size,
      ctas: Array.from(page.ctas.entries())
        .map(([ctaId, cta]) => ({
          ctaId,
          type: cta.type ?? ctaTypeFromId(ctaId),
          viewSessions: cta.viewSessions.size,
          clickSessions: cta.clickSessions.size,
          clicks: cta.clicks,
        }))
        .sort((a, b) => b.viewSessions - a.viewSessions || a.ctaId.localeCompare(b.ctaId)),
    }))
    .sort((a, b) => b.sessions - a.sessions || a.path.localeCompare(b.path));
}
