'use client';

import { useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface UploadImageOptions {
  /** アスペクト分類（アセット登録用） */
  aspect?: 'thumbnail' | 'body';
  /** alt テキスト（アセットタグ用） */
  alt?: string;
}

export async function uploadImage(file: File, options?: UploadImageOptions): Promise<string> {
  const formData = new FormData();
  formData.set('file', file);
  if (options?.aspect) formData.set('aspect', options.aspect);
  if (options?.alt) formData.set('alt', options.alt);
  const res = await adminFetch('/api/admin/upload/image', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'アップロードに失敗しました');
  return data.url;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, options?: UploadImageOptions): Promise<string | null> => {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, options);
      return url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロードに失敗しました');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, error, upload };
}
