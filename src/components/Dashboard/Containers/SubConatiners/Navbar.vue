<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { usePlansStore } from "@/stores/plansStore";
import {
  Bell,
  MessageCircle,
  ChevronDown,
  Menu,
  WorkflowIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import router from "@/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const props = defineProps<{ isCollapsed: boolean }>();

const notificationCount = ref(3);
const navItems = [
  { name: "Home", route: "/" },
  { name: "Projects", route: "/?section=projects" },
  { name: "Users", route: "/?section=users" },
  { name: "Department", route: "/?section=departments" },
  { name: "Performance", route: "/?section=performance" },
];
const plansStore = usePlansStore()
const authStore = useAuthStore();
const logout = () => {
  if (authStore.logedInUserInfo.is_authenticated) {
    authStore.logout();
    router.push("/auth/login/");
  }
};

const isPremium = ref(false); // Will be set based on plan
const showPremiumBar = ref(true);
const isSticky = ref(true);

function handleScroll() {
  showPremiumBar.value = window.scrollY < 40;
  // isSticky.value = window.scrollY < window.innerHeight;
}

onMounted(async () => {
  window.addEventListener("scroll", handleScroll);
  // Fetch user plan info
  const planResponse = await plansStore.getUserCompanyPlan();
  if (planResponse.success && planResponse.data && planResponse.data.plan) {
    isPremium.value = planResponse.data.plan !== "free";
  } else {
    isPremium.value = false; // fallback: show Go Premium if error
  }
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

defineEmits(["toggle-sidebar"]);
const showNav = ref(false);

const goToPremium = () => {
  router.push({
    path: "/plans/",
  });
  console.log("check");
};
</script>

<template>
  <div
    class="w-full flex flex-col items-center bg-white"
    :class="[
      isSticky ? 'fixed z-50 transition-all duration-300' : 'relative z-30',
    ]"
  >
    <!-- Go Premium -->
    <transition name="fade">
      <div
        v-if="!isPremium && showPremiumBar"
        class="w-full bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 font-semibold text-center py-2 text-xs shadow-md"
        @click="goToPremium()"
      >
        <Button
          variant="link"
          class="underline hover:text-yellow-800 transition-colors text-xs py-0 h-auto"
        >
          Go Premium
        </Button>
      </div>
    </transition>

    <!-- Navbar -->
    <nav
      class="w-full bg-white border-b border-gray-200 shadow-lg shadow-blue-100/40 backdrop-blur-sm"
    >
      <div
        class="relative flex items-center justify-between px-4 py-2 md:px-8 h-20"
      >
        <!-- Blur Background -->
        <div
          class="absolute inset-0 opacity-20 pointer-events-none overflow-hidden z-0"
        >
          <div
            class="absolute right-0 w-1/2 md:w-1/2 h-9 md:h-9 bg-blue-400 blur-xl rounded-full"
          ></div>
          <div
            class="absolute left-0 w-1/2 md:w-1/2 h-9 md:h-9 bg-purple-400 blur-xl rounded-full"
          ></div>
        </div>

        <!-- Branding & Mobile Toggle -->
        <span class="flex gap-2 text-xl font-bold text-blue-600 z-10">
          <WorkflowIcon class="w-6 h-6 text-blue-600" />
          Workroom
        </span>
        <button
          @click="showNav = !showNav"
          class="md:hidden text-blue-600 focus:outline-none z-10"
        >
          <Menu class="w-6 h-6" />
        </button>

        <!-- Nav Items -->
        <div
          class="absolute top-full left-0 bg-white flex flex-col items-center gap-2 py-2 w-48 md:static md:flex md:flex-row md:gap-6 md:w-auto md:bg-transparent md:py-0 h-screen"
          :class="{ hidden: !showNav, flex: showNav }"
        >
          <a
            v-for="item in navItems"
            :key="item.name"
            :href="item.route"
            class="text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600 px-2 py-1 rounded-md transition-all duration-200 hover:bg-blue-50"
          >
            {{ item.name }}
          </a>
        </div>

        <!-- Right Icons -->
        <div class="relative hidden md:flex items-center gap-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            class="bg-white shadow-sm relative hover:bg-blue-50 transition-all"
          >
            <Bell class="w-5 h-5 text-gray-700" />
            <span
              v-if="notificationCount > 0"
              class="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center"
            >
              {{ notificationCount }}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="bg-white shadow-sm hover:bg-blue-50 transition-all"
          >
            <MessageCircle class="w-5 h-5 text-gray-700" />
          </Button>

          <!-- User Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger class="focus:outline-none">
              <div
                class="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition-all"
              >
                <Avatar class="h-6 w-6">
                  <AvatarImage
                    src="https://randomuser.me/api/portraits/men/34.jpg"
                    alt="User avatar"
                  />
                  <AvatarFallback>AA</AvatarFallback>
                </Avatar>
                <span class="text-sm text-gray-700 font-medium">Abel</span>
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40 mt-2 shadow-lg shadow-blue-100/60">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem @click="logout()">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
    <!-- Gray overlay when mobile nav is open -->
<div
  v-if="showNav"
  class="fixed left-48 right-0 top-28 bottom-0 bg-black/40 z-10 md:hidden"
  @click="showNav = false"
/>


  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
