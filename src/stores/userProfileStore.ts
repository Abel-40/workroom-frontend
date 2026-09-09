import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

interface ProfileFieldsApi {
  profession: string;
  address: string;
  phone_number: string;
  birthday: string | null;
  skype: string;
  has_resume: boolean;
}

interface ProfileFields {
  profession: string;
  address: string;
  phoneNumber: string;
  birthday: string | null;
  skype: string;
  hasResume: boolean;
}

export interface ProfileUpdateInput {
  profession?: string;
  address?: string;
  phoneNumber?: string;
  birthday?: string | null;
  skype?: string;
}

const EMPTY_PROFILE: ProfileFields = {
  profession: "",
  address: "",
  phoneNumber: "",
  birthday: null,
  skype: "",
  hasResume: false,
};

const mapProfile = (api: ProfileFieldsApi): ProfileFields => ({
  profession: api.profession,
  address: api.address,
  phoneNumber: api.phone_number,
  birthday: api.birthday,
  skype: api.skype,
  hasResume: api.has_resume,
});

// Real backend fields only -- see users.services.PROFILE_UPDATABLE_FIELDS on
// the API side. Position/Location/Skype/Birthday map 1:1 to
// profession/address/skype/birthday; "Company"/"Email" are read-only display
// data sourced from authStore, never edited here (see MyProfileView.vue).
export const useUserProfileStore = defineStore("userProfileStore", {
  state: () => ({
    profile: { ...EMPTY_PROFILE },
    loaded: false,
    loading: false,
    saving: false,
    // Backend-bound preference: whether optional (non-critical) notifications
    // email the caller -- see notifications_and_activity.services.TYPE_CATEGORY.
    // Critical notifications always email regardless of this setting.
    emailNotificationsEnabled: true,
    loadingPreference: false,
  }),
  actions: {
    async fetchProfile() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ profile: ProfileFieldsApi }>>(
          "/company/members/me/profile/"
        );
        this.profile = mapProfile(data.data.profile);
        this.loaded = true;
      } catch (error) {
        // The company owner has no profile row to fetch (see the backend's
        // 'no_profile' error) -- leave the empty defaults rather than
        // surfacing an error for a case that isn't actually broken.
        console.error("Failed to fetch profile:", error);
      } finally {
        this.loading = false;
      }
    },

    async saveProfile(updates: ProfileUpdateInput): Promise<{ error?: string }> {
      this.saving = true;
      try {
        const body: Record<string, string | null> = {};
        if (updates.profession !== undefined) body.profession = updates.profession;
        if (updates.address !== undefined) body.address = updates.address;
        if (updates.phoneNumber !== undefined) body.phone_number = updates.phoneNumber;
        if (updates.birthday !== undefined) body.birthday = updates.birthday;
        if (updates.skype !== undefined) body.skype = updates.skype;
        const { data } = await axiosInstance.patch<ApiResponse<{ profile: ProfileFieldsApi }>>(
          "/company/members/me/profile/",
          body
        );
        this.profile = mapProfile(data.data.profile);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update profile" };
      } finally {
        this.saving = false;
      }
    },

    async uploadResume(file: File): Promise<{ error?: string }> {
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const { data } = await axiosInstance.post<ApiResponse<{ profile: ProfileFieldsApi }>>(
          "/company/members/me/profile/resume/",
          formData
        );
        this.profile = mapProfile(data.data.profile);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to upload resume" };
      } finally {
        this.saving = false;
      }
    },

    // Auth-protected (no public /media/ route on the backend) -- fetched as
    // a blob through axiosInstance (so the Bearer token rides along), same
    // pattern UserCard.vue already uses for profile pictures.
    async downloadResume(filename = "resume"): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.get("/company/members/me/profile/resume/", {
          responseType: "blob",
        });
        const url = URL.createObjectURL(data as Blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to download resume" };
      }
    },

    async fetchEmailPreference(userId: string) {
      this.loadingPreference = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ member: { email_notifications_enabled: boolean } }>>(
          `/company/members/${userId}/`
        );
        this.emailNotificationsEnabled = data.data.member.email_notifications_enabled;
      } catch (error) {
        console.error("Failed to fetch notification preference:", error);
      } finally {
        this.loadingPreference = false;
      }
    },

    async setEmailNotificationsEnabled(enabled: boolean): Promise<{ error?: string }> {
      const previous = this.emailNotificationsEnabled;
      this.emailNotificationsEnabled = enabled;
      this.loadingPreference = true;
      try {
        await axiosInstance.patch<ApiResponse<{ email_notifications_enabled: boolean }>>(
          "/company/members/me/notification-preference/",
          { email_notifications_enabled: enabled }
        );
        return {};
      } catch (error: any) {
        this.emailNotificationsEnabled = previous;
        return { error: error.response?.data?.message || "Failed to update notification preference" };
      } finally {
        this.loadingPreference = false;
      }
    },
  },
});
