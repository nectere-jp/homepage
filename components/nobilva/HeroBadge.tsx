/**
 * HeroBadge - Heroセクションのバッジ表示コンポーネント
 * 
 * 「新入生募集中」などのバッジを表示する
 * 右下に配置され、回転アニメーション付き
 */

interface HeroBadgeProps {
  heroBadgeText: string;
}

export function HeroBadge({ heroBadgeText }: HeroBadgeProps) {
  return (
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
  );
}
