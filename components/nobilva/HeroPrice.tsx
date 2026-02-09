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
            <span className="text-black text-sm md:text-base lg:text-lg 2xl:text-xl -ml-1">
              {heroPrice.from}
            </span>
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
      {/* 注釈 */}
      <span className="text-black text-[10px] md:text-xs 2xl:text-sm">
        {heroPrice.note}
      </span>
    </div>
  );
}
