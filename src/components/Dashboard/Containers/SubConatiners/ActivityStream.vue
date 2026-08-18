<script setup lang="ts">
import {
  ChevronDown,
  CloudUpload,
  Paperclip,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
</script>

<template>
            <!-- Activity Stream -->
      <div class="w-full lg:w-1/3 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 class="font-semibold mb-4 text-[#0A1629] relative pl-3 before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-[#3F8CFF]">Activity Stream</h2>

            <div class="space-y-6">
              <!-- Activity 1 -->
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/men/5.jpg"
                    alt="User"
                    class="w-10 h-10 rounded-full ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)]"
                  />
                  <div>
                    <h4 class="font-medium text-[#0A1629]">Oscar Holloway</h4>
                    <p class="text-sm text-[#91929E]">UMAX Designer</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    class="flex items-center gap-2 bg-[#F4F9FD] p-3 rounded-lg hover:bg-[#EAF2FF] transition-colors duration-200"
                  >
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0 shadow-sm">
                      <CloudUpload class="w-4 h-4 text-[#3F8CFF]" />
                    </span>
                    <p class="text-sm">
                      Updated the status of Mind Map task to In Progress
                    </p>
                  </div>
                  <div
                    class="flex items-center gap-2 bg-[#F4F9FD] p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                  >
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0 shadow-sm">
                      <Paperclip class="w-4 h-4 text-purple-500" />
                    </span>
                    <p class="text-sm">Attached files to the task</p>
                  </div>
                </div>
              </div>

              <!-- Activity 2 -->
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/women/5.jpg"
                    alt="User"
                    class="w-10 h-10 rounded-full ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)]"
                  />
                  <div>
                    <h4 class="font-medium text-[#0A1629]">Emily Tyler</h4>
                    <p class="text-sm text-[#91929E]">Copywriter</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    class="flex items-center gap-2 bg-[#F4F9FD] p-3 rounded-lg hover:bg-[#EAF2FF] transition-colors duration-200"
                  >
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0 shadow-sm">
                      <CloudUpload class="w-4 h-4 text-[#3F8CFF]" />
                    </span>
                    <p class="text-sm">
                      Updated the status of Mind Map task to In Progress
                    </p>
                  </div>

                  <Button
                    variant="link"
                    class="text-sm p-0 flex items-center gap-1 group text-[#3F8CFF]"
                  >
                    View more <ChevronDown class="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                  </Button>
                </div>
              </div>
            </div>
  </div>
</template>