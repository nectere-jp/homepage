export interface ParsedPrice {
  amount: string;
  currency: string;
  unit: string | null;
}

/**
 * 価格文字列をパースして、金額、通貨、単位に分割する
 * 例: "10000円 / (月額)" -> { amount: "10000", currency: "円", unit: "月額" }
 */
export function parsePrice(price: string): ParsedPrice {
  const priceMatch = price.match(/^(.+?)\s*\/\s*\((.+?)\)$/);
  
  if (priceMatch) {
    const [, amountPart, unit] = priceMatch;
    const amountMatch = amountPart.match(/^(.+?)(円)$/);
    
    if (amountMatch) {
      const [, number, yen] = amountMatch;
      return {
        amount: number,
        currency: yen,
        unit,
      };
    }
    
    return {
      amount: amountPart,
      currency: "",
      unit,
    };
  }
  
  return {
    amount: price,
    currency: "",
    unit: null,
  };
}
