"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BaseCard } from "@/components/ui/BaseCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { addSoftBreaks } from "@/utils/softBreak";
import { ServiceIconCard } from "@/components/ui/ServiceIconCard";

interface PricingSectionProps {
  plans: any[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const t = useTranslations("nobilva");

  return (
    <Section id="pricing" backgroundColor="white" padding="md">
      <Container>
        <SectionHeader
          englishTitle="Pricing"
          japaneseTitle={t("pricing.title")}
          theme="nobilva"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan: any, i: number) => {
            const isComplete = plan.name === "ベーシックプラン";
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <BaseCard
                  className={`flex flex-col h-full border-2 transition-all ${
                    isComplete
                      ? "border-[3px] border-gray-200 hover:border-nobilva-main bg-nobilva-main/5 scale-105 md:scale-110"
                      : "border-transparent hover:border-nobilva-main"
                  }`}
                  rounded="none"
                >
                  <div
                    className={`p-4 flex-1 flex flex-col justify-center ${
                      isComplete ? "p-6" : ""
                    }`}
                  >
                    {isComplete && (
                      <div className="text-center mb-2">
                        <span className="inline-block bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-none">
                          おすすめ
                        </span>
                      </div>
                    )}
                    <h3
                      className={`text-xl font-bold text-black text-center mb-4 ${
                        isComplete ? "text-2xl" : ""
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div
                      className={`text-center mb-4 ${isComplete ? "mb-6" : ""}`}
                    >
                      {(() => {
                        const priceMatch = plan.price.match(
                          /^(.+?)\s*\/\s*\((.+?)\)$/,
                        );
                        if (priceMatch) {
                          const [, amount, unit] = priceMatch;
                          const amountMatch = amount.match(/^(.+?)(円)$/);
                          if (amountMatch) {
                            const [, number, yen] = amountMatch;
                            return (
                              <>
                                <span
                                  className={`${
                                    isComplete ? "text-4xl" : "text-3xl"
                                  } font-bold text-nobilva-accent`}
                                >
                                  {number}
                                </span>
                                <span
                                  className={`${
                                    isComplete ? "text-xl" : "text-lg"
                                  } font-bold text-nobilva-accent`}
                                >
                                  {yen}
                                </span>
                                <span
                                  className={`${
                                    isComplete ? "text-base" : "text-sm"
                                  } text-text/60 ml-1`}
                                >
                                  / ({unit})
                                </span>
                              </>
                            );
                          }
                          return (
                            <>
                              <span
                                className={`${
                                  isComplete ? "text-4xl" : "text-3xl"
                                } font-bold text-nobilva-accent`}
                              >
                                {amount}
                              </span>
                              <span
                                className={`${
                                  isComplete ? "text-base" : "text-sm"
                                } text-text/60 ml-1`}
                              >
                                / ({unit})
                              </span>
                            </>
                          );
                        }
                        return (
                          <span
                            className={`${
                              isComplete ? "text-4xl" : "text-3xl"
                            } font-bold text-nobilva-accent`}
                          >
                            {plan.price}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex flex-nowrap gap-2 justify-center mb-4">
                      {(Array.isArray(plan.features)
                        ? plan.features
                        : Object.values(plan.features || {})
                      ).map((feature: any, j: number) => (
                        <ServiceIconCard
                          key={j}
                          service={
                            typeof feature === "string"
                              ? feature
                              : String(feature)
                          }
                          variant="pricing"
                          className="flex-shrink-0"
                          style={{ width: "calc((100% - 1rem) / 3)" }}
                          iconColor="text-nobilva-accent"
                          backgroundColor="bg-nobilva-light/50"
                        />
                      ))}
                    </div>
                    {plan.description && (
                      <p
                        className="text-sm text-text/70 text-center leading-relaxed"
                        style={{
                          wordBreak: "keep-all",
                          overflowWrap: "normal",
                        }}
                      >
                        {addSoftBreaks(plan.description)}
                      </p>
                    )}
                  </div>
                </BaseCard>
              </ScrollReveal>
            );
          })}
          <ScrollReveal delay={0.2}>
            <BaseCard
              className="flex flex-col h-full border-2 border-transparent hover:border-nobilva-main transition-all"
              rounded="none"
            >
              <div className="p-4 flex-1 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-black text-center mb-4">
                  {t("pricing.option.name")}
                </h3>
                <div className="text-3xl font-bold text-nobilva-accent text-center mb-4">
                  要相談
                </div>
                <p
                  className="text-sm text-text/70 text-center leading-relaxed"
                  style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                >
                  {addSoftBreaks(t("pricing.option.description"))}
                </p>
              </div>
            </BaseCard>
          </ScrollReveal>
        </div>

        {/* LINE誘導セクション */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <a
            href="https://line.me/ti/p/your-line-id"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-line text-white rounded-none px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3 text-center font-bold text-lg md:text-xl lg:text-2xl whitespace-nowrap"
          >
            <svg
              className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.93c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span>まずは無料学習相談！</span>
          </a>
        </div>
      </Container>
    </Section>
  );
}
