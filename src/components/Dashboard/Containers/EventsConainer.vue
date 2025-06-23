<script setup lang="ts">
import {MoveLeft} from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import {Plus} from 'lucide-vue-next';
import EventCard from ".././Cards/EventCard.vue";
import Header from './SubConatiners/Header.vue';
import {ref} from "vue"
import { useRouter } from 'vue-router';


const router = useRouter()
const events = ref([
  {
    id: 1,
    title: "Presentation of the new department",
    date: "Today",
    time: "5:00 PM",
    duration: "4h"
  },
  {
    id: 2,
    title: "Anna's Birthday",
    date: "Today",
    time: "6:00 PM",
    duration: "4h"
  },
  {
    id: 3,
    title: "Ray's Birthday",
    date: "Tomorrow",
    time: "2:00 PM",
    duration: "4h"
  },
  {
    id: 3,
    title: "Ray's Birthday",
    date: "Tomorrow",
    time: "2:00 PM",
    duration: "4h"
  },
  {
    id: 3,
    title: "Ray's Birthday",
    date: "Tomorrow",
    time: "2:00 PM",
    duration: "4h"
  }
]);
</script>

<template>
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
                <Button>
                  <Plus/>
                    Add Event
                </Button>
              </div>
            </div>
      </div>
    <div class="w-full 2xl:w-  2xl: grid grid-cols-2 gap-6   px-2"> 
      <EventCard
          v-for="event in events"
          :title="event.title"
          :key="event.id"
          :date="event.date"
          :time="event.time"
          :duration="event.duration"
        />
    </div>
  </div>
</template>