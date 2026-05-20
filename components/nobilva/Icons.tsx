export function ChevronRightIcon({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <svg
      className={`${sizeClass} ${className}`.trim()}
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
  );
}

export function ChevronDownIcon({
  size = "sm",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const sizeClass = sizeMap[size];
  return (
    <svg
      className={`${sizeClass} ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export function CheckIcon({
  size = "md",
  color = "green",
}: {
  size?: "sm" | "md";
  color?: "green" | "accent";
}) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const colorClass =
    color === "accent" ? "text-nobilva-accent" : "text-green-500";
  return (
    <svg
      className={`${sizeClass} flex-shrink-0 mt-0.5 ${colorClass}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function XIcon({ size = "md" }: { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <svg
      className={`${sizeClass} flex-shrink-0 mt-0.5 text-gray-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
