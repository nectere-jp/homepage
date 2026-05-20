import { wb } from "@/lib/wb";

interface SectionHeadingProps {
  children: string;
  variant?: "default" | "compact";
  className?: string;
}

export function SectionHeading({
  children,
  variant = "default",
  className = "",
}: SectionHeadingProps) {
  const base =
    variant === "compact"
      ? "px-6 py-2 text-2xl md:text-3xl"
      : "px-10 py-4 text-2xl md:text-3xl lg:text-4xl";
  return (
    <h2
      className={`bg-nobilva-main ${base} font-black text-black tracking-tight inline-block ${className}`.trim()}
    >
      {wb(children)}
    </h2>
  );
}
