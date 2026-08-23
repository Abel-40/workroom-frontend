// Shared pill-badge color helpers for the AI workspace -- extracted so
// AiPlanInspectorPanel and AiHealthCheckPanel don't each keep their own
// near-identical inline switch statement.
export function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-600";
    case "low":
      return "bg-emerald-100 text-emerald-600";
    default:
      return "bg-amber-100 text-amber-600";
  }
}

export function riskBadgeClass(level: string): string {
  switch (level) {
    case "high":
      return "bg-red-100 text-red-600";
    case "medium":
      return "bg-amber-100 text-amber-600";
    case "low":
      return "bg-emerald-100 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}
