"use client";

import type { IconType } from "react-icons";
import { getServiceIcon } from "@/utils/serviceIcon";
import { addSoftBreaks } from "@/utils/softBreak";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface ServiceIconCardProps {
  service: string;
  icon?: IconType;
  variant?: "pricing" | "case-study";
  className?: string;
  style?: CSSProperties;
  iconColor?: string;
  backgroundColor?: string;
}

/**
 * サービスアイコンとテキストを表示するカードコンポーネント
 * variantでスタイルを変更可能
 */
export function ServiceIconCard({
  service,
  icon,
  variant = "pricing",
  className,
  style,
  iconColor = "text-nobilva-accent",
  backgroundColor = "bg-nobilva-light/50",
}: ServiceIconCardProps) {
  const Icon = icon || getServiceIcon(service);

  const baseClasses = `${backgroundColor} rounded-none flex flex-col items-center justify-center`;

  const variantClasses = {
    pricing: "px-1 py-3 flex-shrink-0",
    "case-study": "px-4 py-3 min-w-[120px]",
  };

  const iconSizes = {
    pricing: "w-7 h-7",
    "case-study": "w-9 h-9",
  };

  const textSizes = {
    pricing: "text-xs",
    "case-study": "text-xs md:text-sm",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ wordBreak: "keep-all", overflowWrap: "break-word", ...style }}
    >
      <Icon
        className={cn(`${iconColor} mb-1.5 flex-shrink-0`, iconSizes[variant])}
      />
      <span
        className={cn(
          "font-bold text-text text-center leading-tight",
          textSizes[variant]
        )}
        style={{
          wordBreak: "keep-all",
          overflowWrap: variant === "pricing" ? "break-word" : "normal",
        }}
      >
        {addSoftBreaks(service)}
      </span>
    </div>
  );
}
