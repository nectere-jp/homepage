"use client";

const arrowAnimationStyle = `
  @keyframes arrowSlide {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-8px); }
  }
  .arrow-animation {
    animation: arrowSlide 1.5s ease-in-out infinite;
  }
`;

interface FixedCTAButtonProps {
  label: string;
  isJapanese: boolean;
}

export function FixedCTAButton({ label, isJapanese }: FixedCTAButtonProps) {
  return (
    <>
      <style jsx>{arrowAnimationStyle}</style>
      <div className="fixed right-0 bottom-0 z-50 hidden lg:flex items-center">
        {/* Arrow Icon - Left side (outside) */}
        <div className="text-nobilva-accent arrow-animation">
          <svg
            className="w-8 h-8 rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
        {/* CTA Button */}
        <a
          href="#pricing"
          className={`flex items-center justify-center bg-gradient-to-b from-nobilva-accent to-nobilva-accent/80 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
            isJapanese ? "flex-col px-6 py-10" : "px-8 py-6"
          }`}
          style={
            isJapanese
              ? { writingMode: "vertical-rl", textOrientation: "upright" }
              : {}
          }
        >
          <div className="text-white font-bold text-lg whitespace-nowrap">
            {label}
          </div>
        </a>
      </div>
    </>
  );
}
