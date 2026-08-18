import { defineStore } from "pinia";

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
    notifications: {
      issueActivity: true,
      trackingActivity: false,
      newComments: false,
      muteAfter9pm: true,
    },
  }),
  persist: {
    key: "pinia-userProfileStore",
    storage: localStorage,
  },
});
