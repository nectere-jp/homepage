"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "./animations/ScrollReveal";
import { Container } from "./layout/Container";

// undraw画像の配置場所: public/images/hero-undraw.svg （または .png）
// https://undraw.co などからダウンロードした画像を上記パスに配置してください

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-center bg-white pt-8 md:pt-24">
      <Container className="py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-24 items-center">
          {/* 左: テキスト */}
          <div className="text-center lg:text-left order-2 lg:order-1 flex-1 px-8 md:px-16 lg:px-0">
            <ScrollReveal delay={0.3}>
              <h1
                className="text-4xl md:text-6xl lg:text-6xl font-bold text-blue mb-6 md:mb-8"
                style={{ lineHeight: 1.3 }}
              >
                {t("catchphrase")}
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <p className="text-base md:text-xl text-text mb-8 leading-relaxed">
                {t("subtitle")}
              </p>
            </ScrollReveal>
          </div>

          {/* 右: undraw画像 */}
          <ScrollReveal
            delay={0.4}
            className="order-1 lg:order-2 flex-shrink-0 mt-8 lg:mt-0"
          >
            <div className="relative w-80 md:w-96 lg:w-[28rem] aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-undraw.svg"
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
