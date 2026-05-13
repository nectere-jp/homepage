import Link from "next/link";
import { DiagnosisCTA } from "./DiagnosisCTA";

interface SubpageCTAProps {
  heading: string;
  description: string;
  secondaryLinks?: { label: string; href: string }[];
}

export function SubpageCTA({
  heading,
  description,
  secondaryLinks,
}: SubpageCTAProps) {
  return (
    <section className="bg-gradient-to-b from-nobilva-light to-amber-50 py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center">
        <h2 className="bg-nobilva-main px-8 py-3 text-2xl md:text-3xl font-black text-black tracking-tight inline-block mb-4">
          {heading}
        </h2>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="inline-flex items-center gap-1.5 bg-nobilva-main text-gray-900 font-bold text-sm px-4 py-2 rounded-full">
            月20名限定
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-sm px-4 py-2 rounded-full">
            30日全額返金保証
          </span>
        </div>

        <DiagnosisCTA variant="hero" />

        {secondaryLinks && secondaryLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm md:text-base"
              >
                {link.label}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
