"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { addSoftBreaks } from "@/utils/softBreak";

interface SectionHeaderProps {
  englishTitle: string;
  japaneseTitle?: string;
  caption?: string;
  className?: string;
  theme?: "default" | "nobilva" | "teachit";
}

export function SectionHeader({
  englishTitle,
  japaneseTitle,
  caption,
  className,
  theme = "default",
}: SectionHeaderProps) {
  const locale = useLocale();
  const isJapanese = locale === "ja";

  const colorClasses = {
    default: {
      text: "text-pink",
      bg: "bg-pink",
    },
    nobilva: {
      text: "text-nobilva-accent",
      bg: "bg-nobilva-main",
    },
    teachit: {
      text: "text-teachit-main",
      bg: "bg-teachit-main",
    },
  };

  const currentTheme = colorClasses[theme];

  if (theme === "nobilva") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className={cn("flex justify-center mb-12", className)}
      >
        <div
          className={cn(
            "bg-nobilva-main",
            "px-10 py-4 inline-block min-w-[280px] text-center",
          )}
        >
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight"
            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
          >
            {isJapanese && japaneseTitle ? addSoftBreaks(japaneseTitle) : englishTitle}
          </h2>
        </div>
      </motion.div>
    );
  }

  if (theme === "teachit") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className={cn("flex flex-col items-center mb-12 relative", className)}
      >
        {/* 装飾的な背景要素 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-teachit-accent rounded-full" />
        
        {/* メインコンテンツ */}
        <div className="relative">
          {/* 装飾的なドット */}
          <motion.div
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teachit-accent"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
          <motion.div
            className="absolute -right-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teachit-accent"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
          
          {/* タイトル */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-center relative px-10">
            {isJapanese && japaneseTitle ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs md:text-sm font-normal text-teachit-accent/70 tracking-wider uppercase">
                  {englishTitle}
                </span>
                <span className="text-teachit-accent">
                  {japaneseTitle}
                </span>
              </div>
            ) : (
              <span className="text-teachit-accent">
                {englishTitle}
              </span>
            )}
          </h2>
          
          {/* アンダーラインアクセント */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-12 h-1 bg-teachit-accent rounded-full" />
            <div className="w-2 h-2 rounded-full bg-teachit-accent" />
            <div className="w-6 h-1 bg-teachit-accent/60 rounded-full" />
          </motion.div>
        </div>

        {/* キャプション */}
        {caption && (
          <motion.p
            className="text-xs md:text-sm text-teachit-main/60 mt-6 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {caption}
          </motion.p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 md:gap-4 mb-12",
        className,
      )}
    >
      <h2
        className={cn(
          currentTheme.text,
          "text-2xl md:text-4xl lg:text-4xl font-bold tracking-tight relative inline-block text-center",
        )}
      >
        {isJapanese && japaneseTitle ? (
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-normal text-text/60 mb-1 tracking-normal">
              {englishTitle}
            </span>
            <span>{japaneseTitle}</span>
          </div>
        ) : (
          <span>{englishTitle}</span>
        )}
        <motion.span
          className={cn(
            "absolute bottom-0 left-0 h-0.5 w-full",
            currentTheme.bg,
          )}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{ originX: 0 }}
        />
      </h2>
      {caption && (
        <p className="text-[10px] md:text-xs text-text/60 mb-1">{caption}</p>
      )}
    </motion.div>
  );
}
