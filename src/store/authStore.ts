import { create } from "zustand";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "organizer" | "scorer" | "spectator";
  phone?: string;
  organization?: string;
  avatar?: string;
}

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  setUser: (user: UserInfo | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null });
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  },
}));
