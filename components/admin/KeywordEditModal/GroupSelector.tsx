"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeywordTier } from "@/lib/keyword-manager";
import { KEYWORD_TIER_LABELS } from "@/components/admin/keywords/constants";
import { adminFetch } from "@/lib/admin-fetch";
import type { GroupOption, KeywordFormData } from "./types";

interface GroupSelectorProps {
  isNew: boolean;
  formData: KeywordFormData;
  onChange: (patch: Partial<KeywordFormData>) => void;
}

export const GroupSelector = ({ isNew, formData, onChange }: GroupSelectorProps) => {
  const [groupsForSelect, setGroupsForSelect] = useState<GroupOption[]>([]);

  // モーダルが開くたびに最新のグループ一覧を取得する（isNew は依存に含めない）
  useEffect(() => {
    if (!isNew) return;
    adminFetch("/api/admin/keywords/master")
      .then((r) => r.json())
      .then((data) => {
        const list = data.keywords as Array<{
          groupId?: string;
          intentGroupId?: string;
          keyword?: string;
          mainKeywordInSameIntent?: string;
          keywordTier?: string;
        }>;
        if (!Array.isArray(list)) return;
        // 同趣旨（intentGroupId）ごとに1オプションにし、代表はルートの groupId を使う（重複表示を防ぐ）
        const byIntentId = new Map<string, GroupOption>();
        for (const row of list) {
          const gid = typeof row.groupId === "string" ? row.groupId.trim() : "";
          const intentId = (typeof row.intentGroupId === "string" ? row.intentGroupId.trim() : gid) || gid;
          if (!gid) continue;
          const isRoot = gid === intentId;
          const label = row.mainKeywordInSameIntent ?? row.keyword ?? gid;
          const keywordTier = (row.keywordTier ?? "middle") as KeywordTier;
          if (!byIntentId.has(intentId)) {
            byIntentId.set(intentId, { groupId: gid, label, keywordTier });
          } else if (isRoot) {
            // 既に子で登録されている場合は、ルートの行で上書き（代表は親ミドルにしたい）
            byIntentId.set(intentId, { groupId: gid, label, keywordTier });
          }
        }
        const options = Array.from(byIntentId.values()).sort((a, b) =>
          a.label.localeCompare(b.label, "ja"),
        );
        setGroupsForSelect(options);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const middleGroupOptions = useMemo(
    () => groupsForSelect.filter((g) => g.keywordTier === "middle" || g.keywordTier === "big"),
    [groupsForSelect],
  );

  return (
    <>
      {/* キーワード階層 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          キーワード階層
        </label>
        <div className="flex gap-2">
          {(["big", "middle", "longtail"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => onChange({ keywordTier: tier })}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.keywordTier === tier
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {KEYWORD_TIER_LABELS[tier]}
            </button>
          ))}
        </div>
      </div>

      {/* 新規時: 同趣旨のキーワードグループ（任意）・親ミドル */}
      {isNew && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              同趣旨のキーワードグループ（任意）
            </label>
            <select
              value={formData.addToGroupId}
              onChange={(e) =>
                onChange({
                  addToGroupId: e.target.value,
                  ...(e.target.value ? { parentId: "" } : {}),
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="">新規グループとして作成</option>
              {groupsForSelect.map((g) => (
                <option key={g.groupId} value={g.groupId}>
                  {g.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              選択すると、このキーワードはそのグループのバリアントとして追加されます
            </p>
          </div>
          {formData.keywordTier === "longtail" && !formData.addToGroupId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                親となるミドルキーワード
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => onChange({ parentId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">指定しない</option>
                {middleGroupOptions.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </>
  );
};
