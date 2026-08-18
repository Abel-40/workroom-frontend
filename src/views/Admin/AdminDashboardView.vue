<script setup>
import {
  ArrowDown,
  LayoutDashboard,
  Search,
  Bell,
  Calendar,
  ChevronRight,
  ChevronDown,
  Clock10,
  ArrowUp,
  WorkflowIcon,
  CloudUpload,
  Paperclip,
  Puzzle,
  SquareDashedKanban,
  Users,
  ChartNoAxesCombined,
  CircleEllipsis,
  LogOut,
} from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserCard from "@/components/Dashboard/Cards/UserCard.vue";
</script>

<template>
  <!-- Main Container -->
  <div class="w-full min-h-screen bg-[#F4F9FD]">
    <div class="flex flex-col md:flex-row pl-4 pt-3">
      <!-- Sidebar -->
      <div class="w-full md:w-64 bg-white p-4 rounded-lg md:min-h-screen">
        <div class="flex flex-col justify-between h-full">
          <!-- Logo and Navigation -->
          <div class="space-y-6">
            <!-- Logo -->
            <div class="flex items-center gap-2 mb-6">
              <div
                class="w-10 h-10 bg-background rounded-lg flex items-center justify-center"
              >
                <WorkflowIcon class="w-6 h-6 text-[#3F8CFF]" />
              </div>
              <span class="text-xl font-bold text-[#3F8CFF]">Workroom</span>
            </div>

            <!-- Navigation -->
            <nav class="space-y-2">
              <a
                href="#"
                class="flex items-center gap-2 p-2 text-[#3F8CFF] font-semibold bg-blue-50 rounded-lg border-r-4 border-blue-400"
              >
                <LayoutDashboard class="w-5 h-5" fill="#3F8CFF" />
                Dashboard
              </a>
              <a
                href="#"
                class="flex items-center gap-2 p-2 text-[#7D8592] hover:bg-gray-50 rounded-lg"
              >
                <Puzzle class="w-5 h-5" />
                Departments
              </a>
              <a
                href="#"
                class="flex items-center gap-2 p-2 text-[#7D8592] hover:bg-gray-50 rounded-lg"
              >
                <SquareDashedKanban class="w-5 h-5" />
                Projects
              </a>
              <a
                href="#"
                class="flex items-center gap-2 p-2 text-[#7D8592] hover:bg-gray-50 rounded-lg"
              >
                <Users class="w-5 h-5" />
                Users
              </a>
              <a
                href="#"
                class="flex items-center gap-2 p-2 text-[#7D8592] hover:bg-gray-50 rounded-lg"
              >
                <ChartNoAxesCombined class="w-5 h-5" />
                Performance
              </a>
              <a
                href="#"
                class="flex items-center gap-2 p-2 text-[#7D8592] hover:bg-gray-50 rounded-lg"
              >
                <CircleEllipsis class="w-5 h-5" />
                Others
              </a>
            </nav>
          </div>

          <!-- User Profile and Logout -->
          <div class="mt-8 space-y-4">
            <div class="p-2 rounded-lg">
              <img
                src="https://plus.unsplash.com/premium_photo-1661290256778-3b821d52c514?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="User profile"
                class="rounded-lg w-full object-cover"
              />
            </div>
            <button
              class="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut class="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-4">
        <!-- Header -->
        <div class="mb-6">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
          >
            <!-- Search Bar -->
            <div class="relative w-full md:w-1/2 max-w-md">
              <Input
                id="search"
                type="text"
                placeholder="Search..."
                class="pl-10 bg-white h-12 shadow-sm"
              />
              <Search
                class="absolute left-3 top-3 size-5 text-muted-foreground"
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

          <!-- Page Title -->
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
          >
            <div>
              <p class="text-sm text-[#7D8592]">Welcome back, Abel</p>
              <h1 class="text-xl font-semibold">Dashboard</h1>
            </div>
            <div
              class="flex items-center gap-2 bg-[#E6EDF5] px-3 py-2 rounded-md"
            >
              <Calendar class="w-4 h-4" />
              <span class="text-sm">Nov 16, 2020 - Dec 16, 2020</span>
            </div>
          </div>
        </div>

        <!-- Workload and Events Section -->
        <div class="flex flex-col lg:flex-row gap-6 mb-6">
          <!-- Workload -->
          <div class="w-full lg:w-2/3 bg-white p-4 rounded-xl shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h2 class="font-semibold">Workload</h2>
              <Button variant="link" class="text-sm p-0">
                View all <ChevronRight class="w-4 h-4" />
              </Button>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <!-- User Cards -->
              <UserCard
                name="Shawn Stone"
                role="UMAX Designer"
                department="USBES"
                imageSrc="https://randomuser.me/api/portraits/men/1.jpg"
              />
              <UserCard
                name="Ready Delgado"
                role="UMAX Designer"
                department="TABLES"
                imageSrc="https://randomuser.me/api/portraits/women/1.jpg"
              />
              <UserCard
                name="Emily Tyler"
                role="Copywriter"
                department="USBES"
                imageSrc="https://randomuser.me/api/portraits/women/2.jpg"
              />
              <UserCard
                name="Louis Castro"
                role="Copywriter"
                department="SUNC"
                imageSrc="https://randomuser.me/api/portraits/men/2.jpg"
              />
            </div>
          </div>

          <!-- Events -->
          <div class="w-full lg:w-1/3 bg-white p-4 rounded-xl shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h2 class="font-semibold">Nearest Events</h2>
              <Button variant="link" class="text-sm p-0">
                View all <ChevronRight class="w-4 h-4" />
              </Button>
            </div>

            <div class="space-y-4">
              <!-- Event 1 -->
              <div class="border-l-4 border-blue-400 pl-3">
                <div class="flex justify-between">
                  <h3 class="font-medium">
                    Presentation of the new department
                  </h3>
                  <ArrowUp class="w-4 h-4 text-yellow-500" />
                </div>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-sm text-[#91929E]">Today | 5:00 PM</p>
                  <div
                    class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded"
                  >
                    <Clock10 class="w-3 h-3" />
                    <span class="text-xs">4h</span>
                  </div>
                </div>
              </div>

              <!-- Event 2 -->
              <div class="border-l-4 border-purple-400 pl-3">
                <div class="flex justify-between">
                  <h3 class="font-medium">Anna's Birthday</h3>
                  <ArrowDown class="w-4 h-4 text-green-500" />
                </div>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-sm text-[#91929E]">Today | 6:00 PM</p>
                  <div
                    class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded"
                  >
                    <Clock10 class="w-3 h-3" />
                    <span class="text-xs">4h</span>
                  </div>
                </div>
              </div>

              <!-- Event 3 -->
              <div class="border-l-4 border-orange-400 pl-3">
                <div class="flex justify-between">
                  <h3 class="font-medium">Ray's Birthday</h3>
                  <ArrowDown class="w-4 h-4 text-green-500" />
                </div>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-sm text-[#91929E]">Tomorrow | 2:00 PM</p>
                  <div
                    class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded"
                  >
                    <Clock10 class="w-3 h-3" />
                    <span class="text-xs">4h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects and Activity Section -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Projects -->
          <div class="w-full lg:w-2/3 space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="font-semibold">Projects</h2>
              <Button variant="link" class="text-sm p-0">
                View all <ChevronRight class="w-4 h-4" />
              </Button>
            </div>

            <!-- Project Cards -->
            <div class="space-y-4">
              <!-- Project 1 -->
              <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
                >
                  <!-- Left Side -->
                  <div class="p-4">
                    <div class="flex items-center gap-3 mb-3">
                      <img
                        src="https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Project icon"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p class="text-sm text-[#91929E]">PNU001205</p>
                        <h3 class="font-medium">Medical App (iOS native)</h3>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <div
                        class="flex items-center gap-1 text-sm text-[#91929E]"
                      >
                        <Calendar class="w-4 h-4" />
                        <span>Created Sep 12, 2020</span>
                      </div>
                      <div class="flex items-center gap-1 text-yellow-500">
                        <ArrowUp class="w-4 h-4" />
                        <span class="text-sm">Medium</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right Side -->
                  <div class="p-4">
                    <h4 class="font-medium mb-3">Project Data</h4>
                    <div class="flex justify-between">
                      <div>
                        <p class="text-sm text-[#91929E]">All tasks</p>
                        <p class="font-medium">34</p>
                      </div>
                      <div>
                        <p class="text-sm text-[#91929E]">Active tasks</p>
                        <p class="font-medium">13</p>
                      </div>
                      <div class="text-center">
                        <p class="text-sm text-[#91929E]">Assignees</p>
                        <img
                          src="https://randomuser.me/api/portraits/men/3.jpg"
                          alt="Assignee"
                          class="w-8 h-8 rounded-full mx-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Project 2 -->
              <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
                >
                  <!-- Left Side -->
                  <div class="p-4">
                    <div class="flex items-center gap-3 mb-3">
                      <img
                        src="https://images.unsplash.com/photo-1530669244764-0909211cd8e8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Project icon"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p class="text-sm text-[#91929E]">PNU001221</p>
                        <h3 class="font-medium">Food Delivery Service</h3>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <div
                        class="flex items-center gap-1 text-sm text-[#91929E]"
                      >
                        <Calendar class="w-4 h-4" />
                        <span>Created Sep 10, 2020</span>
                      </div>
                      <div class="flex items-center gap-1 text-yellow-500">
                        <ArrowUp class="w-4 h-4" />
                        <span class="text-sm">Medium</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right Side -->
                  <div class="p-4">
                    <h4 class="font-medium mb-3">Project Data</h4>
                    <div class="flex justify-between">
                      <div>
                        <p class="text-sm text-[#91929E]">All tasks</p>
                        <p class="font-medium">50</p>
                      </div>
                      <div>
                        <p class="text-sm text-[#91929E]">Active tasks</p>
                        <p class="font-medium">24</p>
                      </div>
                      <div class="text-center">
                        <p class="text-sm text-[#91929E]">Assignees</p>
                        <img
                          src="https://randomuser.me/api/portraits/women/3.jpg"
                          alt="Assignee"
                          class="w-8 h-8 rounded-full mx-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Project 3 -->
              <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
                >
                  <!-- Left Side -->
                  <div class="p-4">
                    <div class="flex items-center gap-3 mb-3">
                      <img
                        src="https://images.unsplash.com/photo-1609349239791-53cf7964978f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Project icon"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p class="text-sm text-[#91929E]">PNU001230</p>
                        <h3 class="font-medium">Food Delivery Service</h3>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <div
                        class="flex items-center gap-1 text-sm text-[#91929E]"
                      >
                        <Calendar class="w-4 h-4" />
                        <span>Created May 28, 2020</span>
                      </div>
                      <div class="flex items-center gap-1 text-green-500">
                        <ArrowDown class="w-4 h-4" />
                        <span class="text-sm">Low</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right Side -->
                  <div class="p-4">
                    <h4 class="font-medium mb-3">Project Data</h4>
                    <div class="flex justify-between">
                      <div>
                        <p class="text-sm text-[#91929E]">All tasks</p>
                        <p class="font-medium">23</p>
                      </div>
                      <div>
                        <p class="text-sm text-[#91929E]">Active tasks</p>
                        <p class="font-medium">20</p>
                      </div>
                      <div class="text-center">
                        <p class="text-sm text-[#91929E]">Assignees</p>
                        <img
                          src="https://randomuser.me/api/portraits/men/4.jpg"
                          alt="Assignee"
                          class="w-8 h-8 rounded-full mx-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  </div>
</template>
