"use client";

import { useEffect } from "react";
import { useNav } from "@/lib/nav-store";
import { useAuth } from "@/lib/auth-store";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardSection } from "@/components/sections/dashboard";
import { DataBalitaSection } from "@/components/sections/data-balita";
import { DetailBalitaSection } from "@/components/sections/detail-balita";
import { KisbSection } from "@/components/sections/kisb";
import { JadwalSection } from "@/components/sections/jadwal";
import { EdukasiSection } from "@/components/sections/edukasi";
import { SeminarSection } from "@/components/sections/seminar";
import { MbgSection } from "@/components/sections/mbg";
import { LaporanSection } from "@/components/sections/laporan";
import { PetaRisikoSection } from "@/components/sections/peta-risiko";
import { PengaturanSection } from "@/components/sections/pengaturan";

export function AppShell() {
  const { section, setSection } = useNav();
  const { user } = useAuth();
  const role = user?.role ?? "admin";
  const allowedSections = role === "warga"
    ? new Set(["dashboard", "kisb", "jadwal", "edukasi", "seminar", "mbg"])
    : null;
  const effectiveSection = allowedSections && !allowedSections.has(section)
    ? "dashboard"
    : section;

  useEffect(() => {
    if (effectiveSection !== section) setSection(effectiveSection);
  }, [effectiveSection, section, setSection]);

  useEffect(() => {
    (window as any).__setSection = setSection;
  }, [setSection]);

  return (
    <div className="flex min-h-screen max-w-full overflow-x-hidden" data-role={role} style={{ backgroundColor: "var(--color-bg)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden md:pl-[240px]">
        <Topbar />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-8 lg:pb-10 max-w-[1280px] w-full mx-auto overflow-x-hidden">
          {effectiveSection === "dashboard" && <DashboardSection />}
          {effectiveSection === "data-balita" && <DataBalitaSection />}
          {effectiveSection === "detail-balita" && <DetailBalitaSection />}
          {effectiveSection === "kisb" && <KisbSection />}
          {effectiveSection === "jadwal" && <JadwalSection />}
          {effectiveSection === "edukasi" && <EdukasiSection />}
          {effectiveSection === "seminar" && <SeminarSection />}
          {effectiveSection === "mbg" && <MbgSection />}
          {effectiveSection === "laporan" && <LaporanSection />}
          {effectiveSection === "peta-risiko" && <PetaRisikoSection />}
          {effectiveSection === "pengaturan" && <PengaturanSection />}
        </main>
        <footer
          className="mt-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between gap-1"
          style={{
            color: "var(--color-text-muted)",
            borderTop: "1px solid rgba(181, 224, 234, 0.5)",
            backgroundColor: "var(--color-bg)",
            fontSize: "var(--text-caption)",
          }}
        >
          <span>
            NutriKader — Dashboard Pendampingan Gizi Balita &amp; MBG ·
            <span className="ml-1">Badan Gizi Nasional (BGN)</span>
          </span>
          <span className="font-data">
            Versi 1.1.0 · Balita online/offline; entitas lain mock · {new Date().getFullYear()}
          </span>
        </footer>
      </div>
      <MobileNav />
    </div>
  );
}
