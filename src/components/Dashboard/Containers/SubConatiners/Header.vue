<script setup lang="ts">
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
} from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
</script>

<template>
          <!-- Header -->
          
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
          >
            <!-- Search Bar -->
            <div class="w-full md:w-1/2 max-w-md">
              <Input
                id="search"
                type="text"
                placeholder="Search..."
                class="pl-10 bg-white h-12 shadow-sm"
              />
            </div>

            <!-- User Controls -->
            <div class="flex items-center gap-3">
              <Button variant="ghost" size="icon" class="bg-white shadow-sm">
                <Bell class="w-5 h-5" />
              </Button>
              <div
                class="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm"
              >
                <img
                  src="https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="User avatar"
                  class="w-8 h-8 rounded-full"
                />
                <span class="text-sm">Abel</span>
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>
</template>