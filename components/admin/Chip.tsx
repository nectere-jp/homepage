import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  children: ReactNode;
  variant?:
    | "required"
    | "optional"
    | "keyword"
    | "keyword-secondary"
    | "selected"
    | "success"
    | "tag";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Chip({
  children,
  variant = "keyword",
  size = "sm",
  className,
}: ChipProps) {
  const variantClasses = {
    required: "bg-red-50 text-red-700 border border-red-200",
    optional: "bg-gray-100 text-gray-600 border border-gray-200",
    keyword: "bg-white text-gray-900 border border-gray-200",
    "keyword-secondary": "bg-gray-50 text-gray-900 border border-gray-200",
    selected: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-green-100 text-green-700 border border-green-200",
    tag: "bg-blue-100 text-blue-700 border border-blue-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // tag variantの場合はrounded-fullを使用
  const isRoundedFull = variant === "tag" || variant === "success";

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold",
        isRoundedFull ? "rounded-full" : "rounded-md",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
