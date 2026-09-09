// Purely presentational per-event-type color, deterministic by name (same
// technique ActivityStream.vue uses for CompanyActivity.type). Not a
// backend field: nothing in the Event data model backs a per-event "color."
// Shared by EventCard.vue and CalendarView.vue so there's one palette/hash,
// not two.
export const EVENT_COLOR_PALETTE = ["purple", "pink", "amber", "blue", "green"] as const;
export type EventColor = (typeof EVENT_COLOR_PALETTE)[number];

export const EVENT_BORDER_CLASS: Record<EventColor, string> = {
  purple: "border-violet-400",
  pink: "border-pink-400",
  amber: "border-amber-400",
  blue: "border-blue-400",
  green: "border-emerald-400",
};

// Tinted background + matching text, for the date badge / type pill on
// EventCard and EventCardCompact -- same palette as EVENT_BORDER_CLASS, one
// source for both so a given event type always reads as the same color
// everywhere it appears.
export const EVENT_BADGE_CLASS: Record<EventColor, string> = {
  purple: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
};

// Soft full-card wash + matching border, keyed off the same palette, so an
// event card reads as "colorful" at a glance instead of plain white with a
// colored badge in the corner.
export const EVENT_CARD_BG_CLASS: Record<EventColor, string> = {
  purple: "bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-500/10 dark:to-card border-violet-100 dark:border-violet-500/20",
  pink: "bg-gradient-to-br from-pink-50/80 to-white dark:from-pink-500/10 dark:to-card border-pink-100 dark:border-pink-500/20",
  amber: "bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-500/10 dark:to-card border-amber-100 dark:border-amber-500/20",
  blue: "bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-500/10 dark:to-card border-blue-100 dark:border-blue-500/20",
  green: "bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-500/10 dark:to-card border-emerald-100 dark:border-emerald-500/20",
};

export function eventColorFor(key: string): EventColor {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return EVENT_COLOR_PALETTE[hash % EVENT_COLOR_PALETTE.length];
}
