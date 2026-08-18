// stores/projectStore.ts
import { defineStore } from "pinia";
import type { ActivityEntry, Project, TaskType } from "@/types/types";
import { computeProgressLabel, formatMinutesToDuration, parseDurationToMinutes } from "@/lib/duration";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projects: [
      {
        id: "PNU001223",
        title: "E-Learning Platform",
        icon: "🎓",
        createdAt: "2025-05-03",
        priority: { level: "high", icon: "ArrowUp", color: "red" },
        assignee: ["Abel", "Sarah", "Michael"],
        assignedBy: "John",
        status: "Active",
        description:
          "A comprehensive online learning system with courses, quizzes, and certification features.",
        task: {
          tasks: [
            {
              id: "task-5",
              name: "Define Course Modules",
              icon: "📘",
              createdAt: "2025-05-03",
              priority: { level: "high" },
              assignee: "Sarah",
              status: "To Do",
              EstimatedTime: "2d",
              SpentTime: "0h",
              Progress: "0%",
              description:
                "Outline the curriculum structure and learning objectives.",
              deadline: "2025-05-20",
            },
            {
              id: "task-6",
              name: "Create Landing Page",
              icon: "🖼️",
              createdAt: "2025-05-03",
              priority: { level: "medium" },
              assignee: "Michael",
              status: "In Progress",
              EstimatedTime: "3d",
              SpentTime: "1d",
              Progress: "50%",
              description:
                "Think over the layout for the marketing page, create a flow using wireframes. Upon completion, show the team and discuss. Attach the source to the task.",
              deadline: "2025-05-22",
              labelColors: ["purple", "cyan"],
              attachments: [
                { type: "link", url: "#", label: "wireframes.png" },
              ],
              activity: [
                {
                  id: "act-1",
                  actor: "Sarah",
                  actorRole: "UI/UX Designer",
                  message: "Updated the status of Create Landing Page task to In Progress",
                  createdAt: "2025-05-04T10:20:00",
                },
                {
                  id: "act-2",
                  actor: "Sarah",
                  actorRole: "UI/UX Designer",
                  message: "Attached files to Create Landing Page task",
                  createdAt: "2025-05-04T10:22:00",
                },
                {
                  id: "act-3",
                  actor: "Michael",
                  actorRole: "Copywriter",
                  message: "Updated the status of Create Landing Page task to In Progress",
                  createdAt: "2025-05-04T11:05:00",
                },
              ],
            },
          ],
          total: 2,
          active: 1,
        },
      },
      {
        id: "PNU001224",
        title: "Hotel Booking App",
        icon: "🏨",
        createdAt: "2025-05-04",
        priority: { level: "medium", icon: "ArrowDown", color: "orange" },
        assignee: ["Emma", "David"],
        assignedBy: "Emma",
        status: "Active",
        description:
          "Mobile and web app for booking hotels with real-time availability.",
        task: {
          tasks: [
            {
              id: "task-7",
              name: "User Authentication",
              icon: "🔐",
              createdAt: "2025-05-04",
              priority: { level: "high" },
              assignee: "Emma",
              status: "In Progress",
              EstimatedTime: "2d",
              SpentTime: "1d",
              Progress: "50%",
              description: "Implement secure login/signup flows.",
            },
          ],
          total: 1,
          active: 1,
        },
      },
      {
        id: "PNU001225",
        title: "Healthcare Dashboard",
        icon: "🏥",
        createdAt: "2025-05-05",
        priority: { level: "high", icon: "ArrowUp", color: "red" },
        assignee: ["Lisa", "James"],
        assignedBy: "Alex",
        status: "In Active",
        description: "Platform for patient health monitoring and analytics.",
        task: {
          tasks: [
            {
              id: "task-8",
              name: "Data Visualization",
              icon: "📊",
              createdAt: "2025-05-05",
              priority: { level: "medium" },
              assignee: "Lisa",
              status: "To Do",
              EstimatedTime: "3d",
              SpentTime: "0h",
              Progress: "0%",
              description: "Create interactive health metrics charts.",
            },
          ],
          total: 1,
          active: 0,
        },
      },
      {
        id: "PNU001226",
        title: "Fitness Tracker",
        icon: "🏋️",
        createdAt: "2025-05-06",
        priority: { level: "medium", icon: "ArrowUp", color: "orange" },
        assignee: ["Abel", "Emma"],
        assignedBy: "Lisa",
        status: "Done",
        description: "Mobile app for workout tracking and health metrics.",
        task: {
          tasks: [
            {
              id: "task-9",
              name: "Workout Logging",
              icon: "📝",
              createdAt: "2025-05-06",
              priority: { level: "high" },
              assignee: "Abel",
              status: "Done",
              EstimatedTime: "2d",
              SpentTime: "2d",
              Progress: "100%",
              description: "Implement exercise tracking functionality.",
            },
          ],
          total: 1,
          active: 0,
        },
      },
      {
        id: "PNU001227",
        title: "E-Commerce Platform",
        icon: "🛒",
        createdAt: "2025-05-07",
        priority: { level: "high", icon: "ArrowUp", color: "red" },
        assignee: ["David", "Sarah"],
        assignedBy: "Mark",
        status: "Active",
        description: "Online store with product catalog and checkout system.",
        task: {
          tasks: [
            {
              id: "task-10",
              name: "Payment Gateway",
              icon: "💳",
              createdAt: "2025-05-07",
              priority: { level: "high" },
              assignee: "David",
              status: "In Progress",
              EstimatedTime: "3d",
              SpentTime: "1d",
              Progress: "33%",
              description: "Integrate Stripe payment processing.",
            },
          ],
          total: 1,
          active: 1,
        },
      },
      {
        id: "PNU001228",
        title: "Project Management Tool",
        icon: "📋",
        createdAt: "2025-05-08",
        priority: { level: "medium", icon: "ArrowDown", color: "orange" },
        assignee: ["Michael", "Lisa"],
        assignedBy: "Sara",
        status: "In Active",
        description: "Collaborative platform for team task management.",
        task: {
          tasks: [
            {
              id: "task-11",
              name: "Kanban Board",
              icon: "📌",
              createdAt: "2025-05-08",
              priority: { level: "medium" },
              assignee: "Michael",
              status: "To Do",
              EstimatedTime: "2d",
              SpentTime: "0h",
              Progress: "0%",
              description: "Implement drag-and-drop task management.",
            },
          ],
          total: 1,
          active: 0,
        },
      },
      {
        id: "PNU001229",
        title: "Social Media Dashboard",
        icon: "📱",
        createdAt: "2025-05-09",
        priority: { level: "low", icon: "ArrowDown", color: "green" },
        assignee: ["James", "Emma"],
        assignedBy: "John",
        status: "Active",
        description:
          "Analytics platform for social media performance tracking.",
        task: {
          tasks: [
            {
              id: "task-12",
              name: "API Integration",
              icon: "🔗",
              createdAt: "2025-05-09",
              priority: { level: "high" },
              assignee: "James",
              status: "In Progress",
              EstimatedTime: "4d",
              SpentTime: "2d",
              Progress: "50%",
              description: "Connect to Twitter and Instagram APIs.",
            },
          ],
          total: 1,
          active: 1,
        },
      },
      {
        id: "PNU001230",
        title: "AI Content Moderator",
        icon: "🤖",
        createdAt: "2025-05-10",
        priority: { level: "high", icon: "ArrowUp", color: "red" },
        assignee: ["Henry", "Ivy"],
        assignedBy: "Emma",
        status: "Active",
        description:
          "Automated system for detecting inappropriate content using machine learning.",
        task: {
          tasks: [
            {
              id: "task-13",
              name: "Model Training",
              icon: "🧠",
              createdAt: "2025-05-10",
              priority: { level: "high" },
              assignee: "Henry",
              status: "In Progress",
              EstimatedTime: "5d",
              SpentTime: "3d",
              Progress: "75%",
              description: "Train NLP model on flagged content datasets",
            },
            {
              id: "task-14",
              name: "Image Recognition",
              icon: "🖼️",
              createdAt: "2025-05-10",
              priority: { level: "high" },
              assignee: "Ivy",
              status: "In Review",
              EstimatedTime: "4d",
              SpentTime: "4d",
              Progress: "100%",
              description: "Implement visual content analysis system",
            },
          ],
          total: 2,
          active: 2,
        },
      },

      {
        id: "PNU001231",
        title: "Fleet Tracking System",
        icon: "🚚",
        createdAt: "2025-05-11",
        priority: { level: "medium", icon: "ArrowUp", color: "orange" },
        assignee: ["Jack", "Karen"],
        assignedBy: "Alex",
        status: "Active",
        description:
          "Real-time GPS tracking and route optimization for delivery vehicles.",
        task: {
          tasks: [
            {
              id: "task-15",
              name: "GPS Integration",
              icon: "📍",
              createdAt: "2025-05-11",
              priority: { level: "high" },
              assignee: "Jack",
              status: "Done",
              EstimatedTime: "3d",
              SpentTime: "3d",
              Progress: "100%",
              description: "Connect to vehicle tracking devices",
            },
            {
              id: "task-16",
              name: "Route Algorithm",
              icon: "🛣️",
              createdAt: "2025-05-11",
              priority: { level: "high" },
              assignee: "Karen",
              status: "In Progress",
              EstimatedTime: "4d",
              SpentTime: "2d",
              Progress: "50%",
              description: "Develop optimal routing logic",
            },
          ],
          total: 2,
          active: 1,
        },
      },

      {
        id: "PNU001232",
        title: "Event Management Platform",
        icon: "🎪",
        createdAt: "2025-05-12",
        priority: { level: "low", icon: "ArrowDown", color: "green" },
        assignee: ["Leo", "Mia"],
        assignedBy: "Lisa",
        status: "Active",
        description:
          "End-to-end solution for planning, promoting, and running events.",
        task: {
          tasks: [
            {
              id: "task-17",
              name: "Ticketing System",
              icon: "🎫",
              createdAt: "2025-05-12",
              priority: { level: "medium" },
              assignee: "Leo",
              status: "In Progress",
              EstimatedTime: "3d",
              SpentTime: "1d",
              Progress: "50%",
              description: "Implement seat selection and payment processing",
            },
            {
              id: "task-18",
              name: "RSVP Tracking",
              icon: "✍️",
              createdAt: "2025-05-12",
              priority: { level: "low" },
              assignee: "Mia",
              status: "Done",
              EstimatedTime: "1d",
              SpentTime: "1d",
              Progress: "100%",
              description: "Create invitation response system",
            },
          ],
          total: 2,
          active: 1,
        },
      },

      {
        id: "PNU001233",
        title: "Smart Home Control",
        icon: "🏠",
        createdAt: "2025-05-13",
        priority: { level: "high", icon: "ArrowUp", color: "red" },
        assignee: ["Noah", "Olivia"],
        assignedBy: "Mark",
        status: "Active",
        description:
          "Centralized platform for controlling smart home devices and automation.",
        task: {
          tasks: [
            {
              id: "task-19",
              name: "Device Integration",
              icon: "🔌",
              createdAt: "2025-05-13",
              priority: { level: "high" },
              assignee: "Noah",
              status: "In Progress",
              EstimatedTime: "3d",
              SpentTime: "1d",
              Progress: "33%",
              description: "Connect to various smart home protocols",
            },
            {
              id: "task-20",
              name: "Voice Control",
              icon: "🎤",
              createdAt: "2025-05-13",
              priority: { level: "medium" },
              assignee: "Olivia",
              status: "To Do",
              EstimatedTime: "2d",
              SpentTime: "0h",
              Progress: "0%",
              description: "Implement voice command functionality",
            },
          ],
          total: 2,
          active: 1,
        },
      },

      {
        id: "PNU001234",
        title: "Inventory Management",
        icon: "📦",
        createdAt: "2025-05-14",
        priority: { level: "medium", icon: "ArrowDown", color: "orange" },
        assignee: ["Ethan", "Ava"],
        assignedBy: "Sara",
        status: "Active",
        description:
          "System for tracking stock levels and automated reordering.",
        task: {
          tasks: [
            {
              id: "task-21",
              name: "Barcode Scanning",
              icon: "📷",
              createdAt: "2025-05-14",
              priority: { level: "high" },
              assignee: "Ethan",
              status: "Done",
              EstimatedTime: "2d",
              SpentTime: "2d",
              Progress: "100%",
              description: "Implement mobile scanner integration",
            },
            {
              id: "task-22",
              name: "Low Stock Alerts",
              icon: "⚠️",
              createdAt: "2025-05-14",
              priority: { level: "medium" },
              assignee: "Ava",
              status: "In Progress",
              EstimatedTime: "1d",
              SpentTime: "0.5d",
              Progress: "50%",
              description: "Configure notification thresholds",
            },
          ],
          total: 2,
          active: 1,
        },
      },

      {
        id: "PNU001235",
        title: "Language Learning App",
        icon: "🗣️",
        createdAt: "2025-05-15",
        priority: { level: "medium", icon: "ArrowUp", color: "orange" },
        assignee: ["Liam", "Sophia"],
        assignedBy: "John",
        status: "Active",
        description:
          "Mobile app for learning languages with interactive lessons.",
        task: {
          tasks: [
            {
              id: "task-23",
              name: "Lesson Builder",
              icon: "📚",
              createdAt: "2025-05-15",
              priority: { level: "high" },
              assignee: "Liam",
              status: "In Progress",
              EstimatedTime: "4d",
              SpentTime: "2d",
              Progress: "50%",
              description: "Create tools for designing lessons",
            },
            {
              id: "task-24",
              name: "Speech Recognition",
              icon: "🎤",
              createdAt: "2025-05-15",
              priority: { level: "medium" },
              assignee: "Sophia",
              status: "To Do",
              EstimatedTime: "3d",
              SpentTime: "0h",
              Progress: "0%",
              description: "Implement pronunciation evaluation",
            },
          ],
          total: 2,
          active: 1,
        },
      },

      {
        id: "PNU001236",
        title: "Expense Tracker",
        icon: "💵",
        createdAt: "2025-05-16",
        priority: { level: "low", icon: "ArrowDown", color: "green" },
        assignee: ["Mason", "Isabella"],
        assignedBy: "Emma",
        status: "Active",
        description: "App for tracking personal expenses and budgeting.",
        task: {
          tasks: [
            {
              id: "task-25",
              name: "Expense Input",
              icon: "✍️",
              createdAt: "2025-05-16",
              priority: { level: "medium" },
              assignee: "Mason",
              status: "Done",
              EstimatedTime: "2d",
              SpentTime: "2d",
              Progress: "100%",
              description: "Design interface for logging expenses",
            },
            {
              id: "task-26",
              name: "Budget Planner",
              icon: "📅",
              createdAt: "2025-05-16",
              priority: { level: "medium" },
              assignee: "Isabella",
              status: "In Progress",
              EstimatedTime: "3d",
              SpentTime: "1d",
              Progress: "33%",
              description: "Create tools for setting budgets",
            },
          ],
          total: 2,
          active: 1,
        },
      },
    ] as Project[],

    selectedProject: null as Project | null,
    showDetial: false as boolean,
    selectedTask: null as TaskType | null,
  }),
  getters: {
    getSelectedState(state) {
      return state.projects[0];
    },
    allAssignees(state) {
      const names = new Set<string>();
      state.projects.forEach((project) => {
        project.assignee.forEach((name) => names.add(name));
      });
      return Array.from(names).sort();
    },
  },
  actions: {
    addProject(project: Project) {
      this.projects.push(project);
    },

    selectTask(task: TaskType | null) {
      this.selectedTask = task;
    },

    findProject(projectId: string) {
      return this.projects.find((project) => project.id === projectId) ?? null;
    },

    logActivity(projectId: string, taskId: string, entry: Omit<ActivityEntry, "id" | "createdAt">) {
      const project = this.findProject(projectId);
      const task = project?.task.tasks?.find((t) => t.id === taskId);
      if (!task) return;
      if (!task.activity) task.activity = [];
      task.activity.unshift({
        id: `act-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...entry,
      });
    },

    addTask(
      projectId: string,
      input: {
        name: string;
        description: string;
        taskGroup: string;
        estimatedTime: string;
        deadline: string;
        priority: "low" | "medium" | "high";
        assignee: string;
        labelColors: string[];
      }
    ) {
      const project = this.findProject(projectId);
      if (!project) return;

      const task: TaskType = {
        id: `task-${Date.now()}`,
        name: input.name,
        icon: "📝",
        createdAt: new Date().toISOString().slice(0, 10),
        description: input.description,
        priority: { level: input.priority },
        assignee: input.assignee,
        status: "To Do",
        EstimatedTime: input.estimatedTime,
        SpentTime: "0h",
        Progress: "0%",
        deadline: input.deadline,
        labelColors: input.labelColors,
        activity: [
          {
            id: `act-${Date.now()}`,
            actor: input.assignee || "You",
            message: `Created ${input.name} task in ${input.taskGroup}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      if (!project.task.tasks) project.task.tasks = [];
      project.task.tasks.push(task);
      project.task.total += 1;
      project.task.active += 1;

      return task;
    },

    updateTaskStatus(projectId: string, taskId: string, status: TaskType["status"]) {
      const project = this.findProject(projectId);
      const task = project?.task.tasks?.find((t) => t.id === taskId);
      if (!task) return;

      const previousStatus = task.status;
      task.status = status;
      if (status === "Done") task.Progress = "100%";

      if (this.selectedTask?.id === taskId) {
        this.selectedTask = task;
      }

      if (previousStatus !== status) {
        this.logActivity(projectId, taskId, {
          actor: task.assignee || "You",
          message: `Updated the status of ${task.name} task to ${status}`,
        });
      }
    },

    logTime(
      projectId: string,
      taskId: string,
      input: { timeSpent: string; date: string; time: string; description: string }
    ) {
      const project = this.findProject(projectId);
      const task = project?.task.tasks?.find((t) => t.id === taskId);
      if (!task) return;

      const addedMinutes = parseDurationToMinutes(input.timeSpent);
      const previousMinutes = parseDurationToMinutes(task.SpentTime);
      task.SpentTime = formatMinutesToDuration(previousMinutes + addedMinutes);
      task.Progress = computeProgressLabel(task.SpentTime, task.EstimatedTime);

      if (this.selectedTask?.id === taskId) {
        this.selectedTask = task;
      }

      this.logActivity(projectId, taskId, {
        actor: task.assignee || "You",
        message: `Logged ${input.timeSpent} on ${task.name} task${input.description ? ` — ${input.description}` : ""}`,
      });
    },
  },

  persist: {
    key: "pinia-projectStore",
    storage: localStorage,
  },
});
