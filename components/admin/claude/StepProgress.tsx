"use client";

import { LuSparkles } from "react-icons/lu";
import type { ArticleStep } from "./constants";

interface StepProgressProps {
  step: ArticleStep;
  showRestoreButton: boolean;
  onRestore: () => void;
}

const STEP_LABELS: { step: ArticleStep; label: string }[] = [
  { step: "keywords", label: "キーワード" },
  { step: "deepDive", label: "深掘り" },
  { step: "outline", label: "アウトライン" },
  { step: "content", label: "本文" },
];

export function StepProgress({ step, showRestoreButton, onRestore }: StepProgressProps) {
  const steps: ArticleStep[] = STEP_LABELS.map((s) => s.step);
  const currentIndex = steps.indexOf(step);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center flex-1">
          {STEP_LABELS.map(({ label }, index) => {
            const isActive = index <= currentIndex;
            return (
              <div key={label} className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                    isActive ? "bg-primary text-white shadow-soft" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 font-medium ${isActive ? "text-primary" : "text-gray-600"}`}>
                  {label}
                </span>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${index < currentIndex ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
        {showRestoreButton && (
          <button
            onClick={onRestore}
            className="ml-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <LuSparkles className="w-4 h-4" />
            進捗を復元
          </button>
        )}
      </div>
    </div>
  );
}
