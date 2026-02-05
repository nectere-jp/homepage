"use client";

import { useTranslations, useLocale } from "next-intl";
import { Section } from "@/components/layout/Section";
import { FeatureCard } from "@/components/ui/FeatureCard";
import {
  HiOutlineChatAlt2,
  HiOutlineLightBulb,
  HiOutlineRefresh,
} from "react-icons/hi";

export function HeroSection() {
  const t = useTranslations("teachit");
  const locale = useLocale();
  const isJapanese = locale === "ja";

  return (
    <Section
      backgroundColor="white"
      padding="none"
      className="relative overflow-hidden"
    >
      {/* Main Visual Area */}
      <div className="relative flex items-center bg-teachit-light">
        <div className="relative z-10 pt-48 md:pt-56 pb-24 md:pb-32 w-full px-8 md:px-12 lg:px-16">
          {/* Top Section: Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center mb-6 md:mb-8">
            {/* Left: Text Content */}
            <div className="flex-1 space-y-3 md:space-y-4 max-w-none">
              {/* Main Catchphrase Area */}
              <div className="px-6 md:px-10 py-8 md:py-12 pb-6 md:pb-8 relative overflow-visible">
                <div className="relative z-10 space-y-4 overflow-visible">
                  <h1 className="font-black leading-tight">
                    {isJapanese ? (
                      <>
                        <span className="block text-base md:text-xl lg:text-2xl text-black mb-2">
                          {t("hero.title.prefix")}
                        </span>
                        <span className="text-4xl md:text-6xl lg:text-7xl text-teachit-main">
                          {t("hero.title.service")}
                        </span>
                        <span className="text-2xl md:text-4xl lg:text-5xl text-black">
                          {t("hero.title.suffix")}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="block text-base md:text-xl lg:text-2xl text-black mb-2">
                          {t("hero.title.prefix")}
                        </span>
                        <span className="text-4xl md:text-6xl lg:text-7xl text-teachit-main">
                          {t("hero.title.service")}
                        </span>
                        <span className="text-2xl md:text-4xl lg:text-5xl text-black">
                          {t("hero.title.suffix")}
                        </span>
                      </>
                    )}
                  </h1>
                </div>
                {/* 新規公開バッジ */}
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20">
                  <div className="bg-teachit-accent rounded-full w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 flex items-center justify-center aspect-square -rotate-12 shadow-lg">
                    <span
                      className="text-white font-black text-lg md:text-xl lg:text-2xl text-center px-0.5 leading-none"
                      style={{ letterSpacing: "-0.05em" }}
                    >
                      {t("hero.badge.text")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <FeatureCard
                  icon={HiOutlineChatAlt2}
                  title={t("hero.benefits.aiStudent")}
                  variant="hero"
                  iconColor="text-teachit-main"
                  className="rounded-[2rem]"
                />
                <FeatureCard
                  icon={HiOutlineLightBulb}
                  title={t("hero.benefits.question")}
                  variant="hero"
                  iconColor="text-teachit-main"
                  className="rounded-[2rem]"
                />
                <FeatureCard
                  icon={HiOutlineRefresh}
                  title={t("hero.benefits.forget")}
                  variant="hero"
                  iconColor="text-teachit-main"
                  className="rounded-[2rem]"
                />
              </div>
            </div>

            {/* Right: Illustration Placeholder */}
            <div className="flex-shrink-0 w-full lg:w-[500px] xl:w-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] bg-white/50 rounded-full"></div>
                </div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-full h-full bg-teachit-main/10 rounded-[3rem] flex items-center justify-center text-teachit-accent text-2xl md:text-3xl font-bold">
                    AI × Math
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: CTA Cards */}
          <div className="bg-teachit-main rounded-none p-3 md:p-4 lg:p-5 shadow-lg -mx-8 md:-mx-12 lg:-mx-16 px-8 md:px-12 lg:px-16 mt-16 md:mt-24 lg:mt-32 relative overflow-hidden">
            {/* 斜め下半分の濃い影 */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-center">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-105 flex items-center justify-center text-center font-black text-2xl md:text-3xl lg:text-4xl py-2 md:py-3 text-white mr-4 md:mr-6 lg:mr-8"
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
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black rounded-[2rem] py-3 md:py-4 lg:py-5 px-6 md:px-8 lg:px-10 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-center font-semibold text-base md:text-lg lg:text-xl whitespace-nowrap w-auto"
              >
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.278.8-3.157.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                {t("hero.cta.appStore")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
