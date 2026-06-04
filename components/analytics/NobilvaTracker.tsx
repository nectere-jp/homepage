"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getSessionId, captureAttribution, getAttribution } from "@/lib/analytics/session";
import type { TrackPayload, AnalyticsEventType } from "@/lib/analytics/types";

/**
 * NobilvaTracker
 *
 * Nobilva 配下のページで使用するアナリティクストラッカー。
 * - ページビュー自動送信
 * - セクション表示の Intersection Observer 追跡
 * - 全ページのスクロール深度 (scroll_depth) 追跡
 * - CTA クリック追跡
 */

// バッファリング: 複数イベントをまとめて送信
let eventBuffer: TrackPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushEvents() {
  if (eventBuffer.length === 0) return;
  const events = [...eventBuffer];
  eventBuffer = [];
  flushTimer = null;

  const payload = JSON.stringify({ events });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

function queueEvent(event: TrackPayload) {
  eventBuffer.push(event);
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushEvents, 500);
}

function buildPayload(
  eventType: AnalyticsEventType,
  path: string,
  extra?: Partial<TrackPayload>,
): TrackPayload {
  const attribution = getAttribution();
  return {
    eventType,
    path,
    sessionId: getSessionId(),
    screenWidth: window.innerWidth,
    ...attribution,
    ...extra,
  };
}

/** 外部から呼べるトラッキング関数 */
export function trackNobilvaEvent(
  eventType: AnalyticsEventType,
  extra?: Partial<TrackPayload>,
) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  queueEvent(buildPayload(eventType, path, extra));
}

// ── スクロール深度グローバル管理 ──
// pathname → max scroll percent (0-100)
const scrollDepthMap = new Map<string, number>();

function updateScrollDepth(pathname: string) {
  const docH = document.documentElement.scrollHeight;
  if (docH <= 0) return;
  const pct = Math.min(100, Math.round(
    ((window.scrollY + window.innerHeight) / docH) * 100,
  ));
  const current = scrollDepthMap.get(pathname) || 0;
  if (pct > current) scrollDepthMap.set(pathname, pct);
}

function sendScrollDepth(pathname: string) {
  const pct = scrollDepthMap.get(pathname);
  if (pct != null && pct > 0) {
    queueEvent(buildPayload("scroll_depth", pathname, { scrollPercent: pct }));
    scrollDepthMap.delete(pathname);
  }
}

export function NobilvaTracker() {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewedSectionsRef = useRef<Set<string>>(new Set());
  const prevPathnameRef = useRef<string>("");

  // 初期化: UTM キャプチャ
  useEffect(() => {
    captureAttribution();
  }, []);

  // ページビュー送信 + 前ページのスクロール深度送信
  useEffect(() => {
    // 前ページのスクロール深度を送信
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      sendScrollDepth(prevPathnameRef.current);
    }
    prevPathnameRef.current = pathname;

    // 新ページの PV 送信
    queueEvent(buildPayload("page_view", pathname));
    viewedSectionsRef.current.clear();
  }, [pathname]);

  // スクロール深度追跡 (全ページ共通)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateScrollDepth(pathname);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // 初期位置もキャプチャ (ページ読み込み直後の viewport 分)
    updateScrollDepth(pathname);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // セクションスクロール追跡 (Intersection Observer)
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const sectionName = (entry.target as HTMLElement).dataset.trackSection;
          if (!sectionName) continue;
          if (viewedSectionsRef.current.has(sectionName)) continue;
          viewedSectionsRef.current.add(sectionName);
          queueEvent(buildPayload("section_view", pathname, { section: sectionName }));
        }
      },
      { threshold: 0.3 },
    );

    const elements = document.querySelectorAll("[data-track-section]");
    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  // ページ離脱時にスクロール深度送信 + バッファフラッシュ
  useEffect(() => {
    const handleExit = () => {
      sendScrollDepth(pathname);
      flushEvents();
    };
    window.addEventListener("beforeunload", handleExit);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleExit();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  // CTA クリックのグローバルハンドラ
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-track-cta]") as HTMLElement | null;
      if (!target) return;
      const ctaName = target.dataset.trackCta || "unknown";
      queueEvent(buildPayload("cta_click", pathname, { section: ctaName }));
    },
    [pathname],
  );

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);

  return null;
}
