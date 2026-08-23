import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export const useUserProfileStore = defineStore("userProfileStore", {
  state: () => ({
    profile: {
      position: "UI/UX Designer",
      company: "Cadabra",
      location: "NYC, New York, USA",
      birthdayDate: "1996-05-19",
      email: "",
      mobileNumber: "+1 675 346 23-10",
      skype: "",
    },
    // Backend-bound preference: whether optional (non-critical) notifications
    // email the caller -- see notifications_and_activity.services.TYPE_CATEGORY.
    // Critical notifications always email regardless of this setting.
    emailNotificationsEnabled: true,
    loadingPreference: false,
  }),
  actions: {
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
  persist: {
    key: "pinia-userProfileStore",
    storage: localStorage,
    pick: ["profile"],
  },
});
