"use client";

import { useState, useEffect } from "react";
import { SectionHeader, FlatCard } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";

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
  const { user, setUser } = useAuth();
  
  // Notification states
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [notif4, setNotif4] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit Profile States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editJabatan, setEditJabatan] = useState("Koordinator Puskesmas");
  const [editPhone, setEditPhone] = useState("");
  const [editFaskes, setEditFaskes] = useState("Puskesmas Jatinegara");

  // Proposal State
  const [isProposalOpen, setIsProposalOpen] = useState(false);

  // Sync inputs with auth user
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const handleToggle = (label: string, next: boolean) => {
    if (next) {
      toast.success(`Notifikasi "${label}" diaktifkan.`);
    } else {
      toast.info(`Notifikasi "${label}" dinonaktifkan.`);
    }
  };

  const handleSinkron = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Sinkronisasi data lokal ke server pusat berhasil!");
    }, 2000);
  };

  const handleSaveProfile = () => {
    if (user) {
      setUser({ ...user, name: editName, email: editEmail });
    }
    setIsEditOpen(false);
    toast.success("Profil berhasil diperbarui!");
  };

  // Safe fallback values if user not present yet
  const displayName = user?.name || "dr. Rina Marlina";
  const displayEmail = user?.email || "rina.marlina@puskesmas-jatinegara.go.id";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

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
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
                {displayName}
              </div>
              <div className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                {editJabatan}
              </div>
              <div className="font-data text-[11px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                {displayEmail}
              </div>
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border h-8 px-3 text-[12px]"
                  style={{ borderColor: "rgba(181,224,234,0.7)", color: "var(--color-primary)" }}
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
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
            <li className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
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
            <li className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>
                  Notifikasi SMS/WhatsApp
                </div>
                <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  Kirim ringkasan mingguan via pesan instan
                </div>
              </div>
              <Switch
                checked={notif4}
                onCheckedChange={(v) => {
                  setNotif4(v);
                  handleToggle("Notifikasi SMS/WhatsApp", v);
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
              disabled={isSyncing}
              style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
            >
              {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
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
            <button
              onClick={() => setIsProposalOpen(true)}
              className="inline-flex items-center gap-1 text-[12px] mt-1 hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              <FileText className="w-3.5 h-3.5" />
              Lihat Proposal
              <ExternalLink className="w-3 h-3" />
            </button>
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

      {/* MODAL EDIT PROFIL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>
              Perbarui informasi profil pengguna di sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Jabatan
              </Label>
              <Input
                id="role"
                value={editJabatan}
                onChange={(e) => setEditJabatan(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                No. WA
              </Label>
              <Input
                id="phone"
                placeholder="0812..."
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="faskes" className="text-right">
                Faskes
              </Label>
              <Input
                id="faskes"
                value={editFaskes}
                onChange={(e) => setEditFaskes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveProfile} style={{ backgroundColor: "var(--color-primary)" }}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL PROPOSAL */}
      <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[var(--color-primary)]">Proposal NutriKader — BGN</DialogTitle>
            <DialogDescription>
              Ikhtisar Eksekutif & Sistem Arsitektur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 text-sm text-[var(--color-text)]">
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 mb-2">1. Overview</h4>
              <p>NutriKader adalah aplikasi pendampingan kader posyandu yang dioptimalkan untuk memonitor tumbuh kembang balita, deteksi dini risiko stunting (faltering growth), dan menyajikan edukasi gizi berbasis pangan lokal, terintegrasi dengan inisiatif Makan Bergizi Gratis (MBG) dari Badan Gizi Nasional (BGN).</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 mb-2">2. Latar Belakang (Background)</h4>
              <p>Angka stunting masih menjadi tantangan kesehatan prioritas di Indonesia. Kader posyandu sebagai garda terdepan seringkali kesulitan dalam mendata secara akurat, menganalisis grafik pertumbuhan secara real-time, serta memberikan rekomendasi makanan bergizi yang relevan dengan ketersediaan lokal.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 mb-2">3. Tujuan (Objectives)</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Mempermudah pencatatan antropometri secara offline-first.</li>
                <li>Meningkatkan akurasi deteksi "weight faltering" sebelum terjadi stunting.</li>
                <li>Mengintegrasikan data balita prioritas ke dalam program pemberian MBG dari BGN.</li>
                <li>Memberdayakan kader dengan modul edukasi responsif.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 mb-2">4. Arsitektur Sistem</h4>
              <p>Menggunakan arsitektur Hybrid App (React Native/PWA) dengan basis data lokal SQLite (WatermelonDB) yang melakukan sinkronisasi asinkron (CRDT) ke cloud server berbasis Node.js/PostgreSQL.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 mb-2">5. Integrasi MBG (Makan Bergizi Gratis) Workflow</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Kader mencatat berat badan dan tinggi badan balita di posyandu.</li>
                <li>Sistem NutriKader mendeteksi anomali pada grafik pertumbuhan (T-Score z-score anjlok).</li>
                <li>Balita yang terindikasi T (Tidak naik) / BGM (Bawah Garis Merah) otomatis di-flag sebagai "Sasaran Prioritas".</li>
                <li>Data dikirim (sinkronisasi) ke endpoint Sistem Data BGN (Badan Gizi Nasional).</li>
                <li>BGN mengalokasikan unit MBG spesifik terapi gizi ke Puskesmas/Dapur Umum terdekat.</li>
                <li>Kader menerima notifikasi bahwa paket MBG siap disalurkan ke keluarga balita tersebut.</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProposalOpen(false)}>Tutup Dokumen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
