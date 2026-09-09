import { defineStore } from "pinia";

export interface ChatMessage {
  id: string;
  senderName: string;
  isMe: boolean;
  text?: string;
  linkedTask?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  type: "group" | "dm";
  name: string;
  icon: string;
  role?: string;
  online?: boolean;
  memberNames: string[];
  unreadCount: number;
  messages: ChatMessage[];
}

const baseMessages = (): ChatMessage[] => [
  { id: "m1", senderName: "Olive Dixon", isMe: false, text: "Hi, Evan! Nice to meet you too\nI will send you all the files I have for this project. After that, we can call and discuss. I will answer all your questions! OK?", timestamp: "2025-09-08T00:04:00" },
  { id: "m2", senderName: "You", isMe: true, text: "Hi, Oscar! Nice to meet you\nWe will work with new project together", timestamp: "2025-09-08T00:15:00" },
  { id: "m3", senderName: "Olive Dixon", isMe: false, text: "Hi! Please, change the status in this task", timestamp: "2025-09-08T00:04:00" },
  { id: "m4", senderName: "Olive Dixon", isMe: false, linkedTask: "UX Login + Registration", timestamp: "2025-09-08T00:04:00" },
  { id: "m5", senderName: "You", isMe: true, text: "Hi, Oscar! Nice to meet you\nWe will work with new project together", timestamp: "2025-09-08T00:15:00" },
  { id: "m6", senderName: "Olive Dixon", isMe: false, text: "Ok", timestamp: "2025-09-08T00:04:00" },
];

export const useMessengerStore = defineStore("messengerStore", {
  state: () => ({
    selectedConversationId: "conv-medical" as string | null,
    conversations: [
      {
        id: "conv-medical",
        type: "group",
        name: "Medical App Team",
        icon: "🩺",
        memberNames: ["Evan Yates", "Blake Silva", "Olive Dixon", "Ellen Wong", "Lily Bradley", "Gerald Ingram"],
        unreadCount: 12,
        messages: baseMessages(),
      },
      {
        id: "conv-food",
        type: "group",
        name: "Food Delivery Service",
        icon: "🍔",
        memberNames: ["Evan Yates", "Olive Dixon"],
        unreadCount: 1,
        messages: [{ id: "m1", senderName: "Olive", isMe: false, text: "Hi guys! I've shared you the files.", timestamp: "2025-09-08T00:04:00" }],
      },
      {
        id: "conv-garrett",
        type: "dm",
        name: "Garrett Watson",
        icon: "",
        role: "Backend Engineer",
        online: false,
        memberNames: ["Garrett Watson"],
        unreadCount: 0,
        messages: [{ id: "m1", senderName: "Garrett Watson", isMe: false, text: "Hi! Please, change the status in this task", timestamp: "2025-09-08T00:04:00" }],
      },
      {
        id: "conv-caroline",
        type: "dm",
        name: "Caroline Santos",
        icon: "",
        role: "QA Engineer",
        online: true,
        memberNames: ["Caroline Santos"],
        unreadCount: 0,
        messages: [{ id: "m1", senderName: "Caroline Santos", isMe: false, text: "Hi! Please, change the status in this task", timestamp: "2025-09-08T00:04:00" }],
      },
      {
        id: "conv-leon",
        type: "dm",
        name: "Leon Nunez",
        icon: "",
        role: "iOS Developer",
        online: false,
        memberNames: ["Leon Nunez"],
        unreadCount: 0,
        messages: [{ id: "m1", senderName: "Leon Nunez", isMe: false, text: "Hi! Please, change the status in this task", timestamp: "2025-09-08T00:04:00" }],
      },
      {
        id: "conv-oscar",
        type: "dm",
        name: "Oscar Holloway",
        icon: "",
        role: "UI/UX Designer",
        online: true,
        memberNames: ["Oscar Holloway"],
        unreadCount: 0,
        messages: baseMessages(),
      },
      {
        id: "conv-ralph",
        type: "dm",
        name: "Ralph Harris",
        icon: "",
        role: "Copywriter",
        online: false,
        memberNames: ["Ralph Harris"],
        unreadCount: 0,
        messages: [{ id: "m1", senderName: "Ralph Harris", isMe: false, text: "Hi! Please, change the status in this task", timestamp: "2025-09-08T00:04:00" }],
      },
    ] as Conversation[],
  }),
  getters: {
    groups: (state) => state.conversations.filter((c) => c.type === "group"),
    directMessages: (state) => state.conversations.filter((c) => c.type === "dm"),
    selected(state) {
      return state.conversations.find((c) => c.id === state.selectedConversationId) ?? null;
    },
  },
  actions: {
    select(id: string) {
      this.selectedConversationId = id;
      const conv = this.conversations.find((c) => c.id === id);
      if (conv) conv.unreadCount = 0;
    },
    sendMessage(conversationId: string, text: string) {
      const conv = this.conversations.find((c) => c.id === conversationId);
      if (!conv || !text.trim()) return;
      conv.messages.push({
        id: `m-${Date.now()}`,
        senderName: "You",
        isMe: true,
        text,
        timestamp: new Date().toISOString(),
      });
    },
  },
  persist: {
    key: "pinia-messengerStore",
    storage: localStorage,
  },
});
