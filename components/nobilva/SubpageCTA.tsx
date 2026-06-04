import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DiagnosisCTA } from "./DiagnosisCTA";
import { ChevronRightIcon } from "./Icons";
import { TrustBadges } from "./TrustBadges";
import { LINE_ADD_URL } from "@/lib/constants";
import { wb } from "@/lib/wb";

interface SubpageCTAProps {
  heading: React.ReactNode;
  description: React.ReactNode;
  secondaryLinks?: { label: string; href: string }[];
  variant?: "default" | "final";
  showLineCTA?: boolean;
  footer?: React.ReactNode;
  ctaHref?: string;
  onCTAClick?: () => void;
  ctaLabel?: string;
  backgroundImage?: { src: string; alt: string };
}

export function SubpageCTA({
  heading,
  description,
  secondaryLinks,
  variant = "default",
  showLineCTA,
  footer,
  ctaHref,
  onCTAClick,
  ctaLabel,
  backgroundImage,
}: SubpageCTAProps) {
  const isFinal = variant === "final";
  const renderedHeading =
    typeof heading === "string" ? wb(heading) : heading;
  const renderedDescription =
    typeof description === "string" ? wb(description) : description;

  return (
    <section
      className={`relative overflow-hidden ${
        isFinal
          ? "py-20 md:py-28 lg:py-32"
          : "py-16 md:py-24"
      } ${backgroundImage ? "" : "bg-gradient-to-b from-nobilva-light to-amber-50"}`}
    >
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/75" />
        </>
      )}
      <div className="relative max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
        <h2
          className={`bg-nobilva-main px-10 py-4 font-black text-black tracking-tight inline-block ${
            isFinal
              ? "text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-snug mb-6 md:mb-8"
              : "text-2xl md:text-3xl lg:text-4xl mb-4"
          }`}
        >
          {renderedHeading}
        </h2>

        <div
          className={`text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto ${
            isFinal ? "mb-8 md:mb-10 space-y-2" : "mb-8"
          }`}
        >
          {typeof description === "string" ? (
            <p>{renderedDescription}</p>
          ) : (
            description
          )}
        </div>

        <div className="mb-8">
          <TrustBadges />
        </div>

        <div className={showLineCTA ? "mb-6" : ""}>
          <DiagnosisCTA
            variant="hero"
            href={ctaHref}
            onClick={onCTAClick}
            label={ctaLabel}
          />
        </div>

        {showLineCTA && (
          <div className="mt-10 pt-8 border-t border-gray-200/60">
            <p className="text-sm text-gray-500 mb-4">
              まずは LINE で質問だけしてみたい方へ
            </p>
            <div className="flex flex-col items-center gap-4">
              <a
                href={LINE_ADD_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track-cta="line-final"
                className="inline-flex items-center gap-2 border border-[#06C755] text-[#06C755] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#06C755]/5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEで気軽に相談する
              </a>
              <a
                href={LINE_ADD_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track-cta="line-final-qr"
                className="block"
              >
                <Image
                  src="/images/nobilva/line-qr.png"
                  alt="Nobilva公式LINE QRコード"
                  width={120}
                  height={120}
                  className="mx-auto"
                />
                <p className="text-xs text-gray-400 mt-1.5">スマホでQRを読み取り</p>
              </a>
            </div>
          </div>
        )}

        {secondaryLinks && secondaryLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm md:text-base"
              >
                {link.label}
                <ChevronRightIcon size="xs" />
              </Link>
            ))}
          </div>
        )}

        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </section>
  );
}
