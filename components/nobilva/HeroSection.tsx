"use client";

import { Section } from "@/components/layout/Section";
import {
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { useSportAnimation } from "@/hooks/useSportAnimation";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { addSoftBreaks } from "@/utils/softBreak";
import { useEffect } from "react";
import { LINE_ADD_URL } from "@/lib/constants";

const sportAnimationStyles = `
  @keyframes sportFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes sportFadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  @keyframes sportImageFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes sportImageFadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
  .sport-text-enter {
    animation: sportFadeIn 0.5s ease-out forwards;
  }
  .sport-text-exit {
    animation: sportFadeOut 0.5s ease-out forwards;
  }
  .sport-image-enter {
    animation: sportImageFadeIn 0.5s ease-out forwards;
  }
  .sport-image-exit {
    animation: sportImageFadeOut 0.5s ease-out forwards;
  }
`;

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
          <div className="relative z-10 pt-12 md:pt-16 2xl:pt-20 pb-12 md:pb-16 2xl:pb-20 w-full px-4 md:px-8 lg:px-16 2xl:px-24">
            {/* Top Section: Main Content and Image */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 2xl:gap-16 items-center mb-6 md:mb-8 2xl:mb-12">
              {/* Left: Text Content */}
              <div className="flex-1 space-y-6 md:space-y-8 2xl:space-y-12 max-w-none md:w-[95%]">
                {/* Main Catchphrase Area */}
                <div className="bg-nobilva-main px-6 md:px-10 2xl:px-16 py-8 md:py-12 2xl:py-16 pb-6 md:pb-8 2xl:pb-12 relative rounded-none shadow-lg overflow-visible">
                  <div className="relative z-10 space-y-4 2xl:space-y-6 overflow-visible">
                    <h1 className="text-xl md:text-5xl lg:text-4xl 2xl:text-5xl font-black text-black leading-normal">
                      {isJapanese ? (
                        <>
                          <span>{heroTitle.prefix}</span>
                          <span className="inline-block min-w-[120px] md:min-w-[200px] lg:min-w-[220px] mx-2 text-center border-2 border-black pb-1 md:pb-1.5">
                            <span
                              key={currentSport}
                              className="inline-block text-nobilva-accent text-2xl md:text-5xl lg:text-5xl sport-text-enter"
                            >
                              {currentSport}
                            </span>
                          </span>
                          {(() => {
                            // 「選手のための」を「選手」と「のための」に分割
                            const suffixMatch =
                              heroTitle.suffix.match(/^(.+?)(のための)$/);
                            if (suffixMatch) {
                              const [, mainPart, smallPart] = suffixMatch;
                              return (
                                <>
                                  <span>{mainPart}</span>
                                  <span className="text-base md:text-3xl lg:text-2xl 2xl:text-3xl">
                                    {smallPart}
                                  </span>
                                </>
                              );
                            }
                            // マッチしない場合はそのまま表示
                            return <span>{heroTitle.suffix}</span>;
                          })()}
                          <br />
                          <span className="block mt-2 md:mt-4">
                            {heroTitle.service}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>{heroTitle.prefix} </span>
                          <span className="inline-block min-w-[120px] md:min-w-[200px] lg:min-w-[220px] 2xl:min-w-[300px] mx-2 2xl:mx-3 text-center border-2 2xl:border-[3px] border-black pb-1 md:pb-1.5 2xl:pb-2">
                            <span
                              key={currentSport}
                              className="inline-block text-nobilva-accent text-2xl md:text-5xl lg:text-5xl 2xl:text-6xl sport-text-enter"
                            >
                              {currentSport}
                            </span>
                          </span>
                          <span> {heroTitle.suffix}</span>
                          <br />
                          <span className="block mt-2 md:mt-4 2xl:mt-6">
                            {heroTitle.service}
                          </span>
                        </>
                      )}
                    </h1>
                    <div className="flex flex-col overflow-visible">
                      <div
                        className={`flex items-baseline gap-2 ${
                          isJapanese ? "" : "flex-wrap"
                        } overflow-visible`}
                      >
                        {isJapanese ? (
                          <>
                            <span
                              className="text-black text-lg md:text-base 2xl:text-2xl font-black"
                              style={{
                                writingMode: "vertical-rl",
                                textOrientation: "upright",
                              }}
                            >
                              {heroPrice.label}
                            </span>
                            <PriceDisplay
                              price={heroPrice.amount}
                              size="medium"
                              className="-ml-1 md:-ml-2 2xl:-ml-3 md:text-7xl"
                              gradientColors={{
                                start: "#bb4510",
                                end: "#ea5614",
                              }}
                            />
                            <span className="text-black text-xl md:text-2xl lg:text-3xl 2xl:text-4xl">
                              {heroPrice.currency}
                            </span>
                            <span className="text-black text-base md:text-lg lg:text-xl 2xl:text-2xl">
                              {heroPrice.from}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-black text-lg md:text-xl 2xl:text-2xl">
                              {heroPrice.label}{" "}
                            </span>
                            <PriceDisplay
                              price={heroPrice.amount}
                              size="medium"
                              gradientColors={{
                                start: "#bb4510",
                                end: "#ea5614",
                              }}
                            />
                            <span className="text-black text-xl md:text-2xl lg:text-3xl 2xl:text-4xl">
                              {" "}
                              {heroPrice.currency}
                            </span>
                            <span className="text-black text-xl md:text-2xl lg:text-3xl 2xl:text-4xl">
                              {" "}
                              {heroPrice.from}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-black text-xs md:text-sm 2xl:text-base">
                        {heroPrice.note}
                      </span>
                    </div>
                  </div>
                  {/* 新入生募集中バッジ */}
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 2xl:bottom-8 2xl:right-8 z-20">
                    <div
                      className="bg-gray-700 rounded-full w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 2xl:w-32 2xl:h-32 flex items-center justify-center aspect-square -rotate-12"
                      style={{
                        boxShadow:
                          "inset 0 6px 16px rgba(0, 0, 0, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      <span
                        className="text-white font-black text-sm md:text-base lg:text-lg 2xl:text-xl text-center px-0.5 whitespace-pre-line leading-none"
                        style={{ letterSpacing: "-0.05em" }}
                      >
                        {heroBadgeText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Benefits Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 2xl:gap-8">
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
              <div className="hidden lg:flex flex-shrink-0 w-[280px] xl:w-[400px] 2xl:w-[500px] items-center justify-center">
                <div className="relative w-full max-w-[280px] xl:max-w-[400px] 2xl:max-w-[500px] aspect-square">
                  <div
                    key={currentSport}
                    className="absolute inset-0 w-full h-full flex items-center justify-center sport-image-enter"
                  >
                    {/* 円形の半透明の白い背景 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[80%] h-[80%] bg-white/50 rounded-full"></div>
                    </div>
                    {/* 画像 */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {!sportFileName || imageError[currentSport] ? (
                        <div className="w-full h-full bg-nobilva-main/10 rounded-lg flex items-center justify-center text-nobilva-accent text-2xl md:text-3xl 2xl:text-4xl font-bold">
                          {currentSport}
                        </div>
                      ) : (
                        <img
                          src={`/images/nobilva/sports/${sportFileName}.svg`}
                          alt={`${currentSport}${heroImageAlt}`}
                          className="w-full h-full object-contain"
                          onError={() => handleImageError(currentSport)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: CTA Cards */}
            <div className="bg-nobilva-accent md:bg-transparent lg:bg-nobilva-accent rounded-none p-1.5 md:p-0 lg:p-3 2xl:py-8 2xl:px-4 shadow-lg md:shadow-none lg:shadow-lg -mx-8 md:-mx-12 lg:-mx-16 2xl:-mx-24 px-8 md:px-12 lg:px-16 2xl:px-24 mt-8 md:mt-12 lg:mt-16 2xl:mt-20 relative overflow-hidden">
              {/* 斜め下半分の濃い影 */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none lg:block"></div>
              <div className="relative z-10 max-w-7xl md:w-[95%] lg:w-full mx-auto flex flex-col md:flex-row lg:flex-col gap-3 md:gap-4 2xl:gap-6 justify-center items-center">
                {/* Sports Illustration (mdのみ表示、lg以上は非表示) */}
                <div className="flex md:flex lg:hidden flex-shrink-0 w-[200px] md:w-[240px] items-center justify-center">
                  <div className="relative w-full max-w-[200px] md:max-w-[240px] aspect-square">
                    <div
                      key={currentSport}
                      className="absolute inset-0 w-full h-full flex items-center justify-center sport-image-enter"
                    >
                      {/* 円形の半透明の白い背景 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[80%] h-[80%] bg-white/50 md:bg-white rounded-full"></div>
                      </div>
                      {/* 画像 */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {!sportFileName || imageError[currentSport] ? (
                          <div className="w-full h-full bg-nobilva-main/10 rounded-lg flex items-center justify-center text-nobilva-accent text-2xl md:text-3xl 2xl:text-4xl font-bold">
                            {currentSport}
                          </div>
                        ) : (
                          <img
                            src={`/images/nobilva/sports/${sportFileName}.svg`}
                            alt={`${currentSport}${heroImageAlt}`}
                            className="w-full h-full object-contain"
                            onError={() => handleImageError(currentSport)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-col lg:flex-row gap-3 md:gap-4 2xl:gap-6 items-center md:bg-nobilva-accent md:rounded-none md:px-3 md:py-10 md:shadow-lg md:relative md:overflow-hidden lg:bg-transparent lg:rounded-none lg:p-0 lg:shadow-none">
                  {/* mdでの斜め下半分の濃い影 */}
                  <div className="hidden md:block lg:hidden absolute inset-0 bg-gradient-to-br from-transparent from-50% via-black/10 via-50% to-black/20 to-100% pointer-events-none"></div>
                  <a
                    href="#pricing"
                    className="relative z-10 transition-all hover:scale-105 block text-center font-black text-xl md:text-2xl lg:text-3xl 2xl:text-5xl py-0.5 md:py-1 2xl:py-2 text-white mr-0 md:mr-0 lg:mr-8 2xl:mr-10"
                    style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                  >
                    {heroCtaMain.split("\n").map((line, index, array) => (
                      <span key={index}>
                        {addSoftBreaks(line)}
                        {index < array.length - 1 && <br />}
                      </span>
                    ))}
                  </a>
                  <a
                    href={LINE_ADD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 bg-line text-white rounded-none p-2 md:p-3 lg:p-4 2xl:p-5 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 2xl:gap-3 text-center font-bold text-sm md:text-base lg:text-lg 2xl:text-xl whitespace-nowrap w-auto"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 2xl:w-8 2xl:h-8"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.93c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    {heroCtaLine}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
