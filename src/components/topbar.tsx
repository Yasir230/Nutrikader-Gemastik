"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useNav } from "@/lib/nav-store";
import { useAuth, type UserRole } from "@/lib/auth-store";
import { balitaData, notifikasiData } from "@/lib/mock-data";
import { RiskBadge } from "./status-badge";
import { Search, Bell, LogOut, HeartPulse, ChevronRight, Menu } from "lucide-react";
import { formatTanggal } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { groups } from "@/lib/nav-data";
import { cn } from "@/lib/utils";

const sectionTitle: Record<string, { crumb: string; title: string }> = {
  dashboard: { crumb: "Operasional", title: "Dashboard" },
  "data-balita": { crumb: "Operasional", title: "Data Balita" },
  "detail-balita": { crumb: "Operasional / Data Balita", title: "Detail Pertumbuhan Balita" },
  kisb: { crumb: "Operasional", title: "Kartu Indonesia Sehat Balita (KISB)" },
  jadwal: { crumb: "Operasional", title: "Jadwal Posyandu" },
  edukasi: { crumb: "Edukasi & Seminar", title: "Edukasi Gizi Pangan Lokal" },
  seminar: { crumb: "Edukasi & Seminar", title: "Seminar Gizi Gratis" },
  mbg: { crumb: "MBG & Laporan", title: "Integrasi Program MBG" },
  laporan: { crumb: "MBG & Laporan", title: "Laporan Bulanan" },
  "peta-risiko": { crumb: "MBG & Laporan", title: "Peta Sebaran Risiko Stunting" },
  pengaturan: { crumb: "Sistem", title: "Pengaturan" },
};

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function Topbar() {
  const { section, setSection, openBalita, notifOpen, toggleNotif } = useNav();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const meta = sectionTitle[section] ?? sectionTitle.dashboard;

  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    const needle = q.toLowerCase();
    return balitaData
      .filter(
        (b) =>
          b.nama.toLowerCase().includes(needle) ||
          b.nik.includes(needle) ||
          b.namaIbu.toLowerCase().includes(needle)
      )
      .slice(0, 6);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = notifikasiData.filter((n) => !n.dibaca).length;

  if (!user) return null;

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 lg:px-8 py-3"
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid rgba(181, 224, 234, 0.5)",
      }}
    >
      {/* Mobile brand */}
      <div className="md:hidden flex items-center gap-2">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="p-1.5 -ml-1.5 rounded-md hover:bg-[var(--color-info-tint)] text-[var(--color-text-muted)]"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
            <SheetHeader className="p-4 text-left border-b border-[rgba(181,224,234,0.5)]">
              <SheetTitle className="font-display text-[var(--color-primary)] flex items-center gap-2" style={{ fontWeight: 500, fontSize: "var(--text-heading)" }}>
                <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 bg-[var(--color-success)]">
                  <HeartPulse className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                NutriKader
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4 scroll-thin">
              <nav className="space-y-6 px-4">
                {groups.map((group) => {
                  const visibleItems = group.items.filter((item) =>
                    item.roles.includes(user.role as UserRole)
                  );
                  if (visibleItems.length === 0) return null;
                  return (
                    <div key={group.eyebrow}>
                      <h4 className="text-[var(--color-text-muted)] text-[var(--text-eyebrow)] font-semibold mb-2">
                        {group.eyebrow}
                      </h4>
                      <ul className="space-y-1">
                        {visibleItems.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                setSection(item.id);
                                setSheetOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[var(--text-body)]",
                                section === item.id
                                  ? "bg-[var(--color-primary)] text-white font-medium"
                                  : "text-[var(--color-text)] hover:bg-[var(--color-info-tint)]"
                              )}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div
          className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-success)" }}
        >
          <HeartPulse className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
        </div>
        <span className="font-display" style={{ color: "var(--color-primary)", fontWeight: 500, fontSize: "var(--text-heading)" }}>
          NutriKader
        </span>
      </div>

      {/* Breadcrumb + title (desktop) */}
      <div className="hidden md:block min-w-0 flex-shrink-0">
        <nav className="flex items-center gap-1" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }} aria-label="Breadcrumb">
          <span>NutriKader</span>
          <ChevronRight className="w-3 h-3" />
          <span>{meta.crumb}</span>
        </nav>
        <h1 className="font-display leading-tight mt-0.5" style={{ color: "var(--color-primary)", fontWeight: 500, fontSize: "var(--text-display-sm)" }}>
          {meta.title}
        </h1>
      </div>

      {/* Search — global NIK/nama (KF-13) */}
      <div ref={searchRef} className="relative flex-1 max-w-xl ml-auto md:ml-4 lg:ml-6">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[8px] border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "rgba(7, 30, 73, 0.14)",
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--color-text-muted)" }} />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Cari balita berdasarkan NIK / nama / nama ibu…"
            className="flex-1 bg-transparent outline-none placeholder:text-[var(--color-text-muted)] min-w-0"
            style={{ fontSize: "var(--text-body)" }}
            aria-label="Cari data balita berdasarkan NIK atau nama"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setShowResults(false);
              }}
              className="p-0.5 min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex items-center justify-center"
              aria-label="Hapus pencarian"
            >
              {/* Using X via inline SVG to avoid import issue */}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-muted)" }}>
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {showResults && q.trim().length >= 2 && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 rounded-[8px] border max-h-96 overflow-y-auto scroll-thin z-50"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "rgba(7, 30, 73, 0.12)",
              boxShadow: "0 8px 24px rgba(7,30,73,0.12)",
            }}
            role="listbox"
            aria-label="Hasil pencarian balita"
          >
            {results.length === 0 ? (
              <div className="p-4" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-body)" }}>
                Tidak ditemukan balita dengan kata kunci <strong>&ldquo;{q}&rdquo;</strong>.
                Coba gunakan NIK 16 digit atau nama lengkap.
              </div>
            ) : (
              <ul className="py-1">
                {results.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => {
                        openBalita(b.id);
                        setShowResults(false);
                        setQ("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[var(--color-info-tint)] transition-colors flex items-center justify-between gap-3"
                      role="option"
                      aria-selected="false"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate" style={{ color: "var(--color-text)", fontSize: "var(--text-body)" }}>
                          {b.nama}
                        </div>
                        <div className="font-data truncate" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-data)" }}>
                          NIK {b.nik} · {b.posyanduNama} · Usia {b.usiaBulan} bln
                        </div>
                      </div>
                      <RiskBadge level={b.risiko} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Notification */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleNotif()}
          className="relative p-2 rounded-[8px] border min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex items-center justify-center"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "rgba(7, 30, 73, 0.14)",
            color: "var(--color-primary)",
          }}
          aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
          aria-expanded={notifOpen}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full font-semibold flex items-center justify-center"
              style={{ backgroundColor: "var(--color-critical)", color: "#FFFFFF", fontSize: "var(--text-eyebrow)" }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute top-full right-0 mt-1.5 w-[340px] max-w-[calc(100vw-2rem)] rounded-[8px] border z-50"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "rgba(7, 30, 73, 0.12)",
              boxShadow: "0 8px 24px rgba(7,30,73,0.16)",
            }}
            role="dialog"
            aria-label="Notifikasi"
          >
            <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
              <span className="font-semibold" style={{ color: "var(--color-primary)", fontSize: "var(--text-body)" }}>
                Notifikasi
              </span>
              <button
                type="button"
                onClick={() => toggleNotif(false)}
                className="flex items-center justify-center"
                style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}
              >
                Tutup
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto scroll-thin">
              {notifikasiData.map((n) => {
                const toneColor =
                  n.level === "critical" ? "var(--color-critical)" :
                  n.level === "warning" ? "var(--color-warning)" :
                  n.level === "success" ? "var(--color-success)" :
                  "var(--color-info)";
                return (
                  <li
                    key={n.id}
                    className="px-3 py-2.5 border-b last:border-b-0 cursor-pointer hover:bg-[var(--color-info-tint)]"
                    style={{ borderColor: "rgba(181,224,234,0.3)" }}
                  >
                    <div className="flex gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: toneColor }} aria-hidden />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate" style={{ color: "var(--color-text)", fontSize: "var(--text-caption)" }}>
                            {n.judul}
                          </span>
                          {!n.dibaca && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--color-critical)" }} aria-label="Belum dibaca" />
                          )}
                        </div>
                        <p className="mt-0.5 leading-snug" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
                          {n.pesan}
                        </p>
                        <div className="font-data mt-1" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-data)" }}>
                          {n.waktu}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                toggleNotif(false);
                setSection("peta-risiko");
              }}
              className="w-full px-3 py-2 text-center border-t hover:bg-[var(--color-info-tint)]"
              style={{ borderColor: "rgba(181,224,234,0.5)", color: "var(--color-primary)", fontSize: "var(--text-caption)" }}
            >
              Lihat semua aktivitas →
            </button>
          </div>
        )}
      </div>

      {/* User avatar + logout (desktop) */}
      <div className="hidden md:flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
          style={{ backgroundColor: user.role === "admin" ? "var(--color-warning)" : "var(--color-success)", color: "var(--color-primary)", fontSize: "var(--text-caption)" }}
          aria-label={`Akun: ${user.name}`}
        >
          {getInitials(user.name)}
        </div>
        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-[6px] border hover:bg-[var(--color-info-tint)] transition-colors min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex items-center justify-center"
          style={{
            borderColor: "rgba(7, 30, 73, 0.14)",
            color: "var(--color-text-muted)",
          }}
          aria-label="Keluar dari akun"
          title="Keluar"
        >
          <LogOut className="shrink-0" style={{ width: "var(--icon-action)", height: "var(--icon-action)" }} />
        </button>
      </div>

      {/* Logout button (mobile) */}
      <button
        type="button"
        onClick={logout}
        className="md:hidden p-2 rounded-[6px] border min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex items-center justify-center"
        style={{
          borderColor: "rgba(7, 30, 73, 0.14)",
          color: "var(--color-text-muted)",
          backgroundColor: "#FFFFFF",
        }}
        aria-label="Keluar dari akun"
        title="Keluar"
      >
        <LogOut className="shrink-0" style={{ width: "var(--icon-action)", height: "var(--icon-action)" }} />
      </button>
    </header>
  );
}
