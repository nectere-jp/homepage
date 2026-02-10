/**
 * メッセージJSON内の改行位置プレースホルダ（‖）をゼロ幅スペース（\u200B）に変換する
 *
 * エディタでは改行可能位置を ‖ で可視化し、読み込み時に \u200B に置換して
 * addSoftBreaks（ゼロ幅スペースのまま表示）と組み合わせて使用する。
 */
const PLACEHOLDER = '\u2016'; // ‖ (U+2016 DOUBLE VERTICAL LINE)
const ZERO_WIDTH_SPACE = '\u200B';

function replaceInString(value: string): string {
  return value.split(PLACEHOLDER).join(ZERO_WIDTH_SPACE);
}

function processMessages(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return replaceInString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(processMessages);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, processMessages(v)])
    );
  }
  return obj;
}

/**
 * メッセージオブジェクト内の全文字列で ‖ を \u200B に置換する
 */
export function resolveSoftBreakPlaceholders<T>(messages: T): T {
  return processMessages(messages) as T;
}
