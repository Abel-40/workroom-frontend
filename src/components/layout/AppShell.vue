<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Header from "./Header.vue";
</script>

<template>
  <!-- The shell owns the viewport; the only thing that scrolls is the content
       region below. That's what keeps the sidebar and header put on every
       page -- they're siblings of the scroll container, not inside it, so no
       per-page sticky/fixed positioning is involved (and can't be defeated by
       a page's own wrapper markup). -->
  <div class="wr-shell h-screen w-full overflow-hidden">
    <div class="mx-auto flex h-full max-w-[1600px] gap-4 p-4 pb-24 md:pb-4">
      <Sidebar />
      <main class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div class="mx-auto w-full max-w-[1440px] shrink-0 px-4">
          <Header />
        </div>
        <div class="mx-auto min-h-0 w-full max-w-[1440px] flex-1 overflow-y-auto">
          <slot />
        </div>
      </main>
    </div>
    <slot name="floating" />
  </div>
</template>
