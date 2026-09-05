<script setup lang="ts">
/**
 * The Workroom application shell, rendered as a presentation surface.
 *
 * Everything inside is real DOM styled from the theme tokens -- not a
 * screenshot -- so the product visual follows light/dark automatically and
 * stays sharp at any density. The sidebar is driven by the same
 * lib/navConfig.ts the signed-in app uses, so the labels a visitor sees on
 * the landing page are the labels they meet after signing up.
 */
import { computed } from "vue";
import { Search, Bell } from "lucide-vue-next";
import { getNavItems } from "@/lib/navConfig";
import type { Role } from "@/lib/permissions";
import { DEMO_COMPANY, DEMO_VIEWER } from "./demoWorkspace";

const props = withDefaults(
  defineProps<{
    /** navConfig key of the section being shown. */
    active: string;
    /** Role whose labels the sidebar should use. */
    role?: Role;
    /** Breadcrumb/search affordance text for the top bar. */
    searchHint?: string;
  }>(),
  { role: "CM", searchHint: "Search projects, tasks and people" }
);

const navItems = computed(() => getNavItems(props.role));
</script>

<template>
  <div class="wr-app flex h-full w-full text-[13px]">
    <!-- Sidebar: the real nav, same order and labels as the signed-in app -->
    <aside class="wr-app-rail hidden w-[188px] shrink-0 flex-col border-r sm:flex wr-line">
      <div class="flex items-center gap-2 px-4 py-3.5">
        <span
          class="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
          style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
          >W</span
        >
        <span class="truncate text-[13px] font-semibold wr-t1">{{ DEMO_COMPANY.name }}</span>
      </div>

      <nav class="flex flex-1 flex-col gap-0.5 px-2 py-1">
        <span
          v-for="item in navItems"
          :key="item.key"
          class="flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[12.5px] leading-none transition-colors"
          :class="
            item.key === active
              ? 'font-semibold text-white'
              : 'wr-t2 hover:bg-black/[.03] dark:hover:bg-white/[.04]'
          "
          :style="
            item.key === active
              ? 'background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))'
              : ''
          "
        >
          <component :is="item.icon" class="h-[15px] w-[15px] shrink-0" />
          <span class="truncate">{{ item.title }}</span>
        </span>
      </nav>

      <div class="flex items-center gap-2 border-t px-3 py-3 wr-line">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-black/[.06] text-[10px] font-bold wr-t1 dark:bg-white/10"
          >{{ DEMO_VIEWER.initials }}</span
        >
        <span class="min-w-0 leading-tight">
          <span class="block truncate text-[12px] font-semibold wr-t1">{{ DEMO_VIEWER.name }}</span>
          <span class="block truncate text-[10.5px] wr-t3">{{ DEMO_VIEWER.roleLabel }}</span>
        </span>
      </div>
    </aside>

    <!-- Content column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex shrink-0 items-center gap-3 border-b px-4 py-2.5 wr-line">
        <div
          class="wr-app-well flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 wr-line-soft"
        >
          <Search class="h-3.5 w-3.5 shrink-0 wr-t3" />
          <span class="truncate text-[12px] wr-t3">{{ searchHint }}</span>
        </div>
        <span class="relative shrink-0">
          <Bell class="h-4 w-4 wr-t2" />
          <span
            class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full"
            style="background: hsl(var(--wr-lp-brand))"
          />
        </span>
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[.06] text-[10px] font-bold wr-t1 dark:bg-white/10"
          >{{ DEMO_VIEWER.initials }}</span
        >
      </header>

      <div class="min-h-0 flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>
