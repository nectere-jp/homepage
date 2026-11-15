"use client";

/**
 * チーム専用ページの計測ロジック。
 * `/services/nobilva/teams/[slug]?c=<campaign>` へのアクセスを
 * sessionId 単位で紐付け、scroll_depth / section_view / cta_click /
 * session_end をまとめて追跡する。
 *
 * 設計の約束:
 *  - scroll_depth と section_view はベストスコアだけを session_end でまとめて送信
 *  - session_end はタブが隠れたとき・ページを離れたとき・ページ内遷移で
 *    チームページを出たときに、その時点の最新の状態を送る。
 *    受け側は sessionId で上書き保存するので、何度送っても 1 件にまとまる
 *  - 途中経過は sessionStorage に残し、同じセッションでチームページへ戻ったら続きから数える
 *  - cta_click は押下時に即送信（遷移先 href を同梱）
 *  - 流入経路（campaign/UTM/referrer）は初回だけ sessionStorage に固定化
 *  - 不正な campaign slug は `invalid_campaign` として記録し、campaignSlug は null 化
 */

import { useCallback, useEffect, useRef } from "react";
import { isInternalUser } from "./session";

const SESSION_ID_KEY = "nobilva_team_session_id";
const SESSION_ACTIVE_KEY = "nobilva_team_session_active";
const FIRST_TOUCH_KEY = "nobilva_team_first_touch";
const PAGEVIEW_SENT_KEY = "nobilva_team_pageview_sent";
const SESSION_STATE_KEY = "nobilva_team_session_state";
/** チームページを見たタブに残す、そのチームの slug。 */
export const TEAM_SLUG_KEY = "nobilva_team_slug";

const TEAM_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export type TeamTrackEvent =
  | "page_view"
  | "cta_click"
  | "cta_click_outbound"
  | "section_view"
  | "scroll_depth"
  | "session_end"
  | "invalid_campaign";

/** CTA の種類。consult = 無料学習面談ボタン、line = LINE 追加ボタン。 */
export type CtaType = "consult" | "line";

export interface FirstTouch {
  campaignSlug: string | null;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  referrer: string | null;
  landedAt: string;
  landingPath: string;
}

export interface SectionSpec {
  id: string;
  label: string;
}

interface CtaClickRecord {
  ctaId: string;
  ctaType: CtaType;
  href: string;
  at: string;
}

/** 同じセッションでチームページを開き直したときに引き継ぐ途中経過。 */
interface StoredSessionState {
  sessionId: string;
  slug: string;
  /** ページが見えていた時間の合計 */
  activeMs: number;
  maxScroll: number;
  sectionMs: Record<string, number>;
  ctaClicks: CtaClickRecord[];
}

type Device = "mobile" | "tablet" | "desktop";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* noop */
  }
}

function removeStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

function getUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getDevice(): Device {
  if (!hasWindow()) return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function parseUtm(url: URL): FirstTouch["utm"] {
  const utm: FirstTouch["utm"] = {};
  const p = url.searchParams;
  const src = p.get("utm_source");
  const med = p.get("utm_medium");
  const cmp = p.get("utm_campaign");
  const cnt = p.get("utm_content");
  const trm = p.get("utm_term");
  if (src) utm.source = src;
  if (med) utm.medium = med;
  if (cmp) utm.campaign = cmp;
  if (cnt) utm.content = cnt;
  if (trm) utm.term = trm;
  return utm;
}

function getOrCreateSessionId(): string {
  const existing = readStorage(SESSION_ID_KEY);
  const lastActiveRaw = readStorage(SESSION_ACTIVE_KEY);
  const lastActive = lastActiveRaw ? parseInt(lastActiveRaw, 10) : 0;
  const now = Date.now();

  if (existing && now - lastActive < IDLE_TIMEOUT_MS) {
    writeStorage(SESSION_ACTIVE_KEY, String(now));
    return existing;
  }

  const id = getUUID();
  writeStorage(SESSION_ID_KEY, id);
  writeStorage(SESSION_ACTIVE_KEY, String(now));
  removeStorage(FIRST_TOUCH_KEY);
  removeStorage(PAGEVIEW_SENT_KEY);
  removeStorage(SESSION_STATE_KEY);
  return id;
}

function readSessionState(sessionId: string, slug: string): StoredSessionState | null {
  const raw = readStorage(SESSION_STATE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as StoredSessionState;
    return state.sessionId === sessionId && state.slug === slug ? state : null;
  } catch {
    return null;
  }
}

function touchSession(): void {
  writeStorage(SESSION_ACTIVE_KEY, String(Date.now()));
}

function captureFirstTouchOnce(): FirstTouch {
  const existing = readStorage(FIRST_TOUCH_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as FirstTouch;
    } catch {
      /* re-capture */
    }
  }
  const url = new URL(window.location.href);
  const utm = parseUtm(url);
  const campaign = url.searchParams.get("c");
  const ft: FirstTouch = {
    campaignSlug: campaign && campaign.length > 0 ? campaign : null,
    utm,
    referrer: document.referrer || null,
    landedAt: new Date().toISOString(),
    landingPath: url.pathname,
  };
  writeStorage(FIRST_TOUCH_KEY, JSON.stringify(ft));
  return ft;
}

