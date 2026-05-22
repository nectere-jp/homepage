import type { ReactNode } from "react";
import { wb } from "@/lib/wb";

interface SectionHeadingProps {
  children: string;
  variant?: "default" | "compact";
  center?: boolean;
  description?: ReactNode;
  className?: string;
}

export function SectionHeading({
  children,
  variant = "default",
  center = false,
  description,
  className = "",
}: SectionHeadingProps) {
  const base =
    variant === "compact"
      ? "px-6 py-2 text-2xl md:text-3xl"
      : "px-10 py-4 text-2xl md:text-3xl lg:text-4xl";
  const h2 = (
    <h2
      className={`bg-nobilva-main ${base} font-black text-black tracking-tight inline-block ${className}`.trim()}
    >
      {wb(children)}
    </h2>
  );
  if (!center) return h2;
  return (
    <div className="text-center mb-12 md:mb-16">
      {h2}
      {description && (
        <div className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
          {description}
        </div>
      )}
    </div>
  );
}
