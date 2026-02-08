"use client";

import type { BusinessType } from "@/lib/blog";

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: "翻訳",
  "web-design": "Web制作",
  print: "印刷",
  nobilva: "Nobilva",
  teachit: "Teachit",
};

interface BusinessSelectorProps {
  selectedBusinesses: BusinessType[];
  onToggle: (business: BusinessType) => void;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
}

export function BusinessSelector({
  selectedBusinesses,
  onToggle,
  required = false,
  showError = false,
  errorMessage = "※ お役立ち情報の場合は、少なくとも1つの事業を選択してください",
}: BusinessSelectorProps) {
  return (
    <div>
      <label className="block text-base font-bold text-gray-900 mb-2">
        事業を選択
      </label>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key as BusinessType)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedBusinesses.includes(key as BusinessType)
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {showError && selectedBusinesses.length === 0 && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
