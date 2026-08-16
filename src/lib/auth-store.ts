"use client";

import { create } from "zustand";
import type { AuthUser, UserRole } from "@/lib/auth-types";
import { offlineDb, passwordVerifier } from "@/lib/offline-db";
import type { OfflineAuth } from "@/lib/offline-db";

export type { AuthUser, UserRole } from "@/lib/auth-types";
export type ConnectionMode = "online" | "offline";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  connectionMode: ConnectionMode;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;
  restoreSession: () => void;
}

async function cacheOfflineLogin(user: AuthUser, password: string) {
  const salt = crypto.randomUUID();
  const verifier = await passwordVerifier(password, salt);
  const record: OfflineAuth = { id: "current", user, verifier, salt };
  await offlineDb.putAuth(record);
}

async function localLogin(email: string, password: string): Promise<AuthUser | null> {
  const cached = await offlineDb.getAuth();
  if (!cached) return null;
  const verifier = await passwordVerifier(password, cached.salt);
  return verifier === cached.verifier && cached.user.email === email.trim().toLowerCase()
    ? cached.user
    : null;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  connectionMode: typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline",

  restoreSession: () => {
    if (typeof window === "undefined") return;

    const restore = async () => {
      const online = navigator.onLine;
      set({ connectionMode: online ? "online" : "offline" });

      if (online) {
        try {
          const response = await fetch("/api/auth", { cache: "no-store" });
          if (response.ok) {
            const body = await response.json();
            if (body.user) {
              set({ user: body.user, connectionMode: "online" });
              return;
            }
            await offlineDb.clearAuth().catch(() => undefined);
            set({ user: null, connectionMode: "online" });
            return;
          }

          await offlineDb.clearAuth().catch(() => undefined);
          set({ user: null, connectionMode: "online" });
          return;
        } catch {
          set({ connectionMode: "offline" });
        }
      }

      try {
        const cached = await offlineDb.getAuth();
        if (cached) set({ user: cached.user, connectionMode: "offline" });
      } catch {
        set({ user: null });
      }
    };

    void restore();
  },

  login: async (email, password) => {
    if (typeof window === "undefined") return false;

    set({
      isLoading: true,
      error: null,
      connectionMode: navigator.onLine ? "online" : "offline",
    });

    const normalizedEmail = email.trim().toLowerCase();

    if (navigator.onLine) {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 5000);
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
          signal: controller.signal,
        });
        window.clearTimeout(timeout);
        const data = await res.json();

        if (res.ok && data.success) {
          await cacheOfflineLogin(data.user, password);
          set({ user: data.user, isLoading: false, error: null, connectionMode: "online" });
          return true;
        }

        set({
          isLoading: false,
          error: data.error || "Email atau password salah.",
          connectionMode: "online",
        });
        return false;
      } catch {
        set({ connectionMode: "offline" });
      }
    }

    try {
      const user = await localLogin(normalizedEmail, password);
      if (!user) {
        set({
          isLoading: false,
          error: "Offline login membutuhkan minimal satu login online sebelumnya pada perangkat ini.",
          connectionMode: "offline",
        });
        return false;
      }

      set({ user, isLoading: false, error: null, connectionMode: "offline" });
      return true;
    } catch {
      set({ isLoading: false, error: "Penyimpanan offline tidak tersedia.", connectionMode: "offline" });
      return false;
    }
  },

  logout: async () => {
    try {
      if (navigator.onLine) {
        await fetch("/api/auth", { method: "DELETE" });
      }
    } catch {
      // Offline logout still clears the local cached identity.
    }
    await offlineDb.clearAuth().catch(() => undefined);
    set({ user: null, error: null });
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));

if (typeof window !== "undefined") {
  window.addEventListener("online", () => useAuth.setState({ connectionMode: "online" }));
  window.addEventListener("offline", () => useAuth.setState({ connectionMode: "offline" }));
}
