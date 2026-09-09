<script setup lang="ts">
/**
 * The problem, stated once, in type. Deliberately the only section on the
 * page with no product UI and no containers -- it exists to give the
 * walkthrough that follows something to resolve.
 */
</script>

<template>
  <section class="border-t wr-line">
    <div class="mx-auto max-w-[1560px] px-5 py-20 lg:px-10 lg:py-28">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <p class="text-[11px] font-semibold uppercase tracking-[.16em] wr-t3 lg:pt-3">
          Why teams move
        </p>

        <div>
          <h2
            class="text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold leading-[1.14] tracking-[-0.02em] wr-t1"
            style="text-wrap: balance"
          >
            The work is in one place. Everything you need to
            <em class="not-italic" style="color: hsl(var(--wr-lp-brand))">run</em> it is in five others.
          </h2>

          <p class="mt-6 max-w-2xl text-[16px] leading-relaxed wr-t2">
            The plan lives in a doc. The tasks live in a tracker. Who's overloaded
            lives in someone's head. Progress lives in a status meeting. Each tool is
            fine on its own — but nobody can answer
            <span class="font-semibold wr-t1">"are we going to make it, and who's stuck?"</span>
            without opening all of them.
          </p>

          <p class="mt-6 max-w-2xl text-[16px] leading-relaxed wr-t2">
            Workroom keeps projects, tasks, departments, people, capacity and AI
            planning on one set of records — so that question has one answer.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
