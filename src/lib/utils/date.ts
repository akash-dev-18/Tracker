import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function startOfTodayISO(): string {
  return startOfDay(new Date()).toISOString();
}

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? date : null;
}

export function formatShort(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, "d MMM yyyy");
}

export function formatCompact(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, "d MMM");
}

export function formatMonthDay(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, "MMM d");
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  const date = toDate(value);
  if (!date) return null;
  return differenceInCalendarDays(startOfDay(date), startOfDay(new Date()));
}

export function isDueToday(value: string | Date | null | undefined): boolean {
  const delta = daysUntil(value);
  return delta !== null && delta <= 0;
}

export function formatDayGreeting(): string {
  return format(new Date(), "EEEE, d MMMM");
}

export function addDaysISO(days: number, from: Date = new Date()): string {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return format(next, "yyyy-MM-dd");
}
