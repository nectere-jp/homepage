"use client";

import type { BusinessType } from "@/lib/blog";
import { BUSINESS_LABELS } from "@/components/admin/keywords/constants";
import { TagSelector } from "@/components/admin/TagSelector";
import { PrioritySelector } from "./PrioritySelector";
import type { KeywordFormData } from "./types";

interface BasicFieldsProps {
  formData: KeywordFormData;
  isNew: boolean;
  onChange: (patch: Partial<KeywordFormData>) => void;
}

export const BasicFields = ({ formData, isNew, onChange }: BasicFieldsProps) => {
  const handleBusinessToggle = (business: BusinessType) => {
    onChange({
      relatedBusiness: formData.relatedBusiness.includes(business)
        ? formData.relatedBusiness.filter((b) => b !== business)
        : [...formData.relatedBusiness, business],
    });
  };

  return (
    <>
      {/* キーワード */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          キーワード <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={!isNew}
          value={formData.keyword ?? ""}
          onChange={(e) => onChange({ keyword: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
          placeholder="例: 野球 勉強 両立"
        />
        {!isNew && (
          <p className="mt-1 text-sm text-gray-500">
            キーワードは編集できません
          </p>
        )}
      </div>

      {/* 重要度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          重要度 <span className="text-red-500">*</span>
        </label>
        <PrioritySelector
          value={formData.priority}
          onChange={(priority) => onChange({ priority })}
        />
      </div>

      {/* 想定PV */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          想定月間PV数
        </label>
        <input
          type="number"
          min="0"
          value={formData.estimatedPv}
          onChange={(e) =>
            onChange({ estimatedPv: parseInt(e.target.value) || 0 })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="例: 5000"
        />
      </div>

      {/* 関連事業 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          関連事業 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleBusinessToggle(key as BusinessType)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.relatedBusiness.includes(key as BusinessType)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 関連タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          関連タグ
        </label>
        <TagSelector
          selectedTags={formData.relatedTags}
          onChange={(tags) => onChange({ relatedTags: tags })}
          placeholder="タグを選択または追加してください"
        />
      </div>
    </>
  );
};
