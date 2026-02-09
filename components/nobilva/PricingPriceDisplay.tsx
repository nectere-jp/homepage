/**
 * PricingPriceDisplay - 価格表示コンポーネント
 * 
 * プランカード内で価格を表示する
 * おすすめプランの場合は大きめのサイズで表示
 */

import { parsePrice } from "./utils/parsePrice";

interface PricingPriceDisplayProps {
  price: string;
  isRecommended?: boolean;
}

export function PricingPriceDisplay({
  price,
  isRecommended = false,
}: PricingPriceDisplayProps) {
  const parsedPrice = parsePrice(price);

  return (
    <div className={`text-center mb-4 ${isRecommended ? "mb-6" : ""}`}>
      {parsedPrice.unit ? (
        <>
          {/* 単位がある場合（例: "¥5,000/月"） */}
          {parsedPrice.currency ? (
            <>
              {/* 通貨記号がある場合 */}
              <span
                className={`${
                  isRecommended ? "text-4xl" : "text-3xl"
                } font-bold text-nobilva-accent`}
              >
                {parsedPrice.amount}
              </span>
              <span
                className={`${
                  isRecommended ? "text-xl" : "text-lg"
                } font-bold text-nobilva-accent`}
              >
                {parsedPrice.currency}
              </span>
              <span
                className={`${
                  isRecommended ? "text-base" : "text-sm"
                } text-text/60 ml-1`}
              >
                / ({parsedPrice.unit})
              </span>
            </>
          ) : (
            <>
              {/* 通貨記号がない場合 */}
              <span
                className={`${
                  isRecommended ? "text-4xl" : "text-3xl"
                } font-bold text-nobilva-accent`}
              >
                {parsedPrice.amount}
              </span>
              <span
                className={`${
                  isRecommended ? "text-base" : "text-sm"
                } text-text/60 ml-1`}
              >
                / ({parsedPrice.unit})
              </span>
            </>
          )}
        </>
      ) : (
        // 単位がない場合（例: "無料"）
        <span
          className={`${
            isRecommended ? "text-4xl" : "text-3xl"
          } font-bold text-nobilva-accent`}
        >
          {price}
        </span>
      )}
    </div>
  );
}
