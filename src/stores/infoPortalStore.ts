import { defineStore } from "pinia";

export type FolderColor = "amber" | "emerald" | "cyan" | "violet";

export interface InfoPageBlock {
  type: "heading" | "paragraph" | "list" | "attachment";
  text?: string;
  items?: string[];
  fileName?: string;
}

export interface InfoPage {
  id: string;
  title: string;
  lastModified: string;
  blocks: InfoPageBlock[];
}

export interface InfoFolder {
  id: string;
  name: string;
  color: FolderColor;
  pages: InfoPage[];
}

const defaultPages = (topic: string): InfoPage[] => [
  {
    id: `${topic}-technical-task`,
    title: "Technical task",
    lastModified: "2025-05-12",
    blocks: [
      { type: "heading", text: "Requirements for website design" },
      {
        type: "paragraph",
        text: "When developing the site, predominantly light styles should be used. The main sections of the site should be accessible from the first page. The first page should not contain a lot of text information.",
      },
      { type: "paragraph", text: "The site design should not include:" },
      { type: "list", items: ["flashing banners", "a lot of merging text"] },
      { type: "heading", text: "Requirements for site presentation" },
      {
        type: "paragraph",
        text: "The main page of the site must contain a content area so that a site visitor from the first page can get acquainted with the latest news of the company.",
      },
      { type: "attachment", fileName: "wireframes.png" },
      { type: "heading", text: "Access sharing requirements" },
      {
        type: "paragraph",
        text: "All published sections of the site must be open for read access without user authentication. When an unauthenticated user tries to enter a private section, a login and password will be requested. After passing the authentication, the system must check the user's authority to access the requested partition. If access is denied, a message should be displayed to the user about the inability to access the private section.",
      },
    ],
  },
  { id: `${topic}-project-spec`, title: "Project Specification", lastModified: "2025-05-24", blocks: [{ type: "paragraph", text: "Project specification is being drafted." }] },
  { id: `${topic}-customer-req`, title: "Customer Requirements", lastModified: "2025-06-08", blocks: [{ type: "paragraph", text: "Customer requirements go here." }] },
  { id: `${topic}-work-process`, title: "Work Process", lastModified: "2025-08-18", blocks: [{ type: "paragraph", text: "Work process notes go here." }] },
  { id: `${topic}-reports`, title: "Reports", lastModified: "2025-08-01", blocks: [{ type: "paragraph", text: "Reports go here." }] },
];

export const useInfoPortalStore = defineStore("infoPortalStore", {
  state: () => ({
    folders: [
      { id: "folder-1", name: "Medical App", color: "amber", pages: defaultPages("medical") },
      { id: "folder-2", name: "Fortune website", color: "emerald", pages: defaultPages("fortune") },
      { id: "folder-3", name: "Planner App", color: "cyan", pages: defaultPages("planner") },
      { id: "folder-4", name: "Time tracker - personal account", color: "violet", pages: defaultPages("timetracker") },
    ] as InfoFolder[],
  }),
  actions: {
    addFolder(name: string) {
      const colors: FolderColor[] = ["amber", "emerald", "cyan", "violet"];
      const folder: InfoFolder = {
        id: `folder-${Date.now()}`,
        name,
        color: colors[this.folders.length % colors.length],
        pages: [],
      };
      this.folders.push(folder);
      return folder;
    },
    addPage(folderId: string, title: string) {
      const folder = this.folders.find((f) => f.id === folderId);
      if (!folder) return;
      const page: InfoPage = {
        id: `page-${Date.now()}`,
        title,
        lastModified: new Date().toISOString().slice(0, 10),
        blocks: [{ type: "paragraph", text: "" }],
      };
      folder.pages.push(page);
      return page;
    },
  },
  persist: {
    key: "pinia-infoPortalStore",
    storage: localStorage,
  },
});
