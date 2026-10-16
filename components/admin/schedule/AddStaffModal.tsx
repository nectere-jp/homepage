"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";

interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (name: string, email: string) => Promise<void>;
  nextColor: string;
}

export function AddStaffModal({ onClose, onAdd, nextColor }: AddStaffModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onAdd(name, email);
    setSubmitting(false);
  };

  return (
    <Modal isOpen onClose={onClose} title="担当者を追加" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="例: 中村"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            placeholder="例: nakamura@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カレンダーカラー
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: nextColor }}
            />
            <span className="text-xs text-gray-400">自動割り当て</span>
          </div>
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
            disabled={!name.trim() || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            {submitting ? "追加中..." : "追加"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
