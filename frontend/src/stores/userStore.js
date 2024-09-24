import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUserStore = create()(persist((set) => ({
    id: undefined,
    fullname: "",
    email: "",
    avatarUrl: null,
    updateProfileImage: (image) => set({ avatarUrl: image }),
    updateUsername: (name) => set({ fullname: name }),
    setUser: (user) => set({
        id: user.id || undefined,
        avatarUrl: user.avatarUrl,
        fullname: user.fullname,
        email: user.email,
    }),
}), {
    name: "user-storage",
}));
