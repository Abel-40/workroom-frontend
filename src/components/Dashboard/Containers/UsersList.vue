<script setup lang="ts">
import { ref, watch, onMounted,computed } from 'vue'
import { Filter, ChevronLeft, ChevronRight,LayoutList,ClipboardCheck } from 'lucide-vue-next'
import UserListCard from '@/components/Dashboard/Cards/UserListCard.vue'
import Header from '@/components/Dashboard/Containers/SubConatiners/Header.vue'
import userModalComposables from '@/composables/userModalComposables'
import UserRigesterationModal from '@/components/Dashboard/Containers/UserRigesterationModal.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const {onOpen,onClose,isOpen} = userModalComposables()


const currentView = ref<'List' | 'Activity'>('List')
const currentPage = ref(1)
const itemsPerPage = 8

const users = [
  {
    name: 'Evan Yates',
    email: 'evanyates@gmail.com',
    gender: 'Male',
    birthday: 'Apr 12, 1995',
    age: 25,
    position: 'UI/UX Designer',
    level: 'Middle',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Lenora Fowler',
    email: 'eravi@ec.gov',
    gender: 'Female',
    birthday: 'Apr 28, 1998',
    age: 23,
    position: 'UI/UX Designer',
    level: 'Junior',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Winnie McGuire',
    email: 'winnie3498@gmail.com',
    gender: 'Female',
    birthday: 'Apr 12, 1995',
    age: 25,
    position: 'Copywriter',
    level: 'Senior',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    name: 'James Williamson',
    email: 'williamsonj@gmail.com',
    gender: 'Male',
    birthday: 'Sep 23, 1992',
    age: 28,
    position: 'iOS Developer',
    level: 'Middle',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    name: 'Emily Tyler',
    email: 'tyleremily24@gmail.com',
    gender: 'Female',
    birthday: 'May 16, 1996',
    age: 24,
    position: 'UI/UX Designer',
    level: 'Junior',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    name: 'Thomas Schneider',
    email: 'thomas.s@gmail.com',
    gender: 'Male',
    birthday: 'Apr 28, 1998',
    age: 23,
    position: 'Sales Manager',
    level: 'Junior',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  {
    name: 'Sallie Long',
    email: 'sallielong@gmail.com',
    gender: 'Female',
    birthday: 'Apr 12, 1995',
    age: 25,
    position: 'Copywriter',
    level: 'Middle',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
  },
  {
    name: 'Kathryn Guerrero',
    email: 'kathryn1992@gmail.com',
    gender: 'Female',
    birthday: 'Sep 23, 1992',
    age: 28,
    position: 'iOS Developer',
    level: 'Senior',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  },
  // Add 7 more users for a total of at least 15
  {
    name: 'Lucas Brown',
    email: 'lucas.brown@gmail.com',
    gender: 'Male',
    birthday: 'Jan 10, 1990',
    age: 33,
    position: 'Backend Developer',
    level: 'Senior',
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg'
  },
  {
    name: 'Olivia Green',
    email: 'olivia.green@gmail.com',
    gender: 'Female',
    birthday: 'Feb 14, 1993',
    age: 30,
    position: 'Product Manager',
    level: 'Middle',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    name: 'Mason Lee',
    email: 'mason.lee@gmail.com',
    gender: 'Male',
    birthday: 'Mar 22, 1994',
    age: 29,
    position: 'QA Engineer',
    level: 'Junior',
    avatar: 'https://randomuser.me/api/portraits/men/34.jpg'
  },
  {
    name: 'Sophia Turner',
    email: 'sophia.turner@gmail.com',
    gender: 'Female',
    birthday: 'Jul 19, 1991',
    age: 32,
    position: 'HR Specialist',
    level: 'Middle',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Benjamin Clark',
    email: 'ben.clark@gmail.com',
    gender: 'Male',
    birthday: 'Nov 5, 1989',
    age: 34,
    position: 'DevOps Engineer',
    level: 'Senior',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg'
  },
  {
    name: 'Ava Martinez',
    email: 'ava.martinez@gmail.com',
    gender: 'Female',
    birthday: 'Dec 2, 1997',
    age: 25,
    position: 'Marketing Lead',
    level: 'Senior',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg'
  },
  {
    name: 'Henry Walker',
    email: 'henry.walker@gmail.com',
    gender: 'Male',
    birthday: 'Aug 8, 1996',
    age: 27,
    position: 'Frontend Developer',
    level: 'Middle',
    avatar: 'https://randomuser.me/api/portraits/men/66.jpg'
  }
]

const totalPages = Math.ceil(users.length / itemsPerPage)

const paginatedUsers = computed(() =>
  users.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
)

function changePage(direction: 'next' | 'prev') {
  if (direction === 'next' && currentPage.value < totalPages) {
    currentPage.value++
  } else if (direction === 'prev' && currentPage.value > 1) {
    currentPage.value--
  }
}

</script>

<template>
  <UserRigesterationModal v-if="isOpen"/>
    <div class="flex-1 p-4 mt-10">
        <!-- User list -->
        <div class="bg-[#f7fafd]  py-6">
          <!-- Header -->
          <div class="grid grid-rows-2 lg:grid-cols-4 lg:items-center mb-3">
            <h1 class="text-sm md:text-3xl font-bold text-gray-800 lg:col-span-2">
              Employees <span class="text-blue-500">({{ users.length }})</span>
            </h1>

            <div class="flex flex-wrap justify-between items-center gap-2  lg:w-full lg:col-span-2">
              <!-- Toggle -->
              <div class="bg-[#E6EDF5] rounded-2xl px-1 py-1 grid grid-cols-2 items-center">
                <button
                  :class="currentView === 'List' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'"
                  class="px-3 py-1 rounded-xl text-sm font-medium"
                  @click="currentView = 'List'"
                >
                  <p class="hidden md:inline">List</p>
                  <LayoutList class="md:hidden" :size="18"/>
                </button>
                <button
                  :class="currentView === 'Activity' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'"
                  class="px-3 py-1 rounded-xl text-sm font-medium"
                  @click="currentView = 'Activity'"
                >
                  <p class="hidden md:inline">Activity</p>
                  <ClipboardCheck class="md:hidden" :size="18"/>

                </button>
              </div>

              <!-- Filter icon -->
              <div class="flex gap-3">
                <button
                  class="p-2 rounded-md bg-white shadow-sm hover:bg-gray-50 transition"
                  aria-label="Filter"
                >
                  <Filter class="w-4 h-4 text-gray-600" />
                </button>

                <!-- Add Employee -->
                <button class="bg-blue-500 text-white px-3 py-1 md:py-2  md:px-4 rounded-md font-medium shadow-md hover:bg-blue-600 transition flex gap-1"  @click="onOpen">
                  + <P class="hidden lg:block">Add Employee</P>
                </button>
              </div>
            </div>
          </div>

          <!-- User List -->
          <div class="space-y-4">
            <UserListCard
              v-for="(user, idx) in users"
              :key="idx"
              :user="user"
            />
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-6 text-sm text-gray-600">
            <span>Showing {{ (currentPage - 1) * itemsPerPage + 1 }}{{ Math.min(currentPage * itemsPerPage, users.length) }} of {{ users.length }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="changePage('prev')"
                :disabled="currentPage === 1"
                class="p-2 rounded-md border bg-white disabled:opacity-50"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button
                @click="changePage('next')"
                :disabled="currentPage === totalPages"
                class="p-2 rounded-md border bg-white disabled:opacity-50"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
    </div>



</template>
