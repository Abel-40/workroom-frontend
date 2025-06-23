<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from "vue"
import StepOne from '@/views/Auth/StepOne.vue'
import StepTwo from '@/views/Auth/StepTwo.vue'
import StepThree from '@/views/Auth/StepThree.vue'
import StepFour from '@/views/Auth/StepFour.vue'
import { WorkflowIcon, ArrowRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const route = useRoute()

const stepMap:Record<string,number> = {
  step1: 1,
  step2: 2,
  step3: 3,
  step4: 4
}

const activeStep = computed(() => {
  const section = route.query.section as string
  return stepMap[section] || 1
})

const showSection = computed(() => {
  const section = route.query.section
  if (section === "step1") return StepOne
  if (section === "step2") return StepTwo
  if (section === "step3") return StepThree
  if (section === "step4") return StepFour
})
</script>


<template>
  <div class="min-h-screen bg-[#F4F9FD] flex items-center justify-center p-4 sm:p-6 w-full">
    <div class="w-full max-w-7xl rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
      <!-- Left Side - Blue Panel -->
      <div class="w-full lg:w-1/3 xl:w-1/4 bg-primary text-white p-6 sm:p-8 flex flex-col mr-8 rounded-2xl">
        <div class="flex items-center space-x-3 mb-8">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
            <WorkflowIcon class="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <span class="text-xl sm:text-2xl font-bold">Workroom</span>
        </div>

        <div class="flex-1 flex flex-col justify-between">
          <div class="space-y-8">
            <!-- Desktop Steps -->
            <div class="hidden lg:block space-y-6">
              <!-- Step 1 -->
              <div class="flex items-start space-x-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="activeStep >= 1 ? 'border-black border-2 bg-white text-black' : 'border-2 border-white text-white'">
                    <span>1</span>
                  </div>
                  <div class="w-0.5 h-6 my-1" :class="activeStep >= 2 ? 'bg-black/50' : 'bg-white/50'"></div>
                </div>
                <div>
                  <p class="font-medium">Owner Info</p>
                  <p class="text-sm text-white/80 mt-1">Secure your account</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="flex items-start space-x-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="activeStep >= 2 ? 'border-black border-2 bg-white text-black' : 'border-2 border-white text-white'">
                    <span>2</span>
                  </div>
                  <div class="w-0.5 h-6 my-1" :class="activeStep >= 3 ? 'bg-black/50' : 'bg-white/50'"></div>
                </div>
                <div>
                  <p class="font-medium">Company Info</p>
                  <p class="text-sm text-white/80 mt-1">Tell us about your company</p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="flex items-start space-x-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="activeStep >= 3 ? 'border-black border-2 bg-white text-black' : 'border-2 border-white text-white'">
                    <span>3</span>
                  </div>
                  <div class="w-0.5 h-6 my-1" :class="activeStep >= 4 ? 'bg-black/50' : 'bg-white/50'"></div>
                </div>
                <div>
                  <p class="font-medium">Task Type</p>
                  <p class="text-sm text-white/80 mt-1">Setup your workspace</p>
                </div>
              </div>

              <!-- Step 4 -->
              <div class="flex items-start space-x-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="activeStep === 4 ? 'border-black border-2 bg-white text-black' : 'border-2 border-white text-white'">
                    <span>4</span>
                  </div>
                </div>
                <div>
                  <p class="font-medium">Departments</p>
                  <p class="text-sm text-white/80 mt-1">Departments in your company</p>
                </div>
              </div>
            </div>

            <!-- Mobile Steps -->
            <div class="lg:hidden grid grid-cols-4 gap-4">
              <div v-for="i in 4" :key="i" class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                     :class="activeStep >= i ? 'border-black border-2 bg-white text-black' : 'border-2 border-white text-white'">
                  <span>{{ i }}</span>
                </div>
                <p class="text-xs mt-1 text-center">
                  {{ ['Owner Info', 'Company Info', 'Task Type', 'Departments'][i - 1] }}
                </p>
              </div>
            </div>
          </div>

          <!-- Help link -->
          <div class="mt-8 text-sm">
            <a href="#" class="flex items-center text-white/80 hover:text-white">
              <span>Need help?</span>
              <ArrowRight class="ml-1 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <!-- Right Side: Dynamic Step Form -->
      <component :is="showSection" v-if="showSection" />
      <router-view v-else />
    </div>
  </div>
</template>
