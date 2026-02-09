import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface HeroCatchphraseProps {
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
  currentSport: string;
}

export function HeroCatchphrase({
  isJapanese,
  heroTitle,
  heroPrice,
  heroBadgeText,
  currentSport,
}: HeroCatchphraseProps) {
  return (
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
  );
}
