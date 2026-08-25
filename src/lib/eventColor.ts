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
  purple: "bg-violet-100 text-violet-600",
  pink: "bg-pink-100 text-pink-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
};

// Soft full-card wash + matching border, keyed off the same palette, so an
// event card reads as "colorful" at a glance instead of plain white with a
// colored badge in the corner.
export const EVENT_CARD_BG_CLASS: Record<EventColor, string> = {
  purple: "bg-gradient-to-br from-violet-50/80 to-white border-violet-100",
  pink: "bg-gradient-to-br from-pink-50/80 to-white border-pink-100",
  amber: "bg-gradient-to-br from-amber-50/80 to-white border-amber-100",
  blue: "bg-gradient-to-br from-blue-50/80 to-white border-blue-100",
  green: "bg-gradient-to-br from-emerald-50/80 to-white border-emerald-100",
};

export function eventColorFor(key: string): EventColor {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return EVENT_COLOR_PALETTE[hash % EVENT_COLOR_PALETTE.length];
}
