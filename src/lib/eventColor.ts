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

export function eventColorFor(key: string): EventColor {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return EVENT_COLOR_PALETTE[hash % EVENT_COLOR_PALETTE.length];
}
