"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/Container";
import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <Container className="py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <ScrollReveal delay={0.2}>
            <div className="text-pink text-8xl md:text-9xl font-black mb-6" style={{ fontFamily: "'M PLUS Rounded 1c', system-ui, sans-serif" }}>
              {t("title")}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <h1 className="text-3xl md:text-4xl font-bold text-blue mb-6">
              {t("heading")}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.6}>
            <p className="text-lg md:text-xl text-text mb-10 leading-relaxed">
              {t("message")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.8}>
            <CTAButton href="/" variant="solid" className="text-lg">
              {t("backToHome")}
            </CTAButton>
          </ScrollReveal>

          {/* 装飾的な要素 */}
          <div className="mt-16 opacity-20">
            <svg
              className="mx-auto w-64 h-64"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#FA6B82"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.2C64.8,55.2,53.8,66.6,40.3,73.8C26.8,81,10.8,83.9,-4.8,82.3C-20.4,80.7,-35.5,74.7,-48.9,66.2C-62.3,57.7,-74,46.7,-80.8,33.2C-87.6,19.7,-89.5,3.7,-86.8,-11.2C-84.1,-26.1,-76.8,-39.9,-66.8,-51.5C-56.8,-63.1,-44.1,-72.5,-30.2,-80.1C-16.3,-87.7,-1.2,-93.5,13.2,-91.8C27.6,-90.1,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
        </div>
      </Container>
    </div>
  );
}
