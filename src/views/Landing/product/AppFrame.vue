<script setup lang="ts">
/**
 * Static landing presentation of the authenticated Workroom shell.
 * Navigation and labels come from the real nav configuration, while the
 * controls remain inert so public visitors never touch auth or application state.
 */
import { Bell, ChevronDown, Moon, Search } from "lucide-vue-next";
import { computed } from "vue";
import { getNavItems } from "@/lib/navConfig";
import type { Role } from "@/lib/permissions";
import logoUrl from "@/assets/logo.png";
import { DEMO_COMPANY, DEMO_VIEWER } from "./demoWorkspace";

const props = withDefaults(
  defineProps<{
    active: string;
    role?: Role;
    searchHint?: string;
  }>(),
  { role: "CM", searchHint: "Search anything..." },
);

const navItems = computed(() => getNavItems(props.role));
</script>

<template>
  <div class="wr-app flex h-full min-h-0 w-full gap-3 p-3 text-[13px]">
    <aside class="wr-real-rail h-full min-h-0 w-[clamp(150px,25cqw,218px)] shrink-0 flex-col justify-between rounded-2xl border p-3 wr-line">
      <div class="space-y-5">
        <div class="wr-rail-brand flex items-center gap-2 px-1.5">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white/75 wr-line-soft dark:bg-white/[.06]"><img :src="logoUrl" alt="" class="h-6 w-6 object-contain" /></span>
          <span class="wr-rail-label truncate text-[15px] font-bold" style="color: hsl(var(--wr-lp-brand))">Workroom</span>
        </div>

        <nav aria-label="Primary" class="wr-real-nav min-h-0 space-y-1 overflow-y-auto">
          <span v-for="item in navItems" :key="item.key" class="flex h-9 items-center gap-3 rounded-xl px-2.5 text-[11px] transition" :class="item.key === active ? 'wr-real-nav-active font-semibold' : 'wr-t2'">
            <component :is="item.icon" class="h-4 w-4 shrink-0" :class="item.key === active ? 'wr-real-nav-icon' : ''" />
            <span class="wr-rail-label truncate">{{ item.title }}</span>
          </span>
        </nav>
      </div>

      <div class="space-y-2">
        <div class="wr-rail-label rounded-xl border px-2.5 py-2 wr-real-well wr-line-soft"><p class="text-[8.5px] leading-snug wr-t3">Company workspace</p><p class="mt-0.5 truncate text-[10px] font-medium wr-t1">{{ DEMO_COMPANY.name }}</p></div>
        <div class="flex items-center gap-2 rounded-xl p-2"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))">{{ DEMO_VIEWER.initials }}</span><span class="wr-rail-label min-w-0 flex-1 leading-tight"><span class="block truncate text-[10.5px] font-medium wr-t1">{{ DEMO_VIEWER.name }}</span><span class="block truncate text-[9px] wr-t3">{{ DEMO_VIEWER.roleLabel }}</span></span><ChevronDown class="h-3.5 w-3.5 shrink-0 wr-t3" /></div>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex shrink-0 items-center justify-between gap-3 px-1 pb-3">
        <div class="relative min-w-0 flex-1"><div class="wr-real-search flex h-9 items-center rounded-xl border px-3 shadow-sm wr-line"><Search class="h-3.5 w-3.5 shrink-0 wr-t3" /><span class="ml-2 min-w-0 flex-1 truncate text-[10.5px] wr-t3">{{ searchHint }}</span><kbd class="hidden rounded-md border px-1.5 py-0.5 font-mono text-[8px] wr-t3 sm:flex wr-line-soft">/</kbd></div></div>
        <div class="flex shrink-0 items-center gap-1.5"><span class="wr-header-control flex h-8 w-8 items-center justify-center rounded-xl border shadow-sm wr-real-control wr-line"><Moon class="h-3.5 w-3.5 wr-t2" /></span><span class="wr-header-control relative flex h-8 w-8 items-center justify-center rounded-xl border shadow-sm wr-real-control wr-line"><Bell class="h-3.5 w-3.5 wr-t2" /><span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" /></span><span class="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))">{{ DEMO_VIEWER.initials }}</span></div>
      </header>

      <div class="min-h-0 flex-1 overflow-hidden"><slot /></div>
    </div>
  </div>
</template>
