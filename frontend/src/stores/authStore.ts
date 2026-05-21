"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types/auth";

interface AuthStoreState {
  user:    AuthUser | null;
  token:   string | null;
  setAuth: (token: string, user: AuthUser) => void;
  clear:   () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setAuth: (token, user) => {
        set({ token, user });
        // Write role cookie so Next.js middleware can protect /admin without localStorage
        document.cookie = `colombia-auth-role=${user.role}; path=/; SameSite=Lax`;
      },

      clear: () => {
        set({ token: null, user: null });
        document.cookie = "colombia-auth-role=; path=/; max-age=0";
      },

      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "colombia-auth",
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
