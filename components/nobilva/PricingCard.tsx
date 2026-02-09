/**
 * PricingCard - プランカードコンポーネント
 * 
 * 料金プランを表示するカード
 * おすすめプランの場合は強調表示される
 */

import { BaseCard } from "@/components/ui/BaseCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { addSoftBreaks } from "@/utils/softBreak";
import { ServiceIconCard } from "@/components/ui/ServiceIconCard";
import { PricingPriceDisplay } from "./PricingPriceDisplay";

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    features: string[] | Record<string, string>;
    description?: string;
    isRecommended?: boolean;
  };
  index: number;
}

export function PricingCard({ plan, index }: PricingCardProps) {
  const isRecommended = plan.isRecommended === true;

  return (
    <ScrollReveal delay={index * 0.1}>
      <BaseCard
        className={`flex flex-col h-full border-2 transition-all ${
          isRecommended
            ? "border-[3px] border-gray-200 hover:border-nobilva-main bg-nobilva-main/5 scale-105 md:scale-110"
            : "border-transparent hover:border-nobilva-main"
        }`}
        rounded="none"
      >
        <div className={`p-4 md:p-2 flex-1 flex flex-col justify-center`}>
          {/* おすすめバッジ */}
          {isRecommended && (
            <div className="text-center mb-2">
              <span className="inline-block bg-nobilva-accent text-white text-xs font-bold px-3 py-1 rounded-none">
                おすすめ
              </span>
            </div>
          )}
          
          {/* プラン名 */}
          <h3
            className={`text-xl font-bold text-black text-center mb-4 ${
              isRecommended ? "text-2xl" : ""
            }`}
            style={{
              wordBreak: "keep-all",
              overflowWrap: "normal",
            }}
          >
            {addSoftBreaks(plan.name)}
          </h3>
          
          {/* 価格表示 */}
          <PricingPriceDisplay
            price={plan.price}
            isRecommended={isRecommended}
          />
          <div className="flex flex-nowrap gap-2 justify-center mb-4">
            {(Array.isArray(plan.features)
              ? plan.features
              : Object.values(plan.features || {})
            ).map((feature: any, j: number) => (
              <ServiceIconCard
                key={j}
                service={
                  typeof feature === "string" ? feature : String(feature)
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
}
