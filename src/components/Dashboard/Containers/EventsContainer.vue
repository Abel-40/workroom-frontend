<script setup lang="ts">
import {MoveLeft, Plus} from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import EventCard from ".././Cards/EventCard.vue";
import Header from './SubContainers/Header.vue';
import AddEventModal from './AddEventModal.vue';
import { ref } from "vue"
import { useRouter } from 'vue-router';
import { useEventStore } from '@/stores/eventStore';

const router = useRouter()
const eventStore = useEventStore()
const isAddEventOpen = ref(false)

const sortedEvents = () =>
  [...eventStore.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
</script>

<template>
  <AddEventModal v-model:open="isAddEventOpen" />
  <div class="flex-1 p-4">
        <div class="mb-6">
        <Header/>
            <!-- Page Title -->
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <span class="flex gap-2 items-center cursor-pointer">
                    <Button as="a" variant="link"   @click="router.back()"><MoveLeft class="text-primary"/> Back to Dashboard</Button>
                  </span>
                  <h1 class="text-xl font-semibold pl-12">Nearest Events</h1>
                </div>
              <div  class="flex items-center gap-2  px-3 py-2 rounded-md">
                <Button @click="isAddEventOpen = true">
                  <Plus/>
                    Add Event
                </Button>
              </div>
            </div>
      </div>
    <div class="w-full 2xl:w-  2xl: grid grid-cols-2 gap-6   px-2">
      <EventCard
          v-for="event in sortedEvents()"
          :title="event.title"
          :key="event.id"
          :date="event.date"
          :time="event.time"
          :duration="event.duration"
          :icon="event.icon"
          :priority="event.priority"
          :color="event.color"
        />
    </div>
  </div>
</template>
