'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/admin/Modal';
import { AdminButton } from '@/components/admin/AdminButton';

export interface TagFormData {
  tag: string;
  displayName: string;
  description: string;
}

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initial: TagFormData;
  onSave: (data: TagFormData) => Promise<void> | void;
}

const EMPTY_DATA: TagFormData = { tag: '', displayName: '', description: '' };

export function TagFormModal({ isOpen, onClose, mode, initial, onSave }: TagFormModalProps) {
  const [formData, setFormData] = useState<TagFormData>(initial ?? EMPTY_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData(initial ?? EMPTY_DATA);
  }, [isOpen, initial]);

  const isEdit = mode === 'edit';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'タグを編集' : '新しいタグを追加'}
      size="2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <AdminButton variant="secondary" onClick={onClose} disabled={saving}>
            キャンセル
          </AdminButton>
          <AdminButton onClick={handleSave} disabled={saving}>
            {isEdit ? '保存' : '追加'}
          </AdminButton>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ名{!isEdit && <span className="text-red-500">*</span>}
            {isEdit && '（変更不可）'}
          </label>
          <input
            type="text"
            value={formData.tag}
            disabled={isEdit}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            placeholder="例: 野球"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">表示名</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder={isEdit ? undefined : '表示名を入力（未入力の場合はタグ名が使用されます）'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder={isEdit ? undefined : 'タグの説明を入力'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </Modal>
  );
}
