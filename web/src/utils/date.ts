/**
 * Baskly.money - Deterministic Timestamp & Date Formatting Helpers
 * Standardized to Indian Standard Time (Asia/Kolkata).
 */

export function formatKolkataTimestamp(timestamp?: string | null): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";

  try {
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}
