<script setup lang="ts">
import { computed, type Component } from "vue";

const props = withDefaults(
  defineProps<{
    icon?: Component;
    image?: string;
    /**
     * Only set this when the illustration carries information the surrounding
     * copy doesn't. Empty-state art almost never does -- it restates the
     * title -- so the default is `alt=""`, which keeps screen readers from
     * announcing the same sentence twice.
     */
    imageAlt?: string;
    /** Small uppercase label above the title, e.g. the section being described. */
    eyebrow?: string;
    title?: string;
    message: string;
    /**
     * "sm" (default): compact widget empty state, e.g. inside a dashboard card.
     * "lg": a page's primary content (still shares its layout with other elements).
     * "xl": a full takeover -- the illustration is the only thing on screen.
     */
    size?: "sm" | "lg" | "xl";
    /**
     * Whether to draw a surface of its own. "plain" suits slots that already
     * sit inside a card (dashboard widgets, list panels), where a second
     * border reads as a box inside a box. Defaults to "plain" at "sm" -- the
     * widget size -- and "card" at the two page-level sizes.
     */
    variant?: "card" | "plain";
  }>(),
  { size: "sm" }
);

const surface = computed(() => props.variant ?? (props.size === "sm" ? "plain" : "card"));

// The illustrations are 500x500 line art; under roughly 90px they stop
// reading as a picture and turn into noise, so even the compact size gets a
// real illustration rather than a thumbnail. The box is wider than it is tall
// so the one landscape illustration (750x500) fills it instead of
// letterboxing inside a square.
const ART_BOX = {
  sm: "h-24 w-full max-w-[190px] sm:h-28",
  lg: "h-44 w-full max-w-[330px] sm:h-56",
  xl: "h-56 w-full max-w-[420px] sm:h-72 md:h-80",
} as const;
</script>

<template>
  <div
    class="wr-empty relative flex flex-col items-center justify-center text-center"
    :class="[
      surface === 'card'
        ? 'overflow-hidden rounded-2xl border border-dashed border-border bg-gradient-to-b from-card via-card to-page/40'
        : '',
      {
        'gap-3 px-6 py-8': size === 'sm',
        'gap-4 px-6 py-12 sm:py-16': size === 'lg',
        'gap-5 px-6 py-16 sm:py-20': size === 'xl',
      },
    ]"
  >
    <!-- Illustration, lit from behind so it sits on the surface rather than
         floating on it. The glow is keyed to --primary-strong, which stays
         blue in both themes (--primary flips to near-white in dark). -->
    <div v-if="image" class="relative flex shrink-0 items-center justify-center" :class="ART_BOX[size]">
      <span
        aria-hidden="true"
        class="pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-full"
        style="background: radial-gradient(closest-side, hsl(var(--primary-strong) / 0.16), transparent 78%)"
      />
      <img
        :src="image"
        :alt="imageAlt ?? ''"
        loading="lazy"
        decoding="async"
        class="wr-empty-art pointer-events-none relative h-full w-full select-none object-contain"
      />
    </div>

    <div
      v-else-if="icon"
      class="flex shrink-0 items-center justify-center rounded-2xl bg-primary-soft ring-1 ring-inset ring-primary-strong/15"
      :class="size === 'sm' ? 'h-12 w-12' : size === 'lg' ? 'h-16 w-16' : 'h-20 w-20'"
    >
      <component :is="icon" class="text-primary-strong" :class="size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-9 w-9'" />
    </div>

    <div class="max-w-full">
      <p v-if="eyebrow" class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary-strong">
        {{ eyebrow }}
      </p>
      <p v-if="title" class="font-semibold text-ink" :class="size === 'xl' ? 'text-xl' : size === 'lg' ? 'text-lg' : 'text-[15px]'">
        {{ title }}
      </p>
      <p
        class="mx-auto text-sm leading-relaxed text-subtle"
        :class="[title || eyebrow ? 'mt-1.5' : '', size === 'xl' ? 'max-w-md text-base' : size === 'lg' ? 'max-w-sm' : 'max-w-xs']"
      >
        {{ message }}
      </p>
    </div>

    <div v-if="$slots.default" class="mt-1 flex flex-wrap items-center justify-center gap-2">
      <slot />
    </div>

    <!-- A quieter second line under the actions: a keyboard hint, a link to
         docs, why the list might be empty. -->
    <p v-if="$slots.hint" class="max-w-xs text-xs text-subtle">
      <slot name="hint" />
    </p>
  </div>
</template>

<style scoped>
.wr-empty {
  animation: wr-empty-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Two animations on one element: the entrance runs once, then the float
   takes over on a long, shallow loop so the art feels alive without ever
   pulling attention away from the action button. */
.wr-empty-art {
  animation:
    wr-empty-art-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both,
    wr-empty-float 7s ease-in-out 0.55s infinite;
}

@keyframes wr-empty-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@keyframes wr-empty-art-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
}

@keyframes wr-empty-float {
  50% {
    transform: translateY(-5px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wr-empty,
  .wr-empty-art {
    animation: none;
  }
}
</style>
