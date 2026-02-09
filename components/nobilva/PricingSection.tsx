/**
 * PricingSection - 料金セクション
 * 
 * 料金プランとカスタムオプションを表示するセクション
 * 各プランカードとLINE誘導ボタンを含む
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LINE_ADD_URL } from "@/lib/constants";
import { PricingCard } from "./PricingCard";
import { PricingOptionCard } from "./PricingOptionCard";

interface PricingSectionProps {
  plans: any[];
  title: string;
  mainTitle: string;
  optionName: string;
  optionDescription: string;
  optionPriceVaries: string;
  lineCtaButton: string;
  recommendedText: string;
}

export function PricingSection({
  plans,
  title,
  mainTitle,
  optionName,
  optionDescription,
  optionPriceVaries,
  lineCtaButton,
  recommendedText,
}: PricingSectionProps) {
  return (
    <Section id="pricing" backgroundColor="white" padding="md">
      <Container>
        <SectionHeader mainTitle={mainTitle} theme="nobilva" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan: any, i: number) => (
            <PricingCard
              key={i}
              plan={plan}
              index={i}
              recommendedText={recommendedText}
            />
          ))}
          <PricingOptionCard
            optionName={optionName}
            optionDescription={optionDescription}
            priceVaries={optionPriceVaries}
          />
        </div>

        {/* LINE誘導セクション */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-line text-white rounded-none px-8 md:px-8 lg:px-10 py-5 md:py-5 lg:py-6 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3 text-center font-bold text-lg md:text-xl lg:text-2xl whitespace-nowrap"
          >
            <svg
              className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.93c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span>{lineCtaButton}</span>
          </a>
        </div>
      </Container>
    </Section>
  );
}
