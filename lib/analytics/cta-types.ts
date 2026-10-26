/**
 * CTA 種別の分類ロジック。
 *
 * - クライアント (NobilvaTracker.tsx) は cta_id (data-track-cta) と href から判定
 * - サーバ (per-post analytics) は Firestore に保存された eventType を優先し、
 *   旧データ (eventType='cta_click') のみ ctaId へのフォールバック判定を使う
 *
 * 両者が別ファイルで実装されると CTA 種別追加時にドリフトするため、
 * 分類ルールを 1 箇所に集約する。
 */

export type CtaType = 'consult' | 'line' | 'kindle' | 'other';

/** ctaId / href から CTA 種別を判定 (クライアント発火時 / 旧データのサーバ側フォールバック共通) */
export function classifyCtaType(ctaId: string, href?: string | null): CtaType {
  const id = ctaId.toLowerCase();
  if (id.includes('consult') || id.startsWith('diagnosis-')) return 'consult';
  if (id.includes('line') || id.startsWith('line-')) return 'line';
  if (id.includes('kindle') || id.startsWith('kindle-')) return 'kindle';
  if (href) {
    if (href.includes('/diagnosis')) return 'consult';
    if (href.includes('lin.ee') || href.includes('line.me')) return 'line';
  }
  return 'other';
}

/** 保存済み eventType から CTA 種別を判定。eventType='cta_click' のみ ctaId を見てフォールバック。 */
export function ctaTypeFromEvent(eventType: string, ctaId?: string): CtaType {
  if (eventType === 'cta_line_click') return 'line';
  if (eventType === 'cta_diagnosis_click') return 'consult';
  if (eventType === 'cta_kindle_click') return 'kindle';
  return classifyCtaType(ctaId || '');
}
