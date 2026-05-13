"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { DIAGNOSIS_PATH } from "./DiagnosisCTA";

const arrowAnimationStyle = `
  @keyframes arrowSlide {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-8px); }
  }
  .arrow-animation {
    animation: arrowSlide 1.5s ease-in-out infinite;
  }
`;

function FixedDiagnosisButton() {
  return (
    <>
      <style jsx>{arrowAnimationStyle}</style>
      <div className="fixed right-0 bottom-0 z-50 hidden lg:flex items-center">
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
        <Link
          href={DIAGNOSIS_PATH}
          className="flex flex-col items-center justify-center bg-gradient-to-b from-nobilva-accent to-nobilva-accent/80 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 px-4 py-6"
          style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
        >
          <div className="text-white font-bold text-base whitespace-nowrap">
            無料学習診断
          </div>
        </Link>
      </div>
    </>
  );
}

const FixedDiagnosisCTAInner = dynamic(
  () => Promise.resolve({ default: FixedDiagnosisButton }),
  { ssr: false, loading: () => null },
);

export function FixedDiagnosisCTA() {
  return <FixedDiagnosisCTAInner />;
}
