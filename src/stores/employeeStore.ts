import { defineStore } from "pinia";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  level: "Junior" | "Middle" | "Senior";
  gender: "Male" | "Female";
  birthday: string;
  fullAge: number;
  imageSrc: string;
  backlogTasks: number;
  tasksInProgress: number;
  tasksInReview: number;
  highlight?: boolean;
}

const emailFromName = (name: string) => `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`;

export const useEmployeeStore = defineStore("employeeStore", {
  state: () => ({
    employees: [
      {
        id: "emp-1",
        name: "Shawn Stone",
        role: "UI/UX Designer",
        department: "USBES",
        level: "Middle",
        gender: "Male",
        birthday: "Apr 12, 1995",
        fullAge: 25,
        imageSrc: "https://randomuser.me/api/portraits/men/1.jpg",
        backlogTasks: 0,
        tasksInProgress: 16,
        tasksInReview: 6,
      },
      {
        id: "emp-2",
        name: "Ready Delgado",
        role: "UI/UX Designer",
        department: "TABLES",
        level: "Junior",
        gender: "Female",
        birthday: "Apr 28, 1998",
        fullAge: 23,
        imageSrc: "https://randomuser.me/api/portraits/women/1.jpg",
        backlogTasks: 1,
        tasksInProgress: 20,
        tasksInReview: 2,
      },
      {
        id: "emp-3",
        name: "Emily Tyler",
        role: "Copywriter",
        department: "USBES",
        level: "Middle",
        gender: "Female",
        birthday: "May 16, 1996",
        fullAge: 24,
        imageSrc: "https://randomuser.me/api/portraits/women/2.jpg",
        backlogTasks: 0,
        tasksInProgress: 20,
        tasksInReview: 2,
        highlight: true,
      },
      {
        id: "emp-4",
        name: "Louis Castro",
        role: "Copywriter",
        department: "SUNC",
        level: "Senior",
        gender: "Male",
        birthday: "Sep 23, 1992",
        fullAge: 28,
        imageSrc: "https://randomuser.me/api/portraits/men/3.jpg",
        backlogTasks: 2,
        tasksInProgress: 20,
        tasksInReview: 2,
      },
      {
        id: "emp-5",
        name: "Nina Brooks",
        role: "UX Researcher",
        department: "INSIGHTS",
        level: "Middle",
        gender: "Female",
        birthday: "Apr 12, 1995",
        fullAge: 25,
        imageSrc: "https://randomuser.me/api/portraits/women/3.jpg",
        backlogTasks: 1,
        tasksInProgress: 14,
        tasksInReview: 3,
      },
      {
        id: "emp-6",
        name: "Carlos Evans",
        role: "Frontend Engineer",
        department: "DEV",
        level: "Senior",
        gender: "Male",
        birthday: "Apr 28, 1998",
        fullAge: 23,
        imageSrc: "https://randomuser.me/api/portraits/men/4.jpg",
        backlogTasks: 0,
        tasksInProgress: 8,
        tasksInReview: 6,
        highlight: true,
      },
      {
        id: "emp-7",
        name: "Sara Jensen",
        role: "Project Manager",
        department: "OPS",
        level: "Middle",
        gender: "Female",
        birthday: "Sep 23, 1992",
        fullAge: 28,
        imageSrc: "https://randomuser.me/api/portraits/women/4.jpg",
        backlogTasks: 1,
        tasksInProgress: 20,
        tasksInReview: 2,
      },
      {
        id: "emp-8",
        name: "Michael Lee",
        role: "Backend Engineer",
        department: "DEV",
        level: "Senior",
        gender: "Male",
        birthday: "Sep 23, 1992",
        fullAge: 28,
        imageSrc: "https://randomuser.me/api/portraits/men/5.jpg",
        backlogTasks: 0,
        tasksInProgress: 4,
        tasksInReview: 6,
      },
    ].map((employee) => ({ ...employee, email: emailFromName(employee.name) })) as Employee[],
  }),
  getters: {
    total: (state) => state.employees.length,
  },
  actions: {
    invite(emails: string[]) {
      // In this mock-data app, invites don't create real accounts — recorded for UI feedback only.
      return emails.filter((email) => email.trim().length > 0);
    },
  },
  persist: {
    key: "pinia-employeeStore",
    storage: localStorage,
  },
});
