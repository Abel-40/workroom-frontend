<script setup lang="ts">
/**
 * The payoff after the walkthrough: the seven screens are one data model, not
 * seven features. Drawn as a relationship diagram rather than a feature grid,
 * because the claim being made is specifically about how the records connect.
 */
const rows = [
  { from: "Company", to: "Departments", note: "Members belong to one department and carry a role" },
  { from: "Departments", to: "Projects", note: "Every project has an owning department and a visibility rule" },
  { from: "Projects", to: "Tasks", note: "Tasks carry status, priority, type, effort and an assignee" },
  { from: "Tasks", to: "Workload", note: "Capacity is derived from assigned work, not self-reported" },
  { from: "Projects", to: "AI plans", note: "A generated plan becomes real tasks only once you approve it" },
];
</script>

<template>
  <section id="connected" class="border-t wr-line">
    <div class="mx-auto max-w-[1560px] px-5 py-20 lg:px-10 lg:py-28">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div class="lg:sticky lg:top-28 lg:self-start">
          <p class="text-[11px] font-semibold uppercase tracking-[.16em]" style="color: hsl(var(--wr-lp-brand))">
            How it fits together
          </p>
          <h2
            class="mt-3 text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.02em] wr-t1"
            style="text-wrap: balance"
          >
            Not seven features. One set of records.
          </h2>
          <p class="mt-5 max-w-md text-[15.5px] leading-relaxed wr-t2">
            Each screen you just scrolled through reads and writes the same data. That's
            why capacity is trustworthy and why AI planning produces work your team can
            actually be assigned.
          </p>
        </div>

        <!-- Relationship list: the arrow is the content, so it gets no box -->
        <ol class="flex flex-col">
          <li
            v-for="(r, i) in rows"
            :key="r.from + r.to"
            class="grid grid-cols-[auto_1fr] gap-x-4 border-t py-5 wr-line first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,auto)_1fr]"
          >
            <span class="pt-0.5 text-[10.5px] tabular-nums wr-t3">{{ String(i + 1).padStart(2, "0") }}</span>
            <div>
              <p class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span class="text-[16px] font-semibold wr-t1">{{ r.from }}</span>
                <span class="text-[14px]" style="color: hsl(var(--wr-lp-brand))">→</span>
                <span class="text-[16px] font-semibold wr-t1">{{ r.to }}</span>
              </p>
              <p class="mt-1.5 text-[14px] leading-relaxed wr-t2">{{ r.note }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
