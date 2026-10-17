"use client";

import { useEffect, useState } from "react";

/**
 * ブログ記事スマホ下部の固定 CTA バー
 *
 * - スマホ幅 (768px 未満) のみ表示
 * - 最初の H2 (本文内 `h2`) を通過してから出す
 * - 本文中の `.cta-block` が画面内にある間、およびフッター付近では隠す
 * - 高さ 64px 以内、`env(safe-area-inset-bottom)` 対応
 * - 面談ボタン (主、オレンジ) + LINE への小さいリンク (副)
 *
 * 記事ごとに ON/OFF したいので frontmatter の `stickyCta: true` を見て
 * 記事ページから配置する想定。本コンポーネント自体は props なしで動く。
 */
export function StickyMobileCTA({
  consultHref = "/ja/services/nobilva/diagnosis",
  consultTrack = "sticky_consult",
  lineHref = "https://lin.ee/XXwhO3b",
  lineTrack = "sticky_line",
}: {
  consultHref?: string;
  consultTrack?: string;
  lineHref?: string;
  lineTrack?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const isMobile = () => !mql.matches;

    // 最初の H2 の位置を取得 (記事本文の .prose 配下)
    const firstH2 = document.querySelector(".prose h2, article h2");
    const ctaBlocks = Array.from(document.querySelectorAll(".cta-block"));
    const footer = document.querySelector("footer");

    // 1画面でも観測対象がない場合は何もしない (記事構造外ページ対策)
    if (!firstH2 && ctaBlocks.length === 0) return;

    const compute = () => {
      if (!isMobile()) {
        setVisible(false);
        return;
      }
      // 最初の H2 を通過したか (上端が viewport 上端より上に出たか)
      let afterFirstH2 = true;
      if (firstH2) {
        const r = firstH2.getBoundingClientRect();
        afterFirstH2 = r.bottom < 0;
      }
      if (!afterFirstH2) {
        setVisible(false);
        return;
      }
      // 本文中の CTA ブロックが可視中なら隠す (重複を避ける)
      const anyCtaVisible = ctaBlocks.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      if (anyCtaVisible) {
        setVisible(false);
        return;
      }
      // フッターが見えてきたら隠す
      if (footer) {
        const fr = footer.getBoundingClientRect();
        if (fr.top < window.innerHeight) {
          setVisible(false);
          return;
        }
      }
      setVisible(true);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        compute();
        ticking = false;
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    const mqlListener = () => compute();
    mql.addEventListener("change", mqlListener);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      mql.removeEventListener("change", mqlListener);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className="md:hidden fixed left-0 right-0 bottom-0 z-40 pointer-events-none transition-transform duration-200"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="pointer-events-auto bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] flex items-center gap-2 px-3 py-2"
        style={{ minHeight: 56 }}
      >
        <a
          href={consultHref}
          data-track-cta={consultTrack}
          className="flex-1 inline-flex items-center justify-center h-11 px-3 rounded-md font-bold text-white text-[14px] leading-none"
          style={{ background: "#ee741a" }}
        >
          無料学習面談を予約する
        </a>
        <a
          href={lineHref}
          target="_blank"
          rel="noopener noreferrer"
          data-track-cta={lineTrack}
          className="inline-flex items-center justify-center h-11 px-3 rounded-md text-[13px] font-semibold text-white"
          style={{ background: "#06C755" }}
          aria-label="LINE で友だち追加"
        >
          LINE
        </a>
      </div>
    </div>
  );
}
