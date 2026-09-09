<script setup lang="ts">
// Overlapping avatar stack (assignee modal footer, plan-review cards) built
// on the existing AiAvatar -- no generic AvatarStack existed anywhere yet.
import AiAvatar from "@/components/ai/AiAvatar.vue";

const props = withDefaults(
  defineProps<{
    people: { id: string; name: string }[];
    max?: number;
  }>(),
  { max: 3 }
);

const visible = () => props.people.slice(0, props.max);
const overflowCount = () => Math.max(0, props.people.length - props.max);
</script>

<template>
  <div class="flex items-center">
    <span
      v-for="(person, index) in visible()"
      :key="person.id"
      class="rounded-full ring-2 ring-white"
      :style="{ marginLeft: index === 0 ? 0 : '-8px' }"
    >
      <AiAvatar :name="person.name" :seed="person.id" />
    </span>
    <span
      v-if="overflowCount() > 0"
      class="flex h-6 w-6 items-center justify-center rounded-full bg-page text-[10px] font-semibold text-subtle ring-2 ring-white"
      style="margin-left: -8px"
    >
      +{{ overflowCount() }}
    </span>
  </div>
</template>
