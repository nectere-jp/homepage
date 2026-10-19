"use client";

/**
 * チーム専用ページの計測ロジック。
 * `/services/nobilva/teams/[slug]?c=<campaign>` へのアクセスを
 * sessionId 単位で紐付け、scroll_depth / section_view / cta_click /
 * session_end をまとめて追跡する。
 *
 * 設計の約束:
 *  - scroll_depth と section_view はベストスコアだけを session_end 時に 1 回送信
 *    （Firestore 書き込みを 1 セッション 2〜3 回に抑える）
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

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export type TeamTrackEvent =
  | "page_view"
  | "cta_click"
  | "cta_click_outbound"
  | "section_view"
  | "scroll_depth"
  | "session_end"
  | "invalid_campaign";

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
  return id;
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
  ctaClicks: Array<{ ctaId: string; href: string; at: string }>;
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

export interface UseTeamSessionOptions {
  slug: string;
  /** そのチームの有効キャンペーン slug 一覧 */
  validCampaignSlugs: string[];
  /** セクション要素の DOM id と表示ラベル */
  sections: SectionSpec[];
}

export interface UseTeamSessionResult {
  /** CTA 押下時に呼ぶ。ctaId はテレメトリ上の識別子、href は遷移先。 */
  trackCtaClick: (ctaId: string, href?: string) => void;
}

export function useTeamSession(options: UseTeamSessionOptions): UseTeamSessionResult {
  const { slug, validCampaignSlugs, sections } = options;

  const sessionIdRef = useRef<string>("");
  const firstTouchRef = useRef<FirstTouch | null>(null);
  const landedAtMsRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const sectionTimesRef = useRef<Record<string, { total: number; enteredAt: number | null }>>({});
  const ctaClicksRef = useRef<Array<{ ctaId: string; href: string; at: string }>>([]);
  const endedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!hasWindow()) return;

    const sessionId = getOrCreateSessionId();
    sessionIdRef.current = sessionId;
    const firstTouch = captureFirstTouchOnce();
    firstTouchRef.current = firstTouch;
    landedAtMsRef.current = Date.now();

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
      sectionTimesRef.current[s.id] = { total: 0, enteredAt: null };
      const el = document.getElementById(s.id);
      if (!el) continue;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const t = sectionTimesRef.current[s.id];
            const now = Date.now();
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              if (t.enteredAt == null) t.enteredAt = now;
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

    const stopAllTimers = () => {
      const now = Date.now();
      for (const id of Object.keys(sectionTimesRef.current)) {
        const t = sectionTimesRef.current[id];
        if (t.enteredAt != null) {
          t.total += now - t.enteredAt;
          t.enteredAt = null;
        }
      }
    };

    const flushSessionEnd = () => {
      if (endedRef.current) return;
      if (!sessionIdRef.current || !firstTouchRef.current) return;
      endedRef.current = true;
      stopAllTimers();
      const now = new Date();
      const durationMs = Date.now() - landedAtMsRef.current;
      const sectionsOut = sections.map((s) => ({
        id: s.id,
        label: s.label,
        dwellMs: Math.round(sectionTimesRef.current[s.id]?.total ?? 0),
      }));
      sendSessionEnd({
        slug,
        sessionId: sessionIdRef.current,
        campaignSlug: firstTouchRef.current.campaignSlug,
        firstTouch: firstTouchRef.current,
        device: getDevice(),
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        maxScrollDepth: Math.round(maxScrollRef.current),
        sections: sectionsOut,
        ctaClicks: ctaClicksRef.current,
        landedAt: firstTouchRef.current.landedAt,
        endedAt: now.toISOString(),
        durationMs,
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushSessionEnd();
    };
    const onPageHide = () => flushSessionEnd();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      for (const io of observers) io.disconnect();
    };
    // validCampaignSlugs / sections を deps に入れると props 変化で再購読して
    // 二重計測の原因になる。slug 単位でライフサイクルを固定する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const trackCtaClick = useCallback(
    (ctaId: string, href = "") => {
      touchSession();
      ctaClicksRef.current.push({
        ctaId,
        href,
        at: new Date().toISOString(),
      });
      sendTrack({
        slug,
        event: "cta_click",
        sessionId: sessionIdRef.current,
        campaignSlug: firstTouchRef.current?.campaignSlug ?? null,
        payload: { ctaId, href },
      });
    },
    [slug],
  );

  return { trackCtaClick };
}
