"use client";

import type { IconType } from "react-icons";
import { addSoftBreaks } from "@/utils/softBreak";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description?: string;
  variant?: "hero" | "features";
  className?: string;
  iconColor?: string;
  backgroundColor?: string;
  theme?: "nobilva" | "teachit" | "default";
  image?: string | null;
  imagePosition?: "left" | "right";
}

/**
 * 機能/ベネフィットカードコンポーネント
 * variantでHeroSection用とFeaturesSection用のスタイルを切り替え
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "hero",
  className,
  iconColor = "text-nobilva-accent",
  backgroundColor = "bg-white/80",
  theme = "default",
  image,
  imagePosition = "left",
}: FeatureCardProps) {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          `${backgroundColor} rounded-none px-3 md:px-4 lg:px-5 py-2 md:py-3 lg:py-4 shadow-lg flex items-center`,
          className
        )}
      >
        <div className="flex flex-row items-center gap-2 md:gap-3">
          <Icon
            className={cn(`${iconColor} w-7 h-7 md:w-9 md:h-9 flex-shrink-0`)}
          />
          <h3 className="text-text font-black text-sm md:text-base whitespace-pre-line">
            {addSoftBreaks(title)}
          </h3>
        </div>
      </div>
    );
  }

  // FeaturesSection用
  const roundedClass = theme === "nobilva" ? "rounded-none" : "rounded-[2rem]";
  const iconRoundedClass =
    theme === "nobilva" ? "rounded-none" : "rounded-[1.5rem]";

  // 画像またはアイコン部分
  const imageContent = image ? (
    <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-nobilva-light to-white flex items-center justify-center">
      <div className="relative w-full h-full max-w-md">
        <Image src={image} alt={title} fill className="object-contain p-8" />
      </div>
    </div>
  ) : (
    <div className="w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-nobilva-light to-white flex items-center justify-center">
      <div
        className={cn(
          `w-24 h-24 bg-white ${iconRoundedClass} flex items-center justify-center shadow-sm`,
          iconColor
        )}
      >
        <Icon className="w-14 h-14" />
      </div>
    </div>
  );

  // テキスト部分
  const textContent = (
    <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
      <h3 className="text-2xl md:text-3xl font-bold text-blue mb-4">{title}</h3>
      {description && (
        <p className="text-text/80 text-base md:text-lg leading-relaxed">
          {addSoftBreaks(description)}
        </p>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        `flex flex-col md:flex-row bg-white ${roundedClass} shadow-sm overflow-hidden`,
        className
      )}
    >
      {imagePosition === "left" ? (
        <>
          {imageContent}
          {textContent}
        </>
      ) : (
        <>
          {textContent}
          {imageContent}
        </>
      )}
    </div>
  );
}
