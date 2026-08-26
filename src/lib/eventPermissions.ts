// Client-side gate for showing event management controls (delete, bulk
// select) -- mirrors event_management.services.user_can_manage_event on the
// backend, which remains authoritative. Shared by EventCard.vue and
// EventDetailView.vue so there's one rule, not two.
import { isCompanyAdmin, type Role } from "@/lib/permissions";
import type { EventEntry } from "@/stores/eventStore";

export function canManageEvent(
  event: EventEntry | null | undefined,
  currentUserId: string | undefined,
  role: Role | null | undefined,
  currentUserDepartmentId: string | null | undefined
): boolean {
  if (!event) return false;
  if (event.organizerId === currentUserId) return true;
  if (isCompanyAdmin(role)) return true;
  return role === "DL" && !!event.departmentId && event.departmentId === currentUserDepartmentId;
}
