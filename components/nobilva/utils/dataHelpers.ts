/**
 * Nobilvaページ用のデータヘルパー関数
 * 
 * next-intlのメッセージオブジェクトから値を取得するためのユーティリティ関数群
 */

/**
 * メッセージオブジェクトから配列を取得する
 * 配列でない場合は、オブジェクトの値を配列として返す
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @param key - ドット区切りのキーパス（例: "pricing.plans"）
 * @returns 配列（値が見つからない場合は空配列）
 */
export function getArray(messages: any, key: string): any[] {
  const keys = key.split(".");
  let value: any = messages;
  for (const k of keys) {
    value = value?.[k];
  }
  if (!value) return [];
  return Array.isArray(value) ? value : Object.values(value);
}

/**
 * メッセージオブジェクトからネストされた値を取得する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @param key - ドット区切りのキーパス（例: "hero.title.prefix"）
 * @returns 取得した値（見つからない場合はundefined）
 */
export function getValue(messages: any, key: string): any {
  const keys = key.split(".");
  let value: any = messages;
  for (const k of keys) {
    value = value?.[k];
  }
  return value;
}

/**
 * メッセージオブジェクトから文字列を取得する
 * 値が文字列でない場合は文字列に変換する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @param key - ドット区切りのキーパス（例: "hero.title.prefix"）
 * @returns 文字列（値が見つからない場合は空文字列）
 */
export function getString(messages: any, key: string): string {
  const value = getValue(messages, key);
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}
