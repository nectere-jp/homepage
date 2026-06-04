/**
 * Nobilva アナリティクス — 型定義
 *
 * Firestore コレクション: nobilvaAnalytics
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'section_view'
  | 'cta_click'
  | 'diagnosis_start'
  | 'diagnosis_step'
  | 'diagnosis_complete';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;

  /** ページパス (e.g. /ja/services/nobilva) */
  path: string;

  /** セクション名 (section_view / cta_click 時) */
  section?: string;

  /** 診断フォームのステップ (diagnosis_step 時) */
  diagnosisStep?: string;

  // ── UTM & アトリビューション ──
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  /** カスタム: リファラルコード */
  ref?: string;
  /** カスタム: チームスラッグ */
  team?: string;
  /** 流入元ドメイン (document.referrer から抽出) */
  referrer?: string;

  // ── セッション ──
  sessionId: string;

  // ── デバイス ──
  screenWidth: number;
  userAgent: string;

  // ── タイムスタンプ (サーバー側で付与) ──
  // date: string;       // YYYY-MM-DD
  // createdAt: Timestamp
}

/** クライアント → API に送るペイロード */
export type TrackPayload = Omit<AnalyticsEvent, 'userAgent'>;

/** UTM + カスタムパラメータ */
export interface AttributionParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  ref?: string;
  team?: string;
  referrer?: string;
}
