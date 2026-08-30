<script setup lang="ts">
import { ArrowRight, LayoutDashboard } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const start = () => {
  // Signup silently authenticates the account to run the wizard -- clear
  // that session here so the user has to actually log in with the
  // credentials they just set, rather than landing straight in the
  // dashboard (see A1: the success page must hand off to login, not skip it).
  authStore.logout();
  router.push({ path: "/auth/login" });
};
</script>

<template>
  <div class="w-full lg:w-2/3 xl:w-3/4 px-6 sm:p-8 md:px-12 flex flex-col items-center justify-center gap-6 bg-white rounded-2xl text-center">
    <div class="flex h-40 w-40 items-center justify-center rounded-3xl bg-page">
      <LayoutDashboard class="h-16 w-16 text-primary" />
    </div>
    <p class="text-lg font-semibold text-ink">You are successfully registered!</p>
    <Button class="bg-primary text-white rounded-xl px-6 py-2 text-sm font-semibold" @click="start">
      Let's Start <ArrowRight class="ml-1 h-4 w-4" />
    </Button>
  </div>
</template>
