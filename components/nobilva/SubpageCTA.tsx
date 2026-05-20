import React from "react";
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
}

export function SubpageCTA({
  heading,
  description,
  secondaryLinks,
  variant = "default",
  showLineCTA,
  footer,
}: SubpageCTAProps) {
  const isFinal = variant === "final";
  const renderedHeading =
    typeof heading === "string" ? wb(heading) : heading;
  const renderedDescription =
    typeof description === "string" ? wb(description) : description;

  return (
    <section
      className={
        isFinal
          ? "relative bg-gradient-to-b from-nobilva-light to-amber-50 py-20 md:py-28 lg:py-32"
          : "bg-gradient-to-b from-nobilva-light to-amber-50 py-16 md:py-24"
      }
    >
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
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
            renderedDescription
          )}
        </div>

        <div className="mb-8">
          <TrustBadges />
        </div>

        <div className={showLineCTA ? "mb-6" : ""}>
          <DiagnosisCTA variant="hero" />
        </div>

        {showLineCTA && (
          <p className="text-sm text-gray-500">
            まずは LINE で質問だけしてみたい方は
            <a
              href={LINE_ADD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-nobilva-accent hover:underline ml-1"
            >
              こちら
            </a>
          </p>
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
