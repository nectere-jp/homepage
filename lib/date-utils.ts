export function formatFirestoreDate(timestamp: { _seconds: number }) {
  return new Date(timestamp._seconds * 1000).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 日曜始まりの曜日名（getDay() の index と対応） */
export const DAY_NAMES_SUN_FIRST = ["日", "月", "火", "水", "木", "金", "土"];

/** 月曜始まりの曜日名（カレンダー表示用） */
export const DAY_NAMES_MON_FIRST = ["月", "火", "水", "木", "金", "土", "日"];

/** その週の月曜 00:00 を返す */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** YYYY-MM-DD */
export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** M/D */
export function formatDateShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** "YYYY-MM-DD" → "M/D（曜）" */
export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}（${DAY_NAMES_SUN_FIRST[d.getDay()]}）`;
}

/** "HH:MM" + 30分 → "HH:MM" */
export function computeEndTime(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** 月曜日から始まる1週間の Date[] */
export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isPast(d: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return target < now;
}
