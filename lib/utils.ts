import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を一貫してフォーマットする（ハイドレーションエラーを防ぐ）
 * サーバーとクライアントで同じ結果を返すようにする
 */
export function formatDate(date: Date | string, locale: string = 'ja'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // ISO文字列から直接フォーマット（タイムゾーンの影響を受けない）
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  if (locale === 'ja') {
    return `${year}年${month}月${day}日`;
  } else if (locale === 'en') {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${day}, ${year}`;
  } else {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
