/**
 * Nobilva アナリティクス — セッション & UTM 管理 (クライアント専用)
 *
 * - 初回ランディング時に UTM パラメータを sessionStorage に保存
 * - セッション ID を sessionStorage で管理
 * - ページ遷移しても同一セッション内で UTM が貫通する
 */

import type { AttributionParams } from './types';

const SESSION_KEY = 'nobilva-analytics-session';
const ATTRIBUTION_KEY = 'nobilva-analytics-attribution';

/** セッション ID を取得。なければ生成して保存 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** URL から UTM + カスタムパラメータを抽出し、sessionStorage に保存(初回のみ) */
export function captureAttribution(): AttributionParams {
  if (typeof window === 'undefined') return {};

  // すでに保存済みならそちらを返す（初回ランディングのUTMを優先）
  const existing = sessionStorage.getItem(ATTRIBUTION_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as AttributionParams;
    } catch {
      // 壊れていたら再取得
    }
  }

  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionParams = {};

  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const utmContent = params.get('utm_content');
  const utmTerm = params.get('utm_term');
  const ref = params.get('ref');
  const team = params.get('team');

  if (utmSource) attribution.utmSource = utmSource;
  if (utmMedium) attribution.utmMedium = utmMedium;
  if (utmCampaign) attribution.utmCampaign = utmCampaign;
  if (utmContent) attribution.utmContent = utmContent;
  if (utmTerm) attribution.utmTerm = utmTerm;
  if (ref) attribution.ref = ref;
  if (team) attribution.team = team;

  // 何か1つでもあれば保存
  if (Object.keys(attribution).length > 0) {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }

  return attribution;
}

/** 保存済みアトリビューションを取得 */
export function getAttribution(): AttributionParams {
  if (typeof window === 'undefined') return {};
  const stored = sessionStorage.getItem(ATTRIBUTION_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as AttributionParams;
  } catch {
    return {};
  }
}
