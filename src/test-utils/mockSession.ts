// Shared by component tests that need a logged-in authStore for a given
// role. Not imported by any production code -- Vite only bundles what's
// reachable from main.ts, so this never ships.
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/lib/permissions";

export function setSessionRole(role: Role, overrides: { departmentId?: string | null } = {}) {
  const authStore = useAuthStore();
  authStore.logedInUserInfo = {
    user: { id: "test-user-1", username: "Test User", email: "test@workroom.dev" },
    is_authenticated: true,
    access: "test-token",
    role,
    company_id: "test-company-1",
    company_name: "Test Co",
    company_created_at: "2025-01-01T00:00:00.000Z",
    departmentId: overrides.departmentId ?? (role === "DL" || role === "DM" ? "test-department-1" : null),
  };
  return authStore;
}
