"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { formatDateDisplay } from "@/lib/date-utils";
import type { BookingModalState } from "./types";

interface BookingModalProps {
  state: BookingModalState;
  staffName: string;
  onClose: () => void;
  onBook: (bookedBy: string, memo: string) => Promise<void>;
  onUnbook: () => Promise<void>;
}

export function BookingModal({
  state,
  staffName,
  onClose,
  onBook,
  onUnbook,
}: BookingModalProps) {
  const [bookedBy, setBookedBy] = useState(state.existing?.bookedBy || "");
  const [memo, setMemo] = useState(state.existing?.memo || "");
  const [submitting, setSubmitting] = useState(false);

  const dateDisplay = formatDateDisplay(state.date);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookedBy.trim()) return;
    setSubmitting(true);
    await onBook(bookedBy, memo);
    setSubmitting(false);
  };

  const handleUnbook = async () => {
    setSubmitting(true);
    await onUnbook();
    setSubmitting(false);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={state.mode === "book" ? "予約を入れる" : "予約情報"}
      size="md"
    >
      <div className="p-6">
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">担当者</span>
              <p className="font-medium text-gray-900">{staffName}</p>
            </div>
            <div>
              <span className="text-gray-500">日時</span>
              <p className="font-medium text-gray-900">
                {dateDisplay} {state.time}-{state.endTime}
              </p>
            </div>
          </div>
        </div>

        {state.mode === "book" ? (
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予約者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: 山田花子 様"
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <input
                type="text"
                placeholder="例: 中2・シニア所属"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!bookedBy.trim() || submitting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? "予約中..." : "予約を確定"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-gray-500">予約者</span>
              <p className="text-sm text-gray-900 mt-0.5">
                {state.existing?.bookedBy || "（未設定）"}
              </p>
            </div>
            {state.existing?.memo && (
              <div>
                <span className="text-xs font-bold text-gray-500">メモ</span>
                <p className="text-sm text-gray-900 mt-0.5">
                  {state.existing.memo}
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                閉じる
              </button>
              <button
                onClick={handleUnbook}
                disabled={submitting}
                className="flex-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? "解除中..." : "予約を解除"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
