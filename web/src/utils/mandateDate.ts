import type { Mandate } from "@/types/baskly";

/**
 * Determine effective mandate frequency: "Daily" | "Weekly" | "Monthly"
 */
export const getMandateFrequency = (m: Mandate, index: number = 0): "Daily" | "Weekly" | "Monthly" => {
  if (m.frequency) return m.frequency;
  return "Monthly";
};

/**
 * Accurately calculate the NEXT upcoming execution date according to frequency:
 * - Daily: 24hr rule (tomorrow / next daily cycle)
 * - Weekly: 7 days rule (next scheduled weekday within 7 days)
 * - Monthly: 1 month rule (next upcoming debitDay)
 */
export const calculateNextMandateDate = (m: Mandate, index: number = 0): Date => {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000);
  const freq = getMandateFrequency(m, index);

  // Parse existing nextDebitDate if present
  let parsedDate: Date | null = null;
  if (m.nextDebitDate && typeof m.nextDebitDate === "string") {
    const parts = m.nextDebitDate.split("T")[0].split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const mth = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const cand = new Date(y, mth, d, 0, 0, 0, 0);
      if (!isNaN(cand.getTime())) {
        parsedDate = cand;
      }
    }
  }

  // 1. DAILY (24hr rule):
  // Executes every 24 hours. The next debit is tomorrow (+1 day).
  // Any date in the past (e.g. 30 Oct) or far future (e.g. 1 Dec) must roll to tomorrow.
  if (freq === "Daily") {
    if (
      parsedDate &&
      (parsedDate.getTime() === tomorrowMidnight.getTime() || parsedDate.getTime() === todayMidnight.getTime())
    ) {
      return parsedDate;
    }
    return tomorrowMidnight;
  }

  // 2. WEEKLY (7 days rule):
  // Executes every 7 days on the selected weekday.
  if (freq === "Weekly") {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let targetIdx = m.weeklyDay ? daysOfWeek.indexOf(m.weeklyDay) : -1;
    if (targetIdx === -1 && parsedDate) {
      targetIdx = parsedDate.getDay();
    }
    if (targetIdx === -1) {
      targetIdx = 1; // Default to Monday
    }

    // If parsedDate is on target weekday, in the future, and within 7 days, keep it
    if (
      parsedDate &&
      parsedDate.getDay() === targetIdx &&
      parsedDate.getTime() >= todayMidnight.getTime() &&
      parsedDate.getTime() <= todayMidnight.getTime() + 7 * 24 * 60 * 60 * 1000
    ) {
      return parsedDate;
    }

    const currentIdx = now.getDay();
    let diff = (targetIdx - currentIdx + 7) % 7;
    if (diff <= 0) diff += 7; // strictly upcoming occurrence within 7 days
    const d = new Date(todayMidnight);
    d.setDate(d.getDate() + diff);
    return d;
  }

  // 3. MONTHLY (1 month rule):
  // Executes once every month on the fixed debitDay (1-31).
  let day = Number(m.debitDay);
  if (!day || isNaN(day) || day < 1 || day > 31) {
    if (parsedDate) {
      day = parsedDate.getDate();
    } else {
      day = index === 0 ? 5 : 15;
    }
  }

  // If parsedDate is in the future, matches the target day of month, and is within 1 month, keep it
  if (parsedDate && parsedDate.getTime() >= todayMidnight.getTime()) {
    const daysInCandidateMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0).getDate();
    if (parsedDate.getDate() === Math.min(day, daysInCandidateMonth)) {
      const maxAllowed = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      if (parsedDate.getTime() <= maxAllowed.getTime()) {
        return parsedDate;
      }
    }
  }

  let nextYear = now.getFullYear();
  let nextMonth = now.getMonth();

  if (day <= now.getDate()) {
    nextMonth += 1;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
  }

  const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
  const finalDay = Math.min(day, daysInMonth);
  return new Date(nextYear, nextMonth, finalDay, 0, 0, 0, 0);
};

export const formatMandateNextDate = (m: Mandate, index: number = 0): string => {
  return calculateNextMandateDate(m, index).toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};
