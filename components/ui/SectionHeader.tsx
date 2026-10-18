"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { addSoftBreaks } from "@/utils/softBreak";

interface SectionHeaderProps {
  /** メインタイトル（現在のロケールで表示する見出し） */
  mainTitle: string;
  /** あしらい（日本語表示時のみ、メインの上に小さく表示。nobilvaでは未使用） */
  accentTitle?: string;
  caption?: string;
  className?: string;
  theme?: "default" | "nobilva";
}

export function SectionHeader({
  mainTitle,
  accentTitle,
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
            {addSoftBreaks(mainTitle)}
          </h2>
        </div>
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
        {isJapanese && accentTitle ? (
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-normal text-text/60 mb-1 tracking-normal">
              {accentTitle}
            </span>
            <span>{mainTitle}</span>
          </div>
        ) : (
          <span>{mainTitle}</span>
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
