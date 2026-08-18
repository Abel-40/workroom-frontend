<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  AtSign,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Link2,
  MoreVertical,
  Paperclip,
  Pin,
  Plus,
  Search,
  Send,
  Smile,
  Users,
} from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "./SubContainers/Header.vue";
import { useMessengerStore } from "@/stores/messengerStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const messengerStore = useMessengerStore();
const employeeStore = useEmployeeStore();

const draft = ref("");
const showMentions = ref(false);
const mentionQuery = ref("");
const threadEnd = ref<HTMLElement | null>(null);

const detailSections = ref({ info: true, members: true, media: false, files: false, links: false });

const initials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
};

const mentionMatches = computed(() => {
  const q = mentionQuery.value.toLowerCase();
  return employeeStore.employees.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 5);
});

const onDraftInput = () => {
  const lastAt = draft.value.lastIndexOf("@");
  if (lastAt >= 0 && (lastAt === 0 || draft.value[lastAt - 1] === " ")) {
    mentionQuery.value = draft.value.slice(lastAt + 1);
    showMentions.value = true;
  } else {
    showMentions.value = false;
  }
};

const pickMention = (name: string) => {
  const lastAt = draft.value.lastIndexOf("@");
  draft.value = draft.value.slice(0, lastAt) + `@${name} `;
  showMentions.value = false;
};

const send = () => {
  if (!messengerStore.selected || !draft.value.trim()) return;
  messengerStore.sendMessage(messengerStore.selected.id, draft.value.trim());
  draft.value = "";
  showMentions.value = false;
  nextTick(() => threadEnd.value?.scrollIntoView({ behavior: "smooth" }));
};

