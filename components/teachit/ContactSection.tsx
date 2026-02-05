"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";

export function ContactSection() {
  const t = useTranslations("teachit");

  return (
    <Section id="contact" backgroundColor="transparent" padding="none">
      {/* CTA Section - ページ横幅いっぱい */}
      <div className="bg-teachit-main rounded-none px-3 md:px-4 lg:px-5 py-8 md:py-12 lg:py-16 shadow-lg relative overflow-hidden w-full">
        {/* 斜め下半分の濃い影 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-3 md:gap-4 justify-center items-center max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all hover:scale-105 block text-center font-black text-3xl md:text-4xl lg:text-5xl xl:text-6xl py-2 md:py-3 text-white leading-relaxed"
          >
            {t("hero.cta.main")
              .split("\n")
              .map((line, index, array) => (
                <span key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </span>
              ))}
          </a>
          <a
            href={`mailto:${t("contact.email")}`}
            className="bg-white text-black rounded-[2rem] py-3 md:py-4 lg:py-5 px-6 md:px-8 lg:px-10 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-center font-semibold text-base md:text-lg lg:text-xl whitespace-nowrap w-auto"
          >
            {t("contact.cta")}
          </a>
        </div>
      </div>
    </Section>
  );
}
