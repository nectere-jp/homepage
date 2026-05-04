import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type AdminButtonSize = "sm" | "md" | "lg";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
}

const variantStyles: Record<AdminButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 shadow-soft hover:shadow-soft-lg",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
  ghost:
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
};

const sizeStyles: Record<AdminButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3",
};

export function adminButtonClass(
  variant: AdminButtonVariant = "primary",
  size: AdminButtonSize = "lg",
  extra?: string,
) {
  return cn(
    "rounded-xl font-medium transition-all duration-200 flex items-center gap-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    variantStyles[variant],
    sizeStyles[size],
    extra,
  );
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ variant = "primary", size = "lg", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={adminButtonClass(variant, size, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

AdminButton.displayName = "AdminButton";
