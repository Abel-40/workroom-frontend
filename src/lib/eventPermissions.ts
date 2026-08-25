// Coarse client-side gate for showing event management controls (delete,
// eventually edit) at all -- mirrors event_management.services
// .user_can_manage_event on the backend, which remains authoritative
// (department-leader department-scoping isn't modeled here). Shared by
// EventCard.vue and EventDetailView.vue so there's one rule, not two.
import type { EventEntry } from "@/stores/eventStore";

const MANAGER_ROLES = ["Owner", "CM", "DL"];

export function canManageEvent(
  event: EventEntry | null | undefined,
  currentUserId: string | undefined,
  role: string | null | undefined
): boolean {
  if (!event) return false;
  if (event.organizerId === currentUserId) return true;
  return MANAGER_ROLES.includes(role ?? "");
}
