<script setup lang="ts">
// Shared confirmation modal for destructive delete/remove actions -- replaces
// window.confirm() and unconfirmed delete buttons across the app so every
// delete goes through the same "are you sure" step before it fires.
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Trash2 } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
  }>(),
  {
    title: "Delete this item?",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    loading: false,
  }
);

const emit = defineEmits<{
  (e: "confirm"): void;
}>();

const open = defineModel<boolean>("open", { required: true });

function cancel() {
  open.value = false;
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => { if (!loading) open = v; }">
    <DialogContent class="max-w-sm gap-0 rounded-3xl p-0">
      <div class="flex flex-col gap-4 p-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <Trash2 class="h-5 w-5" color="red"/>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-base font-semibold text-ink">{{ title }}</span>
          <span class="text-sm text-subtle">{{ description }}</span>
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-border px-4 py-2.5 text-sm text-subtle disabled:opacity-50"
            :disabled="loading"
            @click="cancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-danger-foreground disabled:opacity-50"
            :disabled="loading"
            @click="emit('confirm')"
          >
            {{ loading ? "Deleting…" : confirmLabel }}
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
