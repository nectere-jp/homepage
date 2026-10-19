"use client";

import type { ReactNode } from "react";
import { LuPencil, LuPlus, LuUndo2 } from "react-icons/lu";
import type { MasterKeyword } from "./types";

interface KwActionsCellProps {
  kw: MasterKeyword;
  cellPy: string;
  hasPendingEdit?: boolean;
  onRevertEdit?: () => void;
  onAddCluster?: () => void;
  onCreate: () => void;
  onMoveMenu?: ReactNode;
}

export const KwActionsCell = ({
  kw,
  cellPy,
  hasPendingEdit,
  onRevertEdit,
  onAddCluster,
  onCreate,
  onMoveMenu,
}: KwActionsCellProps) => {
  return (
    <td className={`${cellPy} px-4 align-top min-w-[7.5rem]`}>
      <div className="flex flex-nowrap gap-1 items-center">
        {hasPendingEdit && onRevertEdit && (
          <button
            type="button"
            onClick={onRevertEdit}
            className="p-1.5 border border-amber-400 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
            title="この行の変更を元に戻す"
          >
            <LuUndo2 className="w-4 h-4" />
          </button>
        )}
        {kw.articleRole === "hub" && onAddCluster && (
          <button
            type="button"
            onClick={onAddCluster}
            className="p-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="クラスター（ロングテール）を追加"
          >
            <LuPlus className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onCreate}
          disabled={kw.assignedArticles.length > 0}
          className="p-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title={
            kw.assignedArticles.length > 0
              ? "記事あり（詳細から編集）"
              : "記事を作成"
          }
        >
          <LuPencil className="w-4 h-4" />
        </button>
        {onMoveMenu}
      </div>
    </td>
  );
};
