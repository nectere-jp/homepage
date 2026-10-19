"use client";

import { LuStar } from "react-icons/lu";

interface PrioritySelectorProps {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}

export const PrioritySelector = ({ value, onChange }: PrioritySelectorProps) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p as 1 | 2 | 3 | 4 | 5)}
          className={`p-3 rounded-lg border-2 transition-all ${
            value === p
              ? "border-yellow-400 bg-yellow-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex gap-0.5">
            {[...Array(p)].map((_, i) => (
              <LuStar
                key={i}
                className={`w-5 h-5 ${
                  value >= p
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};