watch(
  () => messengerStore.selected?.messages.length,
  () => nextTick(() => threadEnd.value?.scrollIntoView())
);
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <h1 class="text-xl font-semibold">Messenger</h1>
    </div>

    <div class="flex h-[640px] gap-4 rounded-2xl border border-gray-100 bg-white">
      <!-- Conversations -->
      <div class="flex w-72 shrink-0 flex-col border-r border-gray-100">
        <div class="flex items-center justify-between border-b border-gray-100 p-4">
          <p class="font-semibold text-ink">Conversations</p>
          <div class="flex items-center gap-2">
            <button type="button" class="text-subtle hover:text-ink"><Search class="h-4 w-4" /></button>
            <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
              <Plus class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <p class="px-4 pt-3 pb-1 text-xs font-medium uppercase text-subtle">Groups</p>
          <button
            v-for="conv in messengerStore.groups"
            :key="conv.id"
            type="button"
            class="flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left"
            :class="messengerStore.selectedConversationId === conv.id ? 'border-primary bg-blue-50/60' : 'border-transparent hover:bg-page/50'"
            @click="messengerStore.select(conv.id)"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-page text-lg">{{ conv.icon }}</span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between">
                <span class="truncate text-sm font-medium text-ink">{{ conv.name }}</span>
                <span class="shrink-0 text-[10px] text-subtle">{{ formatTime(conv.messages.at(-1)?.timestamp || "") }}</span>
              </span>
              <span class="flex items-center justify-between">
                <span class="truncate text-xs text-subtle">{{ conv.messages.at(-1)?.text || conv.messages.at(-1)?.linkedTask || "" }}</span>
                <span v-if="conv.unreadCount" class="ml-1 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {{ conv.unreadCount }}
                </span>
              </span>
            </span>
          </button>

          <p class="px-4 pt-3 pb-1 text-xs font-medium uppercase text-subtle">Direct Messages</p>
          <button
            v-for="conv in messengerStore.directMessages"
            :key="conv.id"
            type="button"
            class="flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left"
            :class="messengerStore.selectedConversationId === conv.id ? 'border-primary bg-blue-50/60' : 'border-transparent hover:bg-page/50'"
            @click="messengerStore.select(conv.id)"
          >
            <Avatar size="sm" class="h-9 w-9 shrink-0 text-xs">
              <AvatarFallback>{{ initials(conv.name) }}</AvatarFallback>
            </Avatar>
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between">
                <span class="truncate text-sm font-medium text-ink">{{ conv.name }}</span>
                <span class="shrink-0 text-[10px] text-subtle">{{ formatTime(conv.messages.at(-1)?.timestamp || "") }}</span>
              </span>
              <span class="truncate text-xs text-subtle">{{ conv.messages.at(-1)?.text || "" }}</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Thread -->
      <div v-if="messengerStore.selected" class="flex flex-1 flex-col">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div class="flex items-center gap-3">
            <span v-if="messengerStore.selected.type === 'group'" class="flex h-9 w-9 items-center justify-center rounded-full bg-page text-lg">
              {{ messengerStore.selected.icon }}
            </span>
            <Avatar v-else size="sm" class="h-9 w-9 text-xs">
              <AvatarFallback>{{ initials(messengerStore.selected.name) }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="font-medium text-ink">{{ messengerStore.selected.name }}</p>
              <p class="text-xs text-subtle">
                {{ messengerStore.selected.type === "group" ? `${messengerStore.selected.memberNames.length} members` : messengerStore.selected.role }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-subtle">
            <Search class="h-4 w-4" />
            <Pin class="h-4 w-4" />
            <MoreVertical class="h-4 w-4" />
          </div>
        </div>

        <div class="flex-1 space-y-4 overflow-y-auto p-4">
          <div v-for="message in messengerStore.selected.messages" :key="message.id" class="flex gap-3" :class="message.isMe ? 'flex-row-reverse' : ''">
            <Avatar size="sm" class="h-8 w-8 shrink-0 text-xs">
              <AvatarFallback>{{ initials(message.senderName) }}</AvatarFallback>
            </Avatar>
            <div class="max-w-[65%]" :class="message.isMe ? 'text-right' : ''">
              <p class="text-xs text-subtle">
                <span class="font-medium text-ink">{{ message.senderName }}</span> {{ formatTime(message.timestamp) }}
              </p>
              <p v-if="message.text" class="mt-1 whitespace-pre-line rounded-2xl px-3 py-2 text-sm" :class="message.isMe ? 'bg-primary text-white' : 'bg-page text-ink'">
                {{ message.text }}
              </p>
              <p v-if="message.linkedTask" class="mt-1 inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-700">
                <Link2 class="h-3.5 w-3.5" /> {{ message.linkedTask }}
              </p>
            </div>
          </div>
          <div ref="threadEnd" />
        </div>

        <div class="relative border-t border-gray-100 p-3">
          <div v-if="showMentions && mentionMatches.length" class="absolute bottom-full left-3 mb-2 w-56 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
            <button
              v-for="emp in mentionMatches"
              :key="emp.id"
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-page"
              @click="pickMention(emp.name)"
            >
              <Avatar size="sm" class="h-6 w-6 text-[10px]"><AvatarFallback>{{ initials(emp.name) }}</AvatarFallback></Avatar>
              {{ emp.name }}
            </button>
          </div>
          <div class="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Paperclip class="h-4 w-4 shrink-0 text-subtle" />
            <Link2 class="h-4 w-4 shrink-0 text-subtle" />
            <AtSign class="h-4 w-4 shrink-0 text-subtle" />
            <input
              v-model="draft"
              type="text"
              placeholder="Type your message here..."
              class="flex-1 bg-transparent text-sm outline-none"
              @input="onDraftInput"
              @keydown.enter="send"
            />
            <Smile class="h-4 w-4 shrink-0 text-subtle" />
            <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white" @click="send">
              <Send class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div v-if="messengerStore.selected?.type === 'group'" class="w-64 shrink-0 border-l border-gray-100 p-4">
        <div class="flex flex-col items-center text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-full bg-page text-2xl">{{ messengerStore.selected.icon }}</span>
          <p class="mt-2 font-medium text-ink">{{ messengerStore.selected.name }}</p>
          <div class="mt-2 flex gap-3 text-subtle">
            <Search class="h-4 w-4" />
            <Users class="h-4 w-4" />
            <MoreVertical class="h-4 w-4" />
          </div>
        </div>

        <div class="mt-4 space-y-1 text-sm">
          <button type="button" class="flex w-full items-center justify-between py-2 font-medium text-ink" @click="detailSections.members = !detailSections.members">
            Members <ChevronDown class="h-4 w-4 transition" :class="detailSections.members ? 'rotate-180' : ''" />
          </button>
          <ul v-if="detailSections.members" class="space-y-2 pb-2">
            <li v-for="name in messengerStore.selected.memberNames" :key="name" class="flex items-center gap-2">
              <Avatar size="sm" class="h-6 w-6 text-[10px]"><AvatarFallback>{{ initials(name) }}</AvatarFallback></Avatar>
              <span class="text-ink">{{ name }}</span>
            </li>
          </ul>

          <button type="button" class="flex w-full items-center justify-between border-t border-gray-100 py-2 font-medium text-ink" @click="detailSections.media = !detailSections.media">
            <span class="flex items-center gap-2"><ImageIcon class="h-4 w-4" /> Media</span>
            <ChevronDown class="h-4 w-4 transition" :class="detailSections.media ? 'rotate-180' : ''" />
          </button>
          <p v-if="detailSections.media" class="pb-2 text-xs text-subtle">No shared media yet.</p>

          <button type="button" class="flex w-full items-center justify-between border-t border-gray-100 py-2 font-medium text-ink" @click="detailSections.files = !detailSections.files">
            <span class="flex items-center gap-2"><FileText class="h-4 w-4" /> Files</span>
            <ChevronDown class="h-4 w-4 transition" :class="detailSections.files ? 'rotate-180' : ''" />
          </button>
          <p v-if="detailSections.files" class="pb-2 text-xs text-subtle">No shared files yet.</p>

          <button type="button" class="flex w-full items-center justify-between border-t border-gray-100 py-2 font-medium text-ink" @click="detailSections.links = !detailSections.links">
            <span class="flex items-center gap-2"><Link2 class="h-4 w-4" /> Links</span>
            <ChevronDown class="h-4 w-4 transition" :class="detailSections.links ? 'rotate-180' : ''" />
          </button>
          <p v-if="detailSections.links" class="pb-2 text-xs text-subtle">No shared links yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
