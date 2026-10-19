"use client";

import type { TeamEndorsement } from "@/lib/teams";
import { TeamImageUpload } from "./TeamImageUpload";

interface EndorsementsFieldProps {
  value: TeamEndorsement[];
  onChange: (next: TeamEndorsement[]) => void;
}

export const EndorsementsField = ({
  value,
  onChange,
}: EndorsementsFieldProps) => {
  const updateAt = (i: number, patch: Partial<TeamEndorsement>) => {
    const next = [...value];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        推薦コメント（任意・複数可）
      </label>
      <p className="text-xs text-gray-400 mb-3">
        監督・コーチ・保護者代表など、チーム関係者からのコメントを追加できます。
      </p>
      {value.map((e, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500">
              コメント {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-xs text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="名前（例: 山田監督）"
              value={e.name}
              onChange={(ev) => updateAt(i, { name: ev.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="肩書（例: 監督 / 保護者代表）"
              value={e.title}
              onChange={(ev) => updateAt(i, { title: ev.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            rows={2}
            placeholder="コメント内容"
            value={e.comment}
            onChange={(ev) => updateAt(i, { comment: ev.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-2"
          />
          <TeamImageUpload
            variant="endorsement"
            idSuffix={i}
            value={e.imageUrl ?? ""}
            onChange={(url) => updateAt(i, { imageUrl: url })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...value, { name: "", title: "", comment: "" }])
        }
        className="text-sm text-primary hover:text-primary/80 font-medium"
      >
        + コメントを追加
      </button>
    </div>
  );
};
