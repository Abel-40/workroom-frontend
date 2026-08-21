<script setup lang="ts">
// A plain textarea with @project and @@member mention autocomplete.
// Deliberately plain-text-with-bracket-notation ("@[Name] ") rather than a
// true contenteditable rich-mention editor -- the resolved id is emitted
// alongside the pick, so callers never need to re-parse the text to know
// what was mentioned.
import { computed, nextTick, ref } from "vue";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

export interface MentionItem {
  id: string;
  label: string;
  sublabel?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    rows?: number;
    projectItems?: MentionItem[];
    memberItems?: MentionItem[];
    membersEnabled?: boolean;
  }>(),
  { placeholder: "", rows: 4, projectItems: () => [], memberItems: () => [], membersEnabled: false }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "mention-project", item: MentionItem): void;
  (e: "mention-member", item: MentionItem): void;
}>();

const textareaEl = ref<HTMLTextAreaElement | null>(null);
const mentionMode = ref<"project" | "member" | null>(null);
const mentionQuery = ref("");
const mentionStart = ref(0);

const mentionResults = computed<MentionItem[]>(() => {
  const query = mentionQuery.value.toLowerCase();
  const source = mentionMode.value === "member" ? props.memberItems : props.projectItems;
  return source.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 6);
});

function detectMention() {
  const el = textareaEl.value;
  if (!el) return;
  const cursor = el.selectionStart ?? 0;
  const textBeforeCursor = props.modelValue.slice(0, cursor);
  const match = /(@{1,2})([^\s@]*)$/.exec(textBeforeCursor);
  if (!match) {
    mentionMode.value = null;
    return;
  }
  const [full, at, query] = match;
  if (at === "@@" && !props.membersEnabled) {
    mentionMode.value = null;
    return;
  }
  mentionMode.value = at === "@@" ? "member" : "project";
  mentionQuery.value = query;
  mentionStart.value = cursor - full.length;
}

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
  nextTick(detectMention);
}

function pick(item: MentionItem) {
  const el = textareaEl.value;
  if (!el) return;
  const cursor = el.selectionStart ?? props.modelValue.length;
  const prefix = mentionMode.value === "member" ? "@@" : "@";
  const before = props.modelValue.slice(0, mentionStart.value);
  const after = props.modelValue.slice(cursor);
  const inserted = `${prefix}[${item.label}] `;
  emit("update:modelValue", `${before}${inserted}${after}`);
  if (mentionMode.value === "member") emit("mention-member", item);
  else emit("mention-project", item);
  mentionMode.value = null;
  nextTick(() => {
    const newCursor = before.length + inserted.length;
    el.focus();
    el.setSelectionRange(newCursor, newCursor);
  });
}

function onBlur() {
  window.setTimeout(() => {
    mentionMode.value = null;
  }, 150);
}
</script>

<template>
  <Popover :open="!!mentionMode && mentionResults.length > 0">
    <PopoverAnchor as-child>
      <textarea
        ref="textareaEl"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        class="flex w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-subtle focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        @input="onInput"
        @keyup="detectMention"
        @click="detectMention"
        @blur="onBlur"
      />
    </PopoverAnchor>
    <PopoverContent class="w-64 p-1" align="start" :avoid-collisions="true" @open-auto-focus.prevent>
      <p v-if="mentionResults.length === 0" class="px-2 py-1.5 text-xs text-subtle">No matches</p>
      <button
        v-for="item in mentionResults"
        :key="item.id"
        type="button"
        class="flex w-full flex-col items-start rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-page"
        @mousedown.prevent="pick(item)"
      >
        <span class="font-medium text-ink">{{ item.label }}</span>
        <span v-if="item.sublabel" class="text-xs text-subtle">{{ item.sublabel }}</span>
      </button>
    </PopoverContent>
  </Popover>
</template>
