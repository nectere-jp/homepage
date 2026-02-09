"use client";

import { Section } from "@/components/layout/Section";
import {
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { useSportAnimation } from "@/hooks/useSportAnimation";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { useEffect } from "react";
import { sportAnimationStyles } from "./styles/sportAnimationStyles";
import { HeroCatchphrase } from "./HeroCatchphrase";
import { SportIllustration } from "./SportIllustration";
import { HeroCTA } from "./HeroCTA";

interface HeroSectionProps {
  sports: string[];
  isJapanese: boolean;
  heroTitle: {
    prefix: string;
    suffix: string;
    service: string;
  };
  heroPrice: {
    label: string;
    amount: string;
    currency: string;
    from: string;
    note: string;
  };
  heroBadgeText: string;
  heroBenefits: {
    weekly: string;
    chat: string;
    tutoring: string;
  };
  heroCtaMain: string;
  heroCtaLine: string;
  heroImageAlt: string;
}

export function HeroSection({
  sports,
  isJapanese,
  heroTitle,
  heroPrice,
  heroBadgeText,
  heroBenefits,
  heroCtaMain,
  heroCtaLine,
  heroImageAlt,
}: HeroSectionProps) {
  const { currentSport, sportFileName, imageError, handleImageError } =
    useSportAnimation(sports);

  // Hero画像の優先読み込み
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = "/images/nobilva/hero.jpg";
    link.as = "image";
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <style jsx>{sportAnimationStyles}</style>
      <Section
        backgroundColor="white"
        padding="none"
        className="relative overflow-hidden"
      >
        {/* Main Visual Area */}
        <div
          className="relative flex items-center bg-white bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/nobilva/hero.jpg)" }}
        >
          <div className="relative z-10 pt-6 md:pt-16 2xl:pt-20 pb-12 md:pb-16 2xl:pb-20 w-full px-4 md:px-8 lg:px-16 2xl:px-24">
            {/* Top Section: Main Content and Image */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row  lg:gap-12 2xl:gap-16 items-center mb-6 md:mb-8 2xl:mb-12">
              {/* sm専用: イラストを最初に表示 */}
              <div className="md:hidden flex justify-center w-full mb-0">
                <SportIllustration
                  currentSport={currentSport}
                  sportFileName={sportFileName}
                  imageError={imageError}
                  handleImageError={handleImageError}
                  heroImageAlt={heroImageAlt}
                  size="small"
                />
              </div>

              {/* Left: Text Content */}
              <div className="flex-1 space-y-6 md:space-y-8 2xl:space-y-12 w-[95%]">
                {/* Main Catchphrase Area */}
                <div className="md:mt-0 -mt-2">
                  <HeroCatchphrase
                    isJapanese={isJapanese}
                    heroTitle={heroTitle}
                    heroPrice={heroPrice}
                    heroBadgeText={heroBadgeText}
                    currentSport={currentSport}
                  />
                </div>

                {/* Benefits Cards */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 2xl:gap-8 mb-8 md:mb-0">
                  <FeatureCard
                    icon={HiOutlineCalendar}
                    title={heroBenefits.weekly}
                    variant="hero"
                    iconColor="text-nobilva-accent"
                  />
                  <FeatureCard
                    icon={HiOutlineChatAlt2}
                    title={heroBenefits.chat}
                    variant="hero"
                    iconColor="text-nobilva-accent"
                  />
                  <FeatureCard
                    icon={HiOutlineAcademicCap}
                    title={heroBenefits.tutoring}
                    variant="hero"
                    iconColor="text-nobilva-accent"
                  />
                </div>
              </div>

              {/* Right: Sports Illustration (lg以上のみ表示) */}
              <SportIllustration
                currentSport={currentSport}
                sportFileName={sportFileName}
                imageError={imageError}
                handleImageError={handleImageError}
                heroImageAlt={heroImageAlt}
                size="large"
              />
            </div>

            {/* Bottom Section: CTA Cards */}
            {/* sm専用: CTAを最後に表示 */}
            <div className="md:hidden">
              <HeroCTA
                heroCtaMain={heroCtaMain}
                heroCtaLine={heroCtaLine}
                currentSport={currentSport}
                sportFileName={sportFileName}
                imageError={imageError}
                handleImageError={handleImageError}
                heroImageAlt={heroImageAlt}
              />
            </div>
            {/* md以上: CTAを表示 */}
            <div className="hidden md:block">
              <HeroCTA
                heroCtaMain={heroCtaMain}
                heroCtaLine={heroCtaLine}
                currentSport={currentSport}
                sportFileName={sportFileName}
                imageError={imageError}
                handleImageError={handleImageError}
                heroImageAlt={heroImageAlt}
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
