// The real, backend-persisted Folder/Page ("wiki") system -- used by both
// the Info Portal UI and the AI Assistant's page-context/save-as-page
// features (one system, not two; see pages/services.py on the backend).
// Replaces the former infoPortalStore, which only ever mutated local,
// unpersisted, unpermissioned state.
import { defineStore } from "pinia";
import type { ApiResponse } from "@/types/types";
import axiosInstance from "@/plugins/axios";

export type PageFolderColor = "amber" | "emerald" | "cyan" | "violet";

export interface PageBlock {
  type: "heading" | "paragraph" | "list" | "attachment";
  text?: string;
  items?: string[];
  fileName?: string;
}

export interface PageFolder {
  id: string;
  name: string;
  color: PageFolderColor;
  createdBy: string | null;
  createdAt: string;
}

export interface WorkroomPage {
  id: string;
  folderId: string;
  folderName?: string;
  projectId: string | null;
  title: string;
  blocks: PageBlock[];
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type PageFolderApi = { id: string; name: string; color: PageFolderColor; created_by: string | null; created_at: string };
type PageBlockApi = { type: PageBlock["type"]; text?: string; items?: string[]; file_name?: string };
type PageApi = {
  id: string; folder_id: string; folder_name?: string; project_id: string | null; title: string;
  blocks?: PageBlockApi[]; created_by: string | null; created_at: string; updated_at: string;
};

const mapFolder = (api: PageFolderApi): PageFolder => ({
  id: api.id, name: api.name, color: api.color, createdBy: api.created_by, createdAt: api.created_at,
});

const mapBlock = (api: PageBlockApi): PageBlock => ({
  type: api.type, text: api.text, items: api.items, fileName: api.file_name,
});

const mapPage = (api: PageApi): WorkroomPage => ({
  id: api.id,
  folderId: api.folder_id,
  folderName: api.folder_name,
  projectId: api.project_id,
  title: api.title,
  blocks: (api.blocks ?? []).map(mapBlock),
  createdBy: api.created_by,
  createdAt: api.created_at,
  updatedAt: api.updated_at,
});

const blockToApi = (block: PageBlock): PageBlockApi => ({
  type: block.type, text: block.text, items: block.items, file_name: block.fileName,
});

export const usePagesStore = defineStore("pagesStore", {
  state: () => ({
    folders: [] as PageFolder[],
    pagesByFolder: {} as Record<string, WorkroomPage[]>,
    pickerResults: [] as WorkroomPage[],
    loading: false,
    loaded: false,
  }),
  getters: {
    pagesFor: (state) => (folderId: string) => state.pagesByFolder[folderId] || [],
  },
  actions: {
    async fetchFolders() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: PageFolderApi[] }>>("/page-folders/");
        this.folders = data.data.results.map(mapFolder);
        this.loaded = true;
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      } finally {
        this.loading = false;
      }
    },

    async createFolder(name: string, color?: PageFolderColor): Promise<{ folder?: PageFolder; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ folder: PageFolderApi }>>(
          "/page-folders/", { name, color }
        );
        const folder = mapFolder(data.data.folder);
        this.folders = [...this.folders, folder];
        return { folder };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to create the folder" };
      }
    },

    async fetchPages(folderId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: PageApi[] }>>(
          `/page-folders/${folderId}/pages/`
        );
        this.pagesByFolder[folderId] = data.data.results.map(mapPage);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      }
    },

    // The folder listing omits blocks (avoids an N+1 fetch for the sidebar),
    // so viewing a specific page needs this one-off full fetch first --
    // without it every page would render as permanently empty.
    async fetchPage(pageId: string, folderId: string): Promise<{ page?: WorkroomPage; error?: string }> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ page: PageApi }>>(`/pages/${pageId}/`);
        const page = mapPage(data.data.page);
        this.pagesByFolder[folderId] = (this.pagesByFolder[folderId] || []).map((p) => (p.id === page.id ? page : p));
        return { page };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to load the page" };
      }
    },

    async createPage(
      folderId: string, input: { title: string; blocks?: PageBlock[]; projectId?: string }
    ): Promise<{ page?: WorkroomPage; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ page: PageApi }>>(
          `/page-folders/${folderId}/pages/`,
          { title: input.title, blocks: (input.blocks ?? []).map(blockToApi), project_id: input.projectId }
        );
        const page = mapPage(data.data.page);
        this.pagesByFolder[folderId] = [page, ...(this.pagesByFolder[folderId] || [])];
        return { page };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to create the page" };
      }
    },

    async updatePage(
      pageId: string, folderId: string, input: { title?: string; blocks?: PageBlock[] }
    ): Promise<{ page?: WorkroomPage; error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ page: PageApi }>>(`/pages/${pageId}/`, {
          title: input.title, blocks: input.blocks ? input.blocks.map(blockToApi) : undefined,
        });
        const page = mapPage(data.data.page);
        this.pagesByFolder[folderId] = (this.pagesByFolder[folderId] || []).map((p) => (p.id === page.id ? page : p));
        return { page };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update the page" };
      }
    },

    async deletePage(pageId: string, folderId: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.delete(`/pages/${pageId}/`);
        this.pagesByFolder[folderId] = (this.pagesByFolder[folderId] || []).filter((p) => p.id !== pageId);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to delete the page" };
      }
    },

    async shareFolder(folderId: string, userIds: string[]): Promise<{ error?: string }> {
      try {
        await axiosInstance.post(`/page-folders/${folderId}/share/`, { user_ids: userIds });
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to share the folder" };
      }
    },

    async deleteFolder(folderId: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.delete(`/page-folders/${folderId}/`);
        this.folders = this.folders.filter((f) => f.id !== folderId);
        delete this.pagesByFolder[folderId];
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to delete the folder" };
      }
    },

    // Cross-folder search for the "select page from folder" picker modal.
    async searchPages(search = "") {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: PageApi[] }>>("/pages/", {
          params: { search },
        });
        this.pickerResults = data.data.results.map(mapPage);
      } catch (error) {
        console.error("Failed to search pages:", error);
      }
    },
  },
});
