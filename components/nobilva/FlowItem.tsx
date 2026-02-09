import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface FlowItemProps {
  step: number;
  title: string;
  description: string;
  optional?: boolean;
  index: number;
  isLast: boolean;
  isTeam?: boolean;
}

export function FlowItem({
  step,
  title,
  description,
  optional,
  index,
  isLast,
  isTeam = false,
}: FlowItemProps) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="flex gap-4 md:gap-6 mb-6 md:mb-8 relative">
        <div className="flex-shrink-0 w-10 h-10 bg-nobilva-main flex items-center justify-center text-white font-bold z-10 rounded-full">
          {step}
        </div>
        {!isLast && (
          <div className="absolute left-[19px] top-10 w-0.5 h-full bg-nobilva-main/20" />
        )}
        <div className="pt-1 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p
              className={`font-semibold ${
                !isTeam && step === 2
                  ? "text-nobilva-accent text-lg md:text-xl lg:text-2xl"
                  : "text-blue text-base md:text-lg"
              }`}
            >
              {title}
            </p>
            {optional && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap self-start mt-1">
                任意
              </span>
            )}
          </div>
          <p className="text-sm md:text-base text-text/70 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
