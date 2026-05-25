import Link from "next/link";

interface SubpageHeroProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: "2xl" | "4xl";
}

export function SubpageHero({
  title,
  children,
  maxWidth = "4xl",
}: SubpageHeroProps) {
  const mw = maxWidth === "2xl" ? "max-w-2xl" : "max-w-4xl";

  return (
    <section className="relative bg-nobilva-light pt-32 md:pt-40 pb-12 md:pb-16 overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-nobilva-accent" />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-nobilva-accent/5 rounded-bl-full" />
      </div>

      <div className={`relative ${mw} mx-auto px-6 md:px-12 lg:px-16`}>
        <nav className="mb-6">
          <Link
            href="/ja/services/nobilva"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Nobilva
          </Link>
        </nav>

        <div className="border-l-4 border-nobilva-accent pl-4 md:pl-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            {title}
          </h1>
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
