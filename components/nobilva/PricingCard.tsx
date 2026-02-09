import { BaseCard } from "@/components/ui/BaseCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { addSoftBreaks } from "@/utils/softBreak";
import { ServiceIconCard } from "@/components/ui/ServiceIconCard";
import { parsePrice } from "./utils/parsePrice";

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
  const isComplete = plan.isRecommended === true;
  const parsedPrice = parsePrice(plan.price);

  return (
    <ScrollReveal delay={index * 0.1}>
      <BaseCard
        className={`flex flex-col h-full border-2 transition-all ${
          isComplete
            ? "border-[3px] border-gray-200 hover:border-nobilva-main bg-nobilva-main/5 scale-105 md:scale-110"
            : "border-transparent hover:border-nobilva-main"
        }`}
        rounded="none"
      >
        <div
          className={`p-4 md:p-2 flex-1 flex flex-col justify-center`}
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
            style={{
              wordBreak: "keep-all",
              overflowWrap: "normal",
            }}
          >
            {addSoftBreaks(plan.name)}
          </h3>
          <div
            className={`text-center mb-4 ${isComplete ? "mb-6" : ""}`}
          >
            {parsedPrice.unit ? (
              <>
                {parsedPrice.currency ? (
                  <>
                    <span
                      className={`${
                        isComplete ? "text-4xl" : "text-3xl"
                      } font-bold text-nobilva-accent`}
                    >
                      {parsedPrice.amount}
                    </span>
                    <span
                      className={`${
                        isComplete ? "text-xl" : "text-lg"
                      } font-bold text-nobilva-accent`}
                    >
                      {parsedPrice.currency}
                    </span>
                    <span
                      className={`${
                        isComplete ? "text-base" : "text-sm"
                      } text-text/60 ml-1`}
                    >
                      / ({parsedPrice.unit})
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`${
                        isComplete ? "text-4xl" : "text-3xl"
                      } font-bold text-nobilva-accent`}
                    >
                      {parsedPrice.amount}
                    </span>
                    <span
                      className={`${
                        isComplete ? "text-base" : "text-sm"
                      } text-text/60 ml-1`}
                    >
                      / ({parsedPrice.unit})
                    </span>
                  </>
                )}
              </>
            ) : (
              <span
                className={`${
                  isComplete ? "text-4xl" : "text-3xl"
                } font-bold text-nobilva-accent`}
              >
                {plan.price}
              </span>
            )}
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
}
