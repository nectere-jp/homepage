"use client";

import type {
  ClusterAxis,
  TargetReader,
  WorkflowFlag,
} from "@/lib/keyword-manager";
import {
  STATUS_LABELS,
  WORKFLOW_FLAG_LABELS,
  CLUSTER_AXIS_LABELS,
  TARGET_READER_LABELS,
} from "@/components/admin/keywords/constants";
import type { KeywordFormData } from "./types";

interface V5FieldsProps {
  formData: KeywordFormData;
  onChange: (patch: Partial<KeywordFormData>) => void;
}

export const V5Fields = ({ formData, onChange }: V5FieldsProps) => {
  return (
    <>
      {/* 予想検索順位・CVR */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            予想検索順位
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.expectedRank}
            onChange={(e) => onChange({ expectedRank: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="例: 5"
          />
          <p className="mt-1 text-xs text-gray-500">
            CTRは自動算出されます
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVR（%）
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.cvr}
            onChange={(e) => onChange({ cvr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="例: 2"
          />
        </div>
      </div>

      {/* 現在の順位 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          現在の検索順位（実測）
        </label>
        <input
          type="number"
          min="1"
          value={formData.currentRank}
          onChange={(e) => onChange({ currentRank: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="例: 15"
        />
      </div>

      {/* クラスター軸 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          クラスター軸
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CLUSTER_AXIS_LABELS) as [ClusterAxis, string][]).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ clusterAxis: val })}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.clusterAxis === val
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 記事ロール */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          記事タイプ
        </label>
        <div className="flex gap-2">
          {(["hub", "child"] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ articleRole: val })}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.articleRole === val
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {val === "hub" ? "ハブ記事" : "子記事"}
            </button>
          ))}
        </div>
      </div>

      {/* 対象読者 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          対象読者
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ targetReader: null })}
            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
              formData.targetReader === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 hover:border-gray-300 text-gray-700"
            }`}
          >
            未設定
          </button>
          {(Object.entries(TARGET_READER_LABELS) as [TargetReader, string][]).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ targetReader: val })}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.targetReader === val
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ハブ記事スラッグ（子記事の場合） */}
      {formData.articleRole === "child" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ハブ記事スラッグ
          </label>
          <input
            type="text"
            value={formData.hubArticleSlug}
            onChange={(e) => onChange({ hubArticleSlug: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="例: baseball-study-hub"
          />
        </div>
      )}

      {/* ワークフローフラグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ワークフローフラグ
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(WORKFLOW_FLAG_LABELS) as [WorkflowFlag, string][]).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ workflowFlag: val })}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.workflowFlag === val
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ステータス */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ステータス
        </label>
        <div className="flex gap-2">
          {(Object.entries(STATUS_LABELS) as ["active" | "paused" | "achieved", string][]).map(
            ([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ status: val })}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                  formData.status === val
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>
    </>
  );
};
