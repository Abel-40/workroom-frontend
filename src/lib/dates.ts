// Single source of truth for date/time display across the app. Every
// component that needs to show a timestamp should import from here rather
// than calling Intl.DateTimeFormat/date-fns directly -- that's what keeps
// timezone conversion (see currentTimeZone) consistent everywhere instead of
// reimplemented per component.
import { formatDistanceToNowStrict } from "date-fns";
import { useAuthStore } from "@/stores/authStore";

// The user's chosen timezone (Settings -> Account), falling back to the
// browser's own detected zone when unset -- e.g. before login, or if the
// user never picked one.
export function currentTimeZone(): string {
  try {
    const preferred = useAuthStore().logedInUserInfo?.user?.timezone;
    if (preferred) return preferred;
  } catch {
    // Pinia not active yet (e.g. called outside app context) -- fall through.
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "3 hours ago" -- duration math, not a point-in-time rendering, so it's
// timezone-agnostic by nature.
export function formatRelativeTime(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "—";
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return "—";
  }
}

// "Mar 5, 2026"
export function formatShortDate(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: currentTimeZone(),
  }).format(date);
}

// "AUG" -- for the compact month/day date badge on event cards.
export function formatMonthShort(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: currentTimeZone() })
    .format(date)
    .toUpperCase();
}

// "25" -- day-of-month only, paired with formatMonthShort in the same badge.
export function formatDayNumber(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: currentTimeZone() }).format(date);
}

// "3:45 PM"
export function formatTime(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: currentTimeZone(),
  }).format(date);
}

// "Mar 5, 2026, 3:45 PM"
export function formatDateTime(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: currentTimeZone(),
  }).format(date);
}
