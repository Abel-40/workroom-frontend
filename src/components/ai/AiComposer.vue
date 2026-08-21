<script setup lang="ts">
// The AI Plan Creator's main input -- a modern "AI app" composer rather than
// a plain textarea: shows the selected project as a removable chip (picked
// via @mention, spec §3 -- no separate dropdown), mentioned members as
// removable chips, and a generate action with a real loading state.
import { X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import AiAvatar from "@/components/ai/AiAvatar.vue";
import MentionTextarea, { type MentionItem } from "@/components/ai/MentionTextarea.vue";

defineProps<{
  modelValue: string;
  placeholder: string;
  projectItems: MentionItem[];
  memberItems: MentionItem[];
  membersEnabled: boolean;
  selectedProject: { id: string; title: string; icon: string } | null;
  mentionedMembers: { id: string; name: string }[];
  generating: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "mention-project", item: MentionItem): void;
  (e: "mention-member", item: MentionItem): void;
  (e: "remove-project"): void;
  (e: "remove-member", id: string): void;
  (e: "generate"): void;
}>();
</script>

<template>
  <div
    class="rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_16px_rgba(16,24,40,0.06)] transition focus-within:border-primary/40"
  >
    <div v-if="selectedProject || mentionedMembers.length" class="mb-2 flex flex-wrap items-center gap-1.5">
      <span
        v-if="selectedProject"
        class="flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-1 pr-2 text-xs font-medium text-primary"
      >
        <span class="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px]">{{ selectedProject.icon || "📁" }}</span>
        {{ selectedProject.title }}
        <button type="button" class="ml-0.5 rounded-full p-0.5 hover:bg-primary/20" @click="emit('remove-project')">
          <X class="h-3 w-3" />
        </button>
      </span>
      <span
        v-for="member in mentionedMembers"
        :key="member.id"
        class="flex items-center gap-1.5 rounded-full bg-page py-1 pl-1 pr-2 text-xs font-medium text-ink"
      >
        <AiAvatar :name="member.name" :seed="member.id" />
        {{ member.name }}
        <button type="button" class="ml-0.5 rounded-full p-0.5 hover:bg-gray-200" @click="emit('remove-member', member.id)">
          <X class="h-3 w-3" />
        </button>
      </span>
    </div>

    <MentionTextarea
      :model-value="modelValue"
      bare
      :rows="5"
      :placeholder="placeholder"
      :project-items="projectItems"
      :member-items="memberItems"
      :members-enabled="membersEnabled"
      @update:model-value="emit('update:modelValue', $event)"
      @mention-project="emit('mention-project', $event)"
      @mention-member="emit('mention-member', $event)"
    />

    <div class="mt-2 flex items-center justify-between border-t border-gray-50 pt-2.5">
      <p class="text-[11px] text-subtle">
        <span class="font-mono">@</span> a project · <span class="font-mono">@@</span> a teammate
      </p>
      <Button size="sm" class="rounded-lg" :disabled="disabled || generating" @click="emit('generate')">
        <span v-if="generating" class="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        {{ generating ? "Generating…" : "Generate Plan" }}
      </Button>
    </div>
  </div>
</template>
