import Link from "next/link";
import { ChevronRightIcon } from "./Icons";
import { wb } from "@/lib/wb";

interface DiagnosisCTAProps {
  variant?: "primary" | "secondary" | "hero";
  className?: string;
  href?: string;
  onClick?: () => void;
  label?: string;
}

const DIAGNOSIS_PATH = "/ja/services/nobilva/diagnosis";

export function DiagnosisCTA({
  variant = "primary",
  className = "",
  href,
  onClick,
  label,
}: DiagnosisCTAProps) {
  const resolvedHref = href ?? DIAGNOSIS_PATH;
  if (variant === "secondary") {
    return (
      <Link
        href={resolvedHref}
        onClick={onClick}
        className={`inline-flex items-center gap-2 text-nobilva-accent font-bold hover:underline transition-colors ${className}`}
      >
        {label ?? "無料学習相談に申し込む"}
        <ChevronRightIcon size="sm" />
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={resolvedHref}
        onClick={onClick}
        className={`inline-block bg-nobilva-accent text-white font-bold text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all ${className}`}
      >
        {label ? wb(label) : wb("無料学習相談に申し込む/（月20名限定）")}
      </Link>
    );
  }

  return (
    <Link
      href={resolvedHref}
      onClick={onClick}
      className={`inline-block bg-nobilva-accent text-white font-bold text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all ${className}`}
    >
      {label ?? "無料学習相談に申し込む"}
    </Link>
  );
}

export { DIAGNOSIS_PATH };
