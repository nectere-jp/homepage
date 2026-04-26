/**
 * HeroPrice - Heroセクションの価格表示コンポーネント
 * 
 * 価格情報を表示する部分
 * 日本語と英語で異なるレイアウトをサポート
 */

import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface HeroPriceProps {
  isJapanese: boolean;
  heroPrice: {
    label: string;
    amount: string;
    currency: string;
    from: string;
    note: string;
  };
}

export function HeroPrice({ isJapanese, heroPrice }: HeroPriceProps) {
  return (
    <div className="flex flex-col overflow-visible">
      <div
        className={`flex items-baseline gap-2 ${
          isJapanese ? "" : "flex-wrap"
        } overflow-visible`}
      >
        {isJapanese ? (
          <>
            {/* 日本語: 縦書きのラベル */}
            <span
              className="text-black text-xs md:text-xs xl:text-base 2xl:text-lg font-black"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
              }}
            >
              {heroPrice.label}
            </span>
            {/* 「最大」を数字と同じグラデーントトーンで */}
            <span
              className="font-black text-4xl md:text-6xl inline-block bg-clip-text text-transparent pb-2 md:pb-3 2xl:pb-4"
              style={{
                backgroundImage:
                  "linear-gradient(-15deg, #bb4510 0%, #bb4510 50%, #ea5614 50%, #ea5614 100%)",
              }}
            >
              最大
            </span>
            <PriceDisplay
              price={heroPrice.amount}
              size="large"
              className="-ml-1 md:-ml-2 2xl:-ml-3"
              gradientColors={{
                start: "#bb4510",
                end: "#ea5614",
              }}
            />
            <span className="text-black text-base md:text-xl lg:text-2xl 2xl:text-3xl">
              {heroPrice.currency}
            </span>
            {heroPrice.from && (
              <span className="text-black text-sm md:text-base lg:text-lg 2xl:text-xl -ml-1">
                {heroPrice.from}
              </span>
            )}
          </>
        ) : (
          <>
            {/* 英語: 横書きのラベル */}
            <span className="text-black text-sm md:text-base 2xl:text-lg">
              {heroPrice.label}{" "}
            </span>
            <PriceDisplay
              price={heroPrice.amount}
              size="large"
              gradientColors={{
                start: "#bb4510",
                end: "#ea5614",
              }}
            />
            <span className="text-black text-base md:text-xl lg:text-2xl 2xl:text-3xl">
              {" "}
              {heroPrice.currency}
            </span>
            <span className="text-black text-base md:text-xl lg:text-2xl 2xl:text-3xl -ml-1">
              {heroPrice.from}
            </span>
          </>
        )}
      </div>
      {/* アピールバッジ */}
      {heroPrice.note && (
        <span className="inline-flex items-center self-start mt-1 bg-nobilva-accent text-white text-xs md:text-sm font-bold px-3 py-0.5 rounded-full">
          {heroPrice.note}
        </span>
      )}
    </div>
  );
}
