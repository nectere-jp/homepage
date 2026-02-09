/**
 * HeroCatchphrase - Heroセクションのキャッチフレーズコンテナ
 * 
 * タイトル、価格、バッジをまとめて表示するコンテナコンポーネント
 * 黄色の背景（nobilva-main）で囲まれたカード形式
 */

import { HeroTitle } from "./HeroTitle";
import { HeroPrice } from "./HeroPrice";
import { HeroBadge } from "./HeroBadge";

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
    <div className="bg-nobilva-main px-[5%] md:px-10 2xl:px-16 py-8 md:py-12 2xl:py-16 pb-6 md:pb-8 2xl:pb-12 relative rounded-none shadow-lg overflow-visible">
      <div className="relative z-10 space-y-4 2xl:space-y-6 overflow-visible">
        {/* タイトル表示 */}
        <HeroTitle
          isJapanese={isJapanese}
          heroTitle={heroTitle}
          currentSport={currentSport}
        />
        
        {/* 価格表示 */}
        <HeroPrice isJapanese={isJapanese} heroPrice={heroPrice} />
      </div>
      
      {/* バッジ表示（右下に配置） */}
      <HeroBadge heroBadgeText={heroBadgeText} />
    </div>
  );
}