interface TrackPayload {
  slug: string;
  event: TeamTrackEvent;
  sessionId: string;
  campaignSlug?: string | null;
  payload?: Record<string, unknown>;
  internal?: boolean;
}

function sendTrack(payload: TrackPayload): void {
  try {
    const body: TrackPayload = isInternalUser() ? { ...payload, internal: true } : payload;
    fetch("/api/teams/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}

interface SessionEndPayload {
  slug: string;
  sessionId: string;
  campaignSlug: string | null;
  firstTouch: FirstTouch;
  device: Device;
  userAgent: string;
  screenWidth: number;
  maxScrollDepth: number;
  sections: Array<{ id: string; label: string; dwellMs: number }>;
  ctaClicks: CtaClickRecord[];
  landedAt: string;
  endedAt: string;
  durationMs: number;
  internal?: boolean;
}

function sendSessionEnd(payload: SessionEndPayload): void {
  const body = JSON.stringify(isInternalUser() ? { ...payload, internal: true } : payload);
  const blob = new Blob([body], { type: "application/json" });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/teams/track-end", blob);
      return;
    }
  } catch {
    /* fallthrough */
  }
  try {
    fetch("/api/teams/track-end", {
      method: "POST",
      body: blob,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}

/**
 * いまの訪問がどのチーム経由かを返す。チーム経由でなければ null。
 * URL の `?team=<slug>` を優先し、無ければチームページが sessionStorage に
 * 残した slug を使う。クライアントでのみ値が取れる。
 */
export function getVisitTeamSlug(): string | null {
  if (!hasWindow()) return null;
  const fromUrl = new URLSearchParams(window.location.search).get("team");
  const slug = fromUrl || readStorage(TEAM_SLUG_KEY);
  return slug && TEAM_SLUG_PATTERN.test(slug) ? slug : null;
}

/**
 * チームページの外（例: `/how-it-works?team=<slug>`）で押された CTA を
 * チーム計測に記録する。チームページ内では `useTeamSession` の
 * `trackCtaClick` を使う。
 *
 * セッション ID と流入経路はチームページが作ったものを引き継ぐ。
 * session_end のサマリー（teamSessions）には入らず、teamEvents にだけ残る。
 */
export function trackTeamCtaClick(
  slug: string,
  ctaId: string,
  ctaType: CtaType,
  href = "",
): void {
  if (!hasWindow()) return;
  let campaignSlug: string | null = null;
  const firstTouchRaw = readStorage(FIRST_TOUCH_KEY);
  if (firstTouchRaw) {
    try {
      campaignSlug = (JSON.parse(firstTouchRaw) as FirstTouch).campaignSlug;
    } catch {
      /* 壊れていたら経路なしで送る */
    }
  }
  touchSession();
  sendTrack({
    slug,
    event: "cta_click",
    sessionId: readStorage(SESSION_ID_KEY) ?? "",
    campaignSlug,
    payload: { ctaId, ctaType, href, path: window.location.pathname },
  });
}

export interface UseTeamSessionOptions {
  slug: string;
  /** そのチームの有効キャンペーン slug 一覧 */
  validCampaignSlugs: string[];
  /** セクション要素の DOM id と表示ラベル */
  sections: SectionSpec[];
}

export interface UseTeamSessionResult {
  /**
   * CTA 押下時に呼ぶ。
   *  - ctaId: テレメトリ上の識別子（例: hero_diagnosis / final_line）
   *  - ctaType: ボタンの種類（consult = 無料学習面談 / line = LINE 追加）
   *  - href: 遷移先。省略時は空文字。
   */
  trackCtaClick: (ctaId: string, ctaType: CtaType, href?: string) => void;
}

export function useTeamSession(options: UseTeamSessionOptions): UseTeamSessionResult {
  const { slug, validCampaignSlugs, sections } = options;

  const sessionIdRef = useRef<string>("");
  const firstTouchRef = useRef<FirstTouch | null>(null);
  /** ページが見えていた時間の合計。見えている最中の分は visibleSinceRef から足す */
  const activeMsRef = useRef<number>(0);
  const visibleSinceRef = useRef<number | null>(null);
  const maxScrollRef = useRef<number>(0);
  const sectionTimesRef = useRef<
    Record<string, { total: number; enteredAt: number | null; inView: boolean }>
  >({});
  const ctaClicksRef = useRef<CtaClickRecord[]>([]);
  /** いまの状態を送信済みか。ページがまた見えるようになったら false に戻す */
  const flushedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!hasWindow()) return;

    const sessionId = getOrCreateSessionId();
    sessionIdRef.current = sessionId;
    const firstTouch = captureFirstTouchOnce();
    firstTouchRef.current = firstTouch;

    // 同じセッションで戻ってきたときは、前回までの経過の続きから数える
    const restored = readSessionState(sessionId, slug);
    activeMsRef.current = restored?.activeMs ?? 0;
    maxScrollRef.current = restored?.maxScroll ?? 0;
    ctaClicksRef.current = restored?.ctaClicks ?? [];
    visibleSinceRef.current = document.visibilityState === "hidden" ? null : Date.now();
    flushedRef.current = false;

    let effectiveCampaign = firstTouch.campaignSlug;
    if (effectiveCampaign && !validCampaignSlugs.includes(effectiveCampaign)) {
      sendTrack({
        slug,
        event: "invalid_campaign",
        sessionId,
        campaignSlug: null,
        payload: { attempted: effectiveCampaign },
      });
      effectiveCampaign = null;
      const fixed: FirstTouch = { ...firstTouch, campaignSlug: null };
      firstTouchRef.current = fixed;
      writeStorage(FIRST_TOUCH_KEY, JSON.stringify(fixed));
    }

    const alreadySent = readStorage(PAGEVIEW_SENT_KEY) === "1";
    if (!alreadySent) {
      sendTrack({
        slug,
        event: "page_view",
        sessionId,
        campaignSlug: effectiveCampaign,
        payload: {
          firstTouch: firstTouchRef.current,
          device: getDevice(),
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          path: window.location.pathname,
        },
      });
      writeStorage(PAGEVIEW_SENT_KEY, "1");
    }

    let scrollTimer: number | null = null;
    const measureScroll = () => {
      scrollTimer = null;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const viewport = window.innerHeight;
      const full = doc.scrollHeight;
      const denom = Math.max(1, full - viewport);
      const percent = Math.min(100, Math.max(0, (scrollTop / denom) * 100));
      if (percent > maxScrollRef.current) maxScrollRef.current = percent;
      touchSession();
    };
    const onScroll = () => {
      if (scrollTimer != null) return;
      scrollTimer = window.setTimeout(measureScroll, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    measureScroll();

    const observers: IntersectionObserver[] = [];
    for (const s of sections) {
      sectionTimesRef.current[s.id] = {
        total: restored?.sectionMs[s.id] ?? 0,
        enteredAt: null,
        inView: false,
      };
      const el = document.getElementById(s.id);
      if (!el) continue;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const t = sectionTimesRef.current[s.id];
            const now = Date.now();
            t.inView = entry.isIntersecting && entry.intersectionRatio >= 0.3;
            if (t.inView) {
              if (t.enteredAt == null && document.visibilityState !== "hidden") {
                t.enteredAt = now;
              }
            } else if (t.enteredAt != null) {
              t.total += now - t.enteredAt;
              t.enteredAt = null;
            }
          }
          touchSession();
        },
        { threshold: [0, 0.3, 0.6, 1] },
      );
      io.observe(el);
      observers.push(io);
    }

    /** 滞在時間とセクション滞在の計測を止め、ここまでの分を合計に足す */
    const pauseTimers = () => {
      const now = Date.now();
      if (visibleSinceRef.current != null) {
        activeMsRef.current += now - visibleSinceRef.current;
        visibleSinceRef.current = null;
      }
      for (const id of Object.keys(sectionTimesRef.current)) {
        const t = sectionTimesRef.current[id];
        if (t.enteredAt != null) {
          t.total += now - t.enteredAt;
          t.enteredAt = null;
        }
      }
    };

    /** ページがまた見えるようになったら計測を再開し、次の送信を許可する */
    const resumeTimers = () => {
      const now = Date.now();
      if (visibleSinceRef.current == null) visibleSinceRef.current = now;
      for (const id of Object.keys(sectionTimesRef.current)) {
        const t = sectionTimesRef.current[id];
        if (t.inView && t.enteredAt == null) t.enteredAt = now;
      }
      flushedRef.current = false;
    };

    const flushSessionEnd = () => {
      // 隠れている間は状態が変わらないので、同じ内容を二度は送らない
      // （タブを閉じると visibilitychange と pagehide が続けて来る）
      if (flushedRef.current) return;
      if (!sessionIdRef.current || !firstTouchRef.current) return;
      flushedRef.current = true;
      pauseTimers();
      const sectionMs: Record<string, number> = {};
      for (const s of sections) {
        sectionMs[s.id] = Math.round(sectionTimesRef.current[s.id]?.total ?? 0);
      }
      const state: StoredSessionState = {
        sessionId: sessionIdRef.current,
        slug,
        activeMs: activeMsRef.current,
        maxScroll: maxScrollRef.current,
        sectionMs,
        ctaClicks: ctaClicksRef.current,
      };
      writeStorage(SESSION_STATE_KEY, JSON.stringify(state));
      sendSessionEnd({
        slug,
        sessionId: sessionIdRef.current,
        campaignSlug: firstTouchRef.current.campaignSlug,
        firstTouch: firstTouchRef.current,
        device: getDevice(),
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        maxScrollDepth: Math.round(maxScrollRef.current),
        sections: sections.map((s) => ({
          id: s.id,
          label: s.label,
          dwellMs: sectionMs[s.id],
        })),
        ctaClicks: ctaClicksRef.current,
        landedAt: firstTouchRef.current.landedAt,
        endedAt: new Date().toISOString(),
        durationMs: Math.round(activeMsRef.current),
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushSessionEnd();
      else resumeTimers();
    };
    const onPageHide = () => flushSessionEnd();
    // bfcache から復元されたとき（ブラウザの「戻る」）
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) resumeTimers();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      // 面談ボタンなど <Link> によるページ内遷移では pagehide も
      // visibilitychange も起きないので、チームページを出るここで送る。
      // 開発時は StrictMode の二重マウントで、表示直後にも 1 回送られる。
      flushSessionEnd();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      for (const io of observers) io.disconnect();
    };
    // validCampaignSlugs / sections を deps に入れると props 変化で再購読して
    // 二重計測の原因になる。slug 単位でライフサイクルを固定する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const trackCtaClick = useCallback(
    (ctaId: string, ctaType: CtaType, href = "") => {
      touchSession();
      ctaClicksRef.current.push({
        ctaId,
        ctaType,
        href,
        at: new Date().toISOString(),
      });
      sendTrack({
        slug,
        event: "cta_click",
        sessionId: sessionIdRef.current,
        campaignSlug: firstTouchRef.current?.campaignSlug ?? null,
        payload: { ctaId, ctaType, href },
      });
    },
    [slug],
  );

  return { trackCtaClick };
}
