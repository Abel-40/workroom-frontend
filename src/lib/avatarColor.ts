// Deterministic, purely cosmetic per-person avatar color -- same person
// always gets the same pair across renders/sessions since it's derived from
// their id, not randomized. Not a data signal (e.g. not role/status), just
// visual variety for people-grid cards (Colleagues, My Department roster).
// `solid` is a full, literal Tailwind class string (not built by string
// concatenation/replacement anywhere) so Tailwind's static content scan can
// find and keep it -- a dynamically-assembled class name (e.g.
// `bg-${color}-500`) never appears verbatim in source and gets purged from
// the production build, silently rendering with no color at all.
const PALETTE: { bg: string; text: string; solid: string }[] = [
  { bg: "bg-blue-100 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", solid: "bg-blue-500" },
  { bg: "bg-violet-100 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", solid: "bg-violet-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", solid: "bg-emerald-500" },
  { bg: "bg-orange-100 dark:bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-500" },
  { bg: "bg-pink-100 dark:bg-pink-500/15", text: "text-pink-600 dark:text-pink-400", solid: "bg-pink-500" },
  { bg: "bg-amber-100 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", solid: "bg-amber-500" },
];

export function avatarColorFor(id: string): { bg: string; text: string; solid: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
