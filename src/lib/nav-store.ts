"use client";

import { create } from "zustand";

// ============================================================
// NUTRIKADER — Navigation state (single route, internal sections)
// ============================================================

export type SectionId =
  | "dashboard"
  | "data-balita"
  | "detail-balita"
  | "kisb"
  | "jadwal"
  | "edukasi"
  | "seminar"
  | "mbg"
  | "laporan"
  | "peta-risiko"
  | "pengaturan";

interface NavState {
  section: SectionId;
  selectedBalitaId: string | null;
  notifOpen: boolean;
  setSection: (s: SectionId) => void;
  openBalita: (id: string, target?: "detail-balita" | "kisb") => void;
  toggleNotif: (v?: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  section: "dashboard",
  selectedBalitaId: null,
  notifOpen: false,
  setSection: (section) => set({ section }),
  openBalita: (id, target = "detail-balita") =>
    set({ selectedBalitaId: id, section: target }),
  toggleNotif: (v) => set((s) => ({ notifOpen: v ?? !s.notifOpen })),
}));
