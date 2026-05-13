import Link from "next/link";

interface DiagnosisCTAProps {
  variant?: "primary" | "secondary" | "hero";
  className?: string;
}

const DIAGNOSIS_PATH = "/ja/services/nobilva/diagnosis";

export function DiagnosisCTA({
  variant = "primary",
  className = "",
}: DiagnosisCTAProps) {
  if (variant === "secondary") {
    return (
      <Link
        href={DIAGNOSIS_PATH}
        className={`inline-flex items-center gap-2 text-nobilva-accent font-bold hover:underline transition-colors ${className}`}
      >
        無料学習診断に申し込む
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={DIAGNOSIS_PATH}
        className={`inline-block bg-nobilva-accent text-white font-bold text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all ${className}`}
      >
        無料学習診断に申し込む（月20名限定）
      </Link>
    );
  }

  return (
    <Link
      href={DIAGNOSIS_PATH}
      className={`inline-block bg-nobilva-accent text-white font-bold text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all ${className}`}
    >
      無料学習診断に申し込む
    </Link>
  );
}

export { DIAGNOSIS_PATH };
