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
 * - CTA クリック追跡用の関数を window に公開
 */

// バッファリング: 複数イベントをまとめて送信
let eventBuffer: TrackPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushEvents() {
  if (eventBuffer.length === 0) return;
  const events = [...eventBuffer];
  eventBuffer = [];
  flushTimer = null;

  // sendBeacon が使えれば使う（ページ離脱時にも確実に送信）
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
  // 500ms バッファリング
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

export function NobilvaTracker() {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewedSectionsRef = useRef<Set<string>>(new Set());

  // 初期化: UTM キャプチャ
  useEffect(() => {
    captureAttribution();
  }, []);

  // ページビュー送信
  useEffect(() => {
    queueEvent(buildPayload("page_view", pathname));
    // セクション追跡をリセット
    viewedSectionsRef.current.clear();
  }, [pathname]);

  // セクションスクロール追跡 (Intersection Observer)
  useEffect(() => {
    // 既存の observer をクリーンアップ
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const sectionName = (entry.target as HTMLElement).dataset.trackSection;
          if (!sectionName) continue;
          // 同一セッション・同一ページで同セクションは1回のみ送信
          if (viewedSectionsRef.current.has(sectionName)) continue;
          viewedSectionsRef.current.add(sectionName);
          queueEvent(buildPayload("section_view", pathname, { section: sectionName }));
        }
      },
      {
        // セクションの 30% が見えたら発火
        threshold: 0.3,
      },
    );

    // data-track-section 属性を持つ要素を observe
    const elements = document.querySelectorAll("[data-track-section]");
    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  // ページ離脱時にバッファをフラッシュ
  useEffect(() => {
    const handleBeforeUnload = () => flushEvents();
    window.addEventListener("beforeunload", handleBeforeUnload);
    // visibilitychange でも (モバイルのタブ切り替え対策)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushEvents();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // CTA クリックのグローバルハンドラ (data-track-cta 属性)
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

  return null; // UI なし
}
