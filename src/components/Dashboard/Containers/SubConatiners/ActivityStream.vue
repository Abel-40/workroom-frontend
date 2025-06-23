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
      <div class="w-full lg:w-1/3 bg-white p-4 rounded-xl shadow-sm">
            <h2 class="font-semibold mb-4">Activity Stream</h2>

            <div class="space-y-6">
              <!-- Activity 1 -->
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/men/5.jpg"
                    alt="User"
                    class="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 class="font-medium">Oscar Holloway</h4>
                    <p class="text-sm text-[#91929E]">UMAX Designer</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    class="flex items-center gap-2 bg-[#F4F9FD] p-3 rounded-lg"
                  >
                    <CloudUpload class="w-5 h-5 text-[#3F8CFF]" />
                    <p class="text-sm">
                      Updated the status of Mind Map task to In Progress
                    </p>
                  </div>
                  <div
                    class="flex items-center gap-2 bg-[#F4F9FD] p-3 rounded-lg"
                  >
                    <Paperclip class="w-5 h-5 text-purple-500" />
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
                    class="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 class="font-medium">Emily Tyler</h4>
                    <p class="text-sm text-[#91929E]">Copywriter</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    class="flex items-center gap-2 bg-[#F4F9FD] p-3 rounded-lg"
                  >
                    <CloudUpload class="w-5 h-5 text-[#3F8CFF]" />
                    <p class="text-sm">
                      Updated the status of Mind Map task to In Progress
                    </p>
                  </div>

                  <Button
                    variant="link"
                    class="text-sm p-0 flex items-center gap-1"
                  >
                    View more <ChevronDown class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
  </div>
</template>