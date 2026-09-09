<script setup lang="ts">
// Departments -- "How does the organization collaborate?"
// Departments own people and projects; roles come from ROLE_LABELS, so what
// a visitor reads here is the same vocabulary the invite flow uses.
import { Building2, UserPlus } from "lucide-vue-next";
import { DEMO_DEPARTMENTS, DEMO_PEOPLE, DEMO_COMPANY } from "../demoWorkspace";

const roleTone: Record<string, string> = {
  Owner: "hsl(var(--wr-lp-accent))",
  "Company Manager": "hsl(var(--wr-lp-brand))",
  "Department Leader": "hsl(38 92% 45%)",
  "Department Member": "hsl(218 11% 55%)",
};
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 wr-line">
      <h3 class="text-[15px] font-bold tracking-tight wr-t1">Departments</h3>
      <span class="text-[10.5px] wr-t3">{{ DEMO_COMPANY.name }} · {{ DEMO_COMPANY.memberCount }} members</span>
      <span class="flex-1" />
      <span
        class="flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-semibold text-white"
        style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
      >
        <UserPlus class="h-3 w-3" /> Invite member
      </span>
    </div>

    <div class="app-split-2 grid min-h-0 flex-1 overflow-hidden">
      <!-- Department list -->
      <div class="flex min-h-0 flex-col gap-2 overflow-hidden p-3">
        <div
          v-for="d in DEMO_DEPARTMENTS"
          :key="d.name"
          class="wr-app-well rounded-lg border p-2.5 wr-line-soft"
          :style="d.name === 'Design' ? 'border-color: hsl(var(--wr-lp-brand) / .45)' : ''"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style="background: hsl(var(--wr-lp-brand) / .12)"
            >
              <Building2 class="h-3.5 w-3.5" style="color: hsl(var(--wr-lp-brand))" />
            </span>
            <span class="min-w-0 flex-1 leading-tight">
              <span class="block truncate text-[12px] font-semibold wr-t1">{{ d.name }}</span>
              <span class="block truncate text-[10px] wr-t3">Lead · {{ d.lead }}</span>
            </span>
            <span class="shrink-0 text-right leading-tight">
              <span class="block text-[12px] font-bold tabular-nums wr-t1">{{ d.members }}</span>
              <span class="block text-[10.5px] wr-t3">members</span>
            </span>
          </div>
          <div class="mt-2 flex items-center gap-2 text-[10.5px] wr-t3">
            <span class="tabular-nums">{{ d.activeProjects }} active projects</span>
            <span class="h-1 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
              <span
                class="block h-full rounded-full"
                :style="{
                  width: Math.min(d.load, 100) + '%',
                  background: d.load > 90 ? 'hsl(38 92% 50%)' : 'hsl(var(--wr-lp-brand))',
                }"
              />
            </span>
            <span class="tabular-nums">{{ d.load }}%</span>
          </div>
        </div>
      </div>

      <!-- Member table for the selected department -->
      <div class="flex min-h-0 flex-col overflow-hidden border-l wr-line">
        <div class="shrink-0 px-4 py-2.5">
          <p class="text-[12.5px] font-semibold wr-t1">Design · Members</p>
          <p class="text-[10px] wr-t3">Maya Chen leads 5 people across 3 active projects</p>
        </div>
        <div
          class="app-mrow grid shrink-0 gap-2 border-y px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider wr-t3 wr-line"
        >
          <span>Member</span><span>Role</span><span class="text-right">Tasks</span>
        </div>
        <div class="min-h-0 flex-1 overflow-hidden">
          <div
            v-for="p in DEMO_PEOPLE"
            :key="p.name"
            class="app-mrow grid items-center gap-2 border-b px-4 py-2 wr-line-soft"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
                >{{ p.initials }}</span
              >
              <span class="min-w-0 leading-tight">
                <span class="block truncate text-[11.5px] font-semibold wr-t1">{{ p.name }}</span>
                <span class="block truncate text-[10.5px] wr-t3">{{ p.profession }}</span>
              </span>
            </span>
            <span class="flex items-center gap-1.5 text-[10.5px] wr-t2">
              <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: roleTone[p.roleLabel] }" />
              <span class="truncate">{{ p.roleLabel }}</span>
            </span>
            <span class="text-right text-[11px] font-semibold tabular-nums wr-t1">{{ p.activeTasks }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
