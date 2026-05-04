'use client';

import { useState, useRef } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';

const PLACEHOLDER_REGEX = /!\[([^\]]*)\]\((IMAGE_PLACEHOLDER:[^)]*)\)/;

interface BlogImageUploadProps {
  onReplacePlaceholder: (placeholderText: string, newMarkdown: string) => void;
}

export function BlogImageUpload({ onReplacePlaceholder }: BlogImageUploadProps) {
  const [placeholderText, setPlaceholderText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error: uploadError, upload } = useImageUpload();

  const error = validationError || uploadError;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toReplace = placeholderText.trim();
    if (!toReplace) {
      setValidationError('本文からプレースホルダーをコピーして貼り付けてください');
      return;
    }

    setValidationError(null);
    const match = toReplace.match(PLACEHOLDER_REGEX);
    const alt = match ? match[1] : '画像';
    const url = await upload(file, { aspect: 'body', alt });
    if (!url) return;

    const newMarkdown = `![${alt}](${url})`;
    onReplacePlaceholder(toReplace, newMarkdown);
    setPlaceholderText('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          置き換えるプレースホルダー（本文からコピーして貼り付け）
        </label>
        <input
          type="text"
          value={placeholderText}
          onChange={(e) => setPlaceholderText(e.target.value)}
          placeholder="例: ![野球の練習風景](IMAGE_PLACEHOLDER:baseball practice)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="blog-image-upload"
        />
        <label
          htmlFor="blog-image-upload"
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'アップロード中...' : '画像を選択して置き換え'}
        </label>
      </div>
      {error && (
        <p className="w-full text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
