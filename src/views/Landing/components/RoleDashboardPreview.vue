<script setup lang="ts">
// Hero centerpiece. The reference layout used one generic "dashboard"
// mockup; Workroom's dashboards actually differ by role (see
// DlDashboard.vue / DmDashboard.vue), so this reproduces that split
// instead of a single fictional screen -- a DL manages a department
// (workload, overdue, department projects), a DM manages only their own
// day (today's tasks, my projects, next up). Static demo data only: this
// renders on the public marketing page, so it must never touch the real
// stores/API.
import { ref, computed, watch, nextTick } from "vue";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarDays,
  Sparkles,
  Bell,
  Search,
  AlertTriangle,
  CheckCircle2,
} from "lucide-vue-next";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type RoleKey = "dl" | "dm";

const role = ref<RoleKey>("dl");
const chartPath = ref<SVGPathElement | null>(null);

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FolderKanban, label: "Projects" },
  { icon: Users, label: "Team" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: Sparkles, label: "AI Assistant" },
];

const workload = [
  { name: "Maya Chen", role: "UI Designer", percent: 92 },
  { name: "Jordan Lee", role: "Backend Engineer", percent: 74 },
  { name: "Priya Nair", role: "QA Engineer", percent: 58 },
];

const overdue = [
  { title: "Update onboarding flow", project: "Mobile App", days: 2 },
  { title: "Fix checkout validation", project: "Storefront", days: 1 },
];

const todayTasks = [
  { title: "Review PR: search filters", project: "Mobile App", done: true, priority: "high" },
  { title: "Write API docs for /tasks", project: "Platform", done: false, priority: "medium" },
  { title: "Sync with design on empty states", project: "Mobile App", done: false, priority: "low" },
];

const myProjects = [
  { title: "Mobile App", tasks: "6 active", mode: "Open" },
  { title: "Platform", tasks: "3 active", mode: "Manage" },
];

const nextEvent = { title: "Sprint planning", day: "24", month: "AUG", time: "10:00 AM" };

const priorityDot = (level: string) =>
  level === "high" ? "bg-rose-500" : level === "medium" ? "bg-amber-500" : "bg-emerald-500";

const roles: Array<{ key: RoleKey; label: string }> = [
  { key: "dl", label: "Department Leader" },
  { key: "dm", label: "Department Member" },
];

const animateChart = () => {
  if (!chartPath.value || prefersReducedMotion()) return;
  const length = chartPath.value.getTotalLength();
  gsap.fromTo(
    chartPath.value,
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" }
  );
};

watch(
  role,
  async (value) => {
    if (value !== "dl") return;
    await nextTick();
    animateChart();
  },
  { immediate: true }
);

const isDl = computed(() => role.value === "dl");
</script>

