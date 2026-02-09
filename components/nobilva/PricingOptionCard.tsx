import { BaseCard } from "@/components/ui/BaseCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { addSoftBreaks } from "@/utils/softBreak";

interface PricingOptionCardProps {
  optionName: string;
  optionDescription: string;
}

export function PricingOptionCard({
  optionName,
  optionDescription,
}: PricingOptionCardProps) {
  return (
    <ScrollReveal delay={0.2}>
      <BaseCard
        className="flex flex-col h-full border-2 border-transparent hover:border-nobilva-main transition-all"
        rounded="none"
      >
        <div className="p-4 md:p-2 flex-1 flex flex-col justify-center">
          <h3
            className="text-xl font-bold text-black text-center mb-4"
            style={{
              wordBreak: "keep-all",
              overflowWrap: "normal",
            }}
          >
            {addSoftBreaks(optionName)}
          </h3>
          <div className="text-3xl font-bold text-nobilva-accent text-center mb-4">
            金額は
            <wbr />
            内容により
            <wbr />
            異なります。
          </div>
          <p
            className="text-sm text-text/70 text-center leading-relaxed"
            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
          >
            {addSoftBreaks(optionDescription)}
          </p>
        </div>
      </BaseCard>
    </ScrollReveal>
  );
}
