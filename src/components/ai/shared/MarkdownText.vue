<script setup lang="ts">
// Renders raw AI-response text (markdown-ish: headings, bold/italic lead-ins,
// -/*/N. lists) as actual structure instead of showing literal ** and #
// characters -- used wherever an AI answer/summary is displayed live, before
// (or instead of) being saved as a structured Info Portal page. See
// src/lib/markdown.ts for the shared parsing/formatting used here and by
// InfoPortalView.vue's inline rendering of already-saved blocks.
import { computed } from "vue";
import { renderInlineMarkdown, splitMarkdownBlocks } from "@/lib/markdown";

const props = defineProps<{ text: string }>();

const blocks = computed(() => splitMarkdownBlocks(props.text));
</script>

<template>
  <div class="space-y-2">
    <template v-for="(block, i) in blocks" :key="i">
      <h4 v-if="block.type === 'heading'" class="font-semibold text-ink">{{ block.text }}</h4>
      <p v-else-if="block.type === 'paragraph'" class="whitespace-pre-line" v-html="renderInlineMarkdown(block.text || '')" />
      <ul v-else-if="block.type === 'list'" class="list-disc space-y-1 pl-5">
        <li v-for="(item, j) in block.items" :key="j" v-html="renderInlineMarkdown(item)" />
      </ul>
    </template>
  </div>
</template>
