export function formatFirestoreDate(timestamp: { _seconds: number }) {
  return new Date(timestamp._seconds * 1000).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
