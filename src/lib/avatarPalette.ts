// Deterministic soft-color assignment for square project/entity avatars
// (member avatars use AiAvatar.vue's own hue-hash instead -- this is for the
// flatter "pastel chip" look used by the project/assignee picker rows).
// Same id always maps to the same color, no server-assigned palette index
// needed.
const PALETTE = [
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
] as const;

export function avatarPalette(id: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % PALETTE.length;
  return PALETTE[hash]!;
}
