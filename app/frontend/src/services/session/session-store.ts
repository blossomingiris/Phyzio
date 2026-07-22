import { fetchClient } from "@/shared/api/http-client";
import type { User } from "@/shared/domain/user";
import {
  clearToken,
  getToken,
  setToken,
} from "@/shared/lib/auth/token-storage";
import { ROUTES } from "@/shared/model/routes";
import { create } from "zustand";

type LoginCredentials = { email: string; password: string };

type SessionState = {
  authenticated: boolean;
  user: User | null;
  ready: boolean;
  bootstrap: () => void;
  check: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  authenticated: false,
  user: null,
  ready: false,

  // Fire-and-forget on app start (called once, in main.tsx, before render):
  // restore the session without blocking. No token → nothing to restore,
  // settle immediately with zero network calls.
  bootstrap() {
    if (getToken()) {
      void get().check();
    } else {
      set({ ready: true });
    }
  },

  async check() {
    try {
      // A 401 here is already silently refreshed-and-retried once by
      // http-client.ts's own middleware.
      const { data, error } = await fetchClient.GET("/me/");
      if (error) throw error;
      set({ authenticated: true, user: data });
    } catch {
      clearToken();
      set({ authenticated: false, user: null });
    } finally {
      set({ ready: true });
    }
  },

  async login(credentials) {
    const { data, error } = await fetchClient.POST("/auth/login", {
      body: credentials,
    });
    if (error) throw error;
    setToken(data.token);
    await get().check();
  },

  async logout() {
    try {
      await fetchClient.POST("/auth/logout");
    } finally {
      clearToken();
      set({ authenticated: false, user: null });
      window.location.assign(ROUTES.LOGIN);
    }
  },

  setUser(user) {
    set({ user });
  },
}));