<template>
  <div class="wr-glass wr-frame-shadow relative overflow-hidden rounded-[22px] p-2 sm:p-3">
    <div class="flex overflow-hidden rounded-2xl bg-white/40">
      <!-- Mini sidebar -->
      <div class="hidden w-14 shrink-0 flex-col items-center gap-4 border-r border-white/50 py-4 sm:flex">
        <div class="h-7 w-7 rounded-lg bg-gradient-to-br from-[#3F8CFF] to-accent-2" />
        <div class="mt-2 flex flex-col gap-3">
          <div
            v-for="(item, i) in navItems"
            :key="item.label"
            class="grid h-8 w-8 place-items-center rounded-lg"
            :class="i === 0 ? 'bg-primary-soft text-primary-strong' : 'text-[#9AA3B5]'"
            :title="item.label"
          >
            <component :is="item.icon" class="h-4 w-4" />
          </div>
        </div>
      </div>

      <!-- Main preview panel -->
      <div class="min-w-0 flex-1 p-3.5 sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-2">
          <div class="flex min-w-0 items-center gap-2 rounded-lg bg-white/60 px-2.5 py-1.5 text-xs text-[#9AA3B5]">
            <Search class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate">Search anything&hellip;</span>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <div class="grid h-7 w-7 place-items-center rounded-full bg-white/60 text-[#7D8592]">
              <Bell class="h-3.5 w-3.5" />
            </div>
            <div class="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-[10px] font-bold text-white">
              {{ isDl ? "ML" : "AK" }}
            </div>
          </div>
        </div>

        <!-- Role switcher -->
        <div class="mb-4 inline-flex rounded-full bg-white/50 p-1 text-[11px] font-semibold">
          <button
            v-for="r in roles"
            :key="r.key"
            type="button"
            class="rounded-full px-3 py-1.5 transition"
            :class="role === r.key ? 'bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-sm' : 'text-[#7D8592]'"
            @click="role = r.key"
          >
            {{ r.label }}
          </button>
        </div>

        <Transition name="fade-swap" mode="out-in">
          <!-- Department Leader view -->
          <div v-if="isDl" key="dl" class="space-y-3.5">
            <div>
              <p class="mb-1.5 text-[10px] font-bold uppercase tracking-[.06em] text-[#9AA3B5]">Design department &middot; output trend</p>
              <div class="wr-well rounded-xl p-3">
                <svg viewBox="0 0 240 64" class="h-14 w-full" preserveAspectRatio="none">
                  <path d="M0,48 L40,40 L80,44 L120,26 L160,30 L200,14 L240,10" fill="none" stroke="url(#wr-preview-line)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" ref="chartPath" />
                  <defs>
                    <linearGradient id="wr-preview-line" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stop-color="#3F8CFF" />
                      <stop offset="1" stop-color="#6A5CFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div class="wr-well rounded-xl p-3">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[.06em] text-[#9AA3B5]">Team workload this week</p>
              <div class="space-y-2">
                <div v-for="person in workload" :key="person.name" class="flex items-center gap-2">
                  <div class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[9px] font-bold text-primary-strong">
                    {{ person.name.split(" ").map((n) => n[0]).join("") }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[11px] font-semibold text-ink">{{ person.name }}</p>
                    <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/[.06]">
                      <div class="h-full rounded-full bg-gradient-to-r from-[#3F8CFF] to-accent-2" :style="{ width: person.percent + '%' }" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="wr-well rounded-xl p-3">
              <p class="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.06em] text-[#9AA3B5]">
                <AlertTriangle class="h-3 w-3 text-rose-500" /> Overdue in Design
              </p>
              <div class="space-y-1.5">
                <div v-for="item in overdue" :key="item.title" class="flex items-center justify-between gap-2">
                  <p class="truncate text-[11px] font-medium text-ink">{{ item.title }}</p>
                  <span class="shrink-0 text-[10px] font-semibold text-rose-600">{{ item.days }}d</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Department Member view -->
          <div v-else key="dm" class="space-y-3.5">
            <div class="wr-well rounded-xl p-3">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[.06em] text-[#9AA3B5]">Today</p>
              <div class="space-y-2">
                <div v-for="task in todayTasks" :key="task.title" class="flex items-center gap-2">
                  <div
                    class="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border"
                    :class="task.done ? 'border-primary bg-primary text-white' : 'border-slate-900/20'"
                  >
                    <CheckCircle2 v-if="task.done" class="h-3 w-3" />
                  </div>
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="priorityDot(task.priority)" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[11px] font-medium" :class="task.done ? 'text-[#9AA3B5] line-through' : 'text-ink'">{{ task.title }}</p>
                  </div>
                  <span class="shrink-0 text-[9px] text-[#9AA3B5]">{{ task.project }}</span>
                </div>
              </div>
            </div>

            <div class="wr-well rounded-xl p-3">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[.06em] text-[#9AA3B5]">My projects</p>
              <div class="space-y-1.5">
                <div v-for="p in myProjects" :key="p.title" class="flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate text-[11px] font-semibold text-ink">{{ p.title }}</p>
                    <p class="truncate text-[9px] text-[#9AA3B5]">{{ p.tasks }}</p>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                    :class="p.mode === 'Manage' ? 'bg-primary-soft text-primary-strong' : 'bg-slate-900/5 text-[#7D8592]'"
                  >
                    {{ p.mode }}
                  </span>
                </div>
              </div>
            </div>

            <div class="wr-well flex items-center gap-2.5 rounded-xl p-3">
              <div class="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-white/70 text-center leading-none">
                <span class="text-[8px] font-bold uppercase text-primary-strong">{{ nextEvent.month }}</span>
                <span class="text-xs font-extrabold text-ink">{{ nextEvent.day }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[11px] font-semibold text-ink">{{ nextEvent.title }}</p>
                <p class="truncate text-[9px] text-[#9AA3B5]">{{ nextEvent.time }}</p>
              </div>
            </div>
          </div>
        </Transition>

        <div class="mt-3.5 flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#3F8CFF] to-accent-2 p-3 text-white shadow-[0_8px_22px_rgba(63,140,255,0.35)]">
          <Sparkles class="h-4 w-4 shrink-0" />
          <p class="text-[11px] font-semibold leading-snug">Ask AI to break this project into tasks&hellip;</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-swap-enter-active,
.fade-swap-leave-active {
  transition: opacity 0.2s ease;
}
.fade-swap-enter-from,
.fade-swap-leave-to {
  opacity: 0;
}
</style>
