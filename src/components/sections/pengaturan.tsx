"use client";

import { useState } from "react";
import { SectionHeader, FlatCard } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  User,
  Bell,
  Plug,
  WifiOff,
  Info,
  Edit,
  RefreshCw,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
  name: string;
  desc: string;
  tone: "info" | "success" | "warning";
  label: string;
}

const integrations: Integration[] = [
  { name: "e-PPGBM", desc: "Sistem pencatatan gizi nasional Dinas Kesehatan", tone: "info", label: "Tersedia" },
  { name: "Sistem Data BGN", desc: "Badan Gizi Nasional — sinkronisasi data sasaran MBG", tone: "success", label: "Terhubung" },
  { name: "Firebase Cloud Messaging", desc: "Push notification untuk pengingat & alert", tone: "warning", label: "Belum dikonfigurasi" },
];

export function PengaturanSection() {
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);

  const handleEditProfil = () => {
    toast.info("[Demo] Form edit profil pengguna akan dibuka (demo).");
  };

  const handleToggle = (label: string, next: boolean) => {
    toast.info(`Notifikasi "${label}" ${next ? "diaktifkan" : "dinonaktifkan"} (demo).`);
  };

  const handleSinkron = () => {
    toast.success("[Demo] Sinkronisasi data lokal ke server pusat berhasil dimulai.");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="SISTEM"
        title="Pengaturan"
        description="Konfigurasi dashboard, notifikasi, dan integrasi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Profil Pengguna */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Profil Pengguna
            </h3>
          </div>
          <div className="flex items-start gap-3">
            <Avatar className="w-16 h-16 rounded-[8px]" style={{ backgroundColor: "var(--color-primary)" }}>
              <AvatarFallback className="rounded-[8px] font-display text-[20px]" style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}>
                RM
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
                dr. Rina Marlina
              </div>
              <div className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                Koordinator Puskesmas Jatinegara
              </div>
              <div className="font-data text-[11px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                rina.marlina@puskesmas-jatinegara.go.id
              </div>
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border h-8 px-3 text-[12px]"
                  style={{ borderColor: "rgba(181,224,234,0.7)", color: "var(--color-primary)" }}
                  onClick={handleEditProfil}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profil
                </Button>
              </div>
            </div>
          </div>
        </FlatCard>

        {/* 2. Preferensi Notifikasi */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Preferensi Notifikasi
            </h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
              <div className="min-w-0">
                <div className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>
                  Pengingat jadwal posyandu
                </div>
                <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  Notifikasi H-1 dan H-0 jadwal posyandu
                </div>
              </div>
              <Switch
                checked={notif1}
                onCheckedChange={(v) => {
                  setNotif1(v);
                  handleToggle("Pengingat jadwal posyandu", v);
                }}
              />
            </li>
            <li className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
              <div className="min-w-0">
                <div className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>
                  Alert balita risiko tinggi
                </div>
                <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  Push alert saat balita naik ke risiko tinggi
                </div>
              </div>
              <Switch
                checked={notif2}
                onCheckedChange={(v) => {
                  setNotif2(v);
                  handleToggle("Alert balita risiko tinggi", v);
                }}
              />
            </li>
            <li className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>
                  Laporan bulanan siap
                </div>
                <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  Notifikasi saat laporan posyandu lengkap
                </div>
              </div>
              <Switch
                checked={notif3}
                onCheckedChange={(v) => {
                  setNotif3(v);
                  handleToggle("Laporan bulanan siap", v);
                }}
              />
            </li>
          </ul>
        </FlatCard>

        {/* 3. Integrasi Sistem */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <Plug className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Integrasi Sistem
            </h3>
          </div>
          <ul className="space-y-3">
            {integrations.map((it) => (
              <li key={it.name} className="flex items-start justify-between gap-3 py-2 border-b last:border-b-0" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>
                    {it.name}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    {it.desc}
                  </div>
                </div>
                <StatusBadge tone={it.tone} dot>{it.label}</StatusBadge>
              </li>
            ))}
          </ul>
        </FlatCard>

        {/* 4. Mode Offline & Sinkronisasi */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <WifiOff className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Mode Offline & Sinkronisasi
            </h3>
          </div>
          <div
            className="p-3 rounded-[8px] border-l-[3px] mb-3"
            style={{
              backgroundColor: "var(--color-info-tint)",
              borderColor: "var(--color-info)",
              borderTop: "1px solid rgba(181,224,234,0.5)",
              borderRight: "1px solid rgba(181,224,234,0.5)",
              borderBottom: "1px solid rgba(181,224,234,0.5)",
            }}
          >
            <p className="text-[13px]" style={{ color: "var(--color-text)" }}>
              Mode offline-first aktif. Data pencatatan disimpan lokal saat tidak ada koneksi
              dan disinkronkan otomatis saat perangkat online.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
                Data tertunda sinkronisasi
              </div>
              <div className="font-display tabular-nums" style={{ fontSize: 22, fontWeight: 500, color: "var(--color-critical)" }}>
                5
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSinkron}
              style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
            >
              <RefreshCw className="w-4 h-4" />
              Sinkronkan Sekarang
            </Button>
          </div>
        </FlatCard>
      </div>

      {/* 5. Tentang Aplikasi */}
      <FlatCard>
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
            Tentang Aplikasi
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Aplikasi
            </div>
            <div className="font-display text-[18px]" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
              NutriKader
            </div>
            <div className="font-data text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              v1.0.0 · build 2026.02
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Lisensi
            </div>
            <div className="text-[13px]" style={{ color: "var(--color-text)" }}>
              Internal · Puskesmas Jatinegara
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("[Demo] Membuka dokumen proposal NutriKader.");
              }}
              className="inline-flex items-center gap-1 text-[12px] mt-1"
              style={{ color: "var(--color-primary)" }}
            >
              <FileText className="w-3.5 h-3.5" />
              Lihat Proposal
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="md:col-span-1">
            <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Deskripsi
            </div>
            <p className="text-[12px]" style={{ color: "var(--color-text)" }}>
              Aplikasi Pendampingan Gizi Balita Berbasis Deteksi Risiko Stunting dan Edukasi
              Pangan Lokal untuk Kader Posyandu. Diusulkan untuk Gemastik XVIII.
            </p>
          </div>
        </div>
      </FlatCard>

      {/* Footer info */}
      <div
        className="rounded-[8px] p-4 border-l-[3px]"
        style={{
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-text-muted)",
          borderTop: "1px solid rgba(7,30,73,0.08)",
          borderRight: "1px solid rgba(7,30,73,0.08)",
          borderBottom: "1px solid rgba(7,30,73,0.08)",
        }}
      >
        <p className="text-[12px] italic" style={{ color: "var(--color-text-muted)" }}>
          Data dalam dashboard ini adalah data ilustratif (mock) untuk keperluan demonstrasi.
          Pada implementasi produksi, data tersinkronisasi dengan basis data pusat dan sistem
          e-PPGBM.
        </p>
      </div>
    </div>
  );
}
