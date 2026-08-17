"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionHeader, FlatCard } from "@/components/section";
import { PitaCapaian } from "@/components/pita-capaian";
import { StatusBadge } from "@/components/status-badge";
import { useNav } from "@/lib/nav-store";
import { useAuth } from "@/lib/auth-store";
import {
  balitaData,
  formatTanggal,
} from "@/lib/mock-data";
import type { Balita } from "@/lib/types";
import {
  HeartPulse,
  Download,
  Share2,
  QrCode,
  ChevronRight,
  Syringe,
  UtensilsCrossed,
  Ruler,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Users,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

// ============================================================
// KISB Section — Kartu Indonesia Sehat Balita Digital (KF-10, MVP #11)
// Identitas digital balita berbasis NIK: antropometri, imunisasi,
// status risiko, penerimaan MBG — sejak lahir hingga keluar posyandu.
// ============================================================

// Placeholder removed in favor of real QRCode

// Inisial nama untuk avatar
function getInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Imunisasi seharusnya sesuai usia (mengikuti skema genImunisasi)
const SKEMA_IMUNISASI_USIA = [
  { nama: "Hepatitis B 0", usia: 0 },
  { nama: "BCG", usia: 1 },
  { nama: "Polio 1", usia: 2 },
  { nama: "DPT-HB-Hib 1", usia: 2 },
  { nama: "Polio 2", usia: 3 },
  { nama: "DPT-HB-Hib 2", usia: 3 },
  { nama: "Polio 3", usia: 4 },
  { nama: "DPT-HB-Hib 3", usia: 4 },
  { nama: "Polio 4", usia: 6 },
  { nama: "Campak", usia: 9 },
  { nama: "Campak Lanjutan", usia: 18 },
];

function computeImunisasiPct(b: Balita): number {
  const seharusnya = SKEMA_IMUNISASI_USIA.filter((s) => s.usia <= b.usiaBulan).length;
  if (seharusnya === 0) return 100;
  const lengkap = b.imunisasi.filter((i) => i.status === "lengkap").length;
  return Math.round((Math.min(lengkap, seharusnya) / seharusnya) * 100);
}

function jenisKelaminLabel(jk: "L" | "P"): string {
  return jk === "L" ? "Laki-laki" : "Perempuan";
}

export function KisbSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { selectedBalitaId, openBalita } = useNav();
  const [activeId, setActiveId] = useState<string>(
    isAdmin ? (selectedBalitaId ?? balitaData[0]?.id ?? "") : (balitaData[0]?.id ?? "")
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const balita = useMemo(
    () => balitaData.find((b) => b.id === activeId) ?? balitaData[0],
    [activeId]
  );

  if (!balita) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="OPERASIONAL"
          title="Kartu Indonesia Sehat Balita (KISB) Digital"
        />
        <FlatCard>
          <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            Belum ada data balita tersedia.
          </p>
        </FlatCard>
      </div>
    );
  }

  const pengukuranTerakhir = balita.pengukuran[balita.pengukuran.length - 1];
  const imunisasiTerakhir = [...balita.imunisasi]
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
    .slice(0, 3);
  const imunisasiPct = computeImunisasiPct(balita);
  const mbgTerakhir = [...balita.penerimaanMBG]
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
    .slice(0, 3);
  const totalPorsiMBG = balita.penerimaanMBG.reduce((s, m) => s + m.porsi, 0);
  const tanggalDiperbarui = pengukuranTerakhir?.tanggal ?? balita.tanggalLahir;
  const nomorKartu = `KISB-${balita.nik.slice(-6)}`;

  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = `https://nutrikader-gemastik.vercel.app/kisb/${balita.nik}?ts=${Date.now()}&sig=VERIFIED`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#071E49',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error(err);
      }
    };
    if (balita) generateQr();
  }, [balita]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    toast.info("Menyiapkan unduhan...");
    try {
      let canvas: HTMLCanvasElement | null = null;
      try {
        canvas = await (html2canvas as any)(cardRef.current, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#041533',
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });
      } catch (err) {
        console.warn("html2canvas error, falling back to Canvas 2D:", err);
      }
      
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 420;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D not supported");
        
        // Background and border
        ctx.fillStyle = "#041533";
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Header Icon
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(60, 60, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Header Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 22px serif";
        ctx.fillText("KARTU INDONESIA SEHAT BALITA", 95, 55);
        
        ctx.fillStyle = "#10b981";
        ctx.font = "14px sans-serif";
        ctx.fillText("NutriKader · ", 95, 75);
        ctx.fillStyle = "rgba(165, 243, 252, 0.8)";
        ctx.fillText("Badan Gizi Nasional", 185, 75);
        
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("NO. KARTU", 580, 50);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px monospace";
        ctx.fillText(nomorKartu, 580, 70);
        
        // Divider
        ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(40, 100); ctx.lineTo(760, 100); ctx.stroke();
        
        // Avatar
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(70, 150, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#071E49";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(getInitials(balita.nama), 70, 157);
        ctx.textAlign = "left";
        
        // Name
        ctx.font = "bold 24px serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(balita.nama, 115, 157);
        
        // Metadata Rows
        const drawRow = (label: string, value: string, y: number) => {
          ctx.fillStyle = "#10b981";
          ctx.font = "14px sans-serif";
          ctx.fillText(label, 40, y);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = label === "NIK" ? "bold 15px monospace" : "14px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(value, 500, y);
          ctx.textAlign = "left";
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.beginPath(); ctx.moveTo(40, y + 10); ctx.lineTo(500, y + 10); ctx.stroke();
        };
        
        drawRow("NIK", balita.nik, 210);
        drawRow("Tgl. Lahir", formatTanggal(balita.tanggalLahir), 245);
        drawRow("Jenis Kelamin", jenisKelaminLabel(balita.jenisKelamin), 280);
        drawRow("Posyandu", balita.posyanduNama, 315);
        
        // Vertical Divider
        ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
        ctx.beginPath(); ctx.moveTo(540, 130); ctx.lineTo(540, 320); ctx.stroke();
        
        // QR Code
        if (qrDataUrl) {
          const img = new Image();
          await new Promise((res) => { img.onload = res; img.src = qrDataUrl; });
          
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(580, 130, 140, 140, 12);
          ctx.fill();
          
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.drawImage(img, 590, 140, 120, 120);
          
          ctx.fillStyle = "#10b981";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✓ TERVERIFIKASI BGN", 650, 295);
          ctx.textAlign = "left";
        }
        
        // Bottom Divider
        ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(40, 350); ctx.lineTo(760, 350); ctx.stroke();
        
        // Footer Badges
        ctx.fillStyle = "rgba(6, 78, 59, 0.6)";
        ctx.beginPath(); ctx.roundRect(40, 370, 130, 26, 6); ctx.fill();
        ctx.fillStyle = "#6ee7b7";
        ctx.font = "12px sans-serif";
        ctx.fillText("● " + (balita.risiko === "tinggi" ? "Risiko Tinggi" : balita.risiko === "sedang" ? "Risiko Sedang" : "Risiko Rendah"), 50, 388);
        
        ctx.fillStyle = "rgba(23, 37, 84, 0.6)";
        ctx.beginPath(); ctx.roundRect(180, 370, 130, 26, 6); ctx.fill();
        ctx.fillStyle = "#93c5fd";
        ctx.fillText("● " + (balita.statusPosyandu === "aktif" ? "Aktif Posyandu" : "Lulus Posyandu"), 190, 388);
        
        ctx.fillStyle = "rgba(165, 243, 252, 0.8)";
        ctx.textAlign = "right";
        ctx.fillText(`Diperbarui: ${formatTanggal(tanggalDiperbarui)}`, 760, 388);
        ctx.textAlign = "left";
      }

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `KISB-${balita.nama.replace(/\s+/g, "_")}-${nomorKartu}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Berhasil mengunduh Kartu KISB (PNG)!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunduh KISB.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const statusGiziStr = (balita as any).statusGizi || "Baik";
    const text = `*KARTU INDONESIA SEHAT BALITA (KISB) DIGITAL*
Badan Gizi Nasional (BGN) & Puskesmas Jatinegara

Nama Balita: ${balita.nama}
NIK: ${balita.nik}
Status Gizi: ${statusGiziStr} (Risiko ${balita.risiko.toUpperCase()})
Nomor KISB: ${nomorKartu}
Posyandu: ${balita.posyanduNama}

Pantau gizi & jadwal imunisasi balita Anda secara berkala.
Verifikasi kartu: https://nutrikader-gemastik.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Membuka WhatsApp untuk membagikan KISB.");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="OPERASIONAL"
        title="Kartu Indonesia Sehat Balita (KISB) Digital"
        description="Identitas digital balita berbasis NIK — memuat riwayat antropometri, imunisasi, status risiko, dan penerimaan MBG sejak lahir hingga keluar posyandu."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="border-[rgba(7,30,73,0.14)] text-[var(--color-primary)] hover:bg-[var(--color-info-tint)]"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Memproses..." : "Unduh KISB (PNG)"}
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              className="bg-[var(--color-success)] text-[var(--color-primary)] hover:opacity-90"
            >
              <Share2 className="w-4 h-4" />
              Bagikan ke Ibu Balita
            </Button>
          </div>
        }
      />

      {/* Pemilih balita */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label
            className="text-[12px] font-medium uppercase tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
            htmlFor="kisb-balita-select"
          >
            Pilih Balita
          </label>
          <Select value={activeId} onValueChange={setActiveId}>
            <SelectTrigger
              id="kisb-balita-select"
              className="w-full sm:w-[360px] h-9 border-[rgba(7,30,73,0.14)] bg-white text-[var(--color-text)]"
            >
              <SelectValue placeholder="Pilih balita" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {balitaData.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  <span className="truncate">{b.nama} — NIK {b.nik}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Kartu KISB visual (signature visual) */}
      <div
        id="kisb-card-visual"
        ref={cardRef}
        className="relative bg-[#041533] border border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-7"
        aria-label={`Kartu KISB ${balita.nama}`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[var(--color-success)] text-[#071E49] flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="font-display font-bold text-[18px] sm:text-[20px] text-white tracking-wide leading-tight">
                KARTU INDONESIA SEHAT BALITA
              </div>
              <div className="mt-0.5 leading-tight">
                <span className="text-[var(--color-success)] text-[12px] font-medium">NutriKader</span>
                <span className="text-cyan-200/80 text-[12px]"> · Badan Gizi Nasional</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 flex flex-col justify-center">
            <div className="text-[11px] font-semibold text-[var(--color-success)] tracking-wider uppercase">
              No. Kartu
            </div>
            <div className="text-[16px] sm:text-[18px] font-bold text-white font-mono leading-tight">
              {nomorKartu}
            </div>
          </div>
        </div>

        <div className="border-b border-cyan-500/20 my-4"></div>

        {/* Body Grid */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-success)] text-[#071E49] font-bold text-xl flex items-center justify-center shrink-0">
                {getInitials(balita.nama)}
              </div>
              <div className="font-display text-[22px] sm:text-[24px] font-bold text-white leading-tight">
                {balita.nama}
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-sm gap-2">
                <span className="text-[var(--color-success)] font-medium flex items-center gap-2 shrink-0">
                  <User className="w-4 h-4" /> NIK
                </span>
                <span className="text-white font-mono font-bold text-[15px] text-right">{balita.nik}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-sm gap-2">
                <span className="text-[var(--color-success)] font-medium flex items-center gap-2 shrink-0">
                  <Calendar className="w-4 h-4" /> Tgl. Lahir
                </span>
                <span className="text-white font-medium text-right">{formatTanggal(balita.tanggalLahir)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-sm gap-2">
                <span className="text-[var(--color-success)] font-medium flex items-center gap-2 shrink-0">
                  <UserCheck className="w-4 h-4" /> Jenis Kelamin
                </span>
                <span className="text-white font-medium text-right">{jenisKelaminLabel(balita.jenisKelamin)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-sm gap-2">
                <span className="text-[var(--color-success)] font-medium flex items-center gap-2 shrink-0">
                  <Users className="w-4 h-4" /> Posyandu
                </span>
                <span className="text-white font-medium text-right">{balita.posyanduNama}</span>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-[1px] bg-cyan-500/20 mx-4 self-stretch"></div>

          {/* Right Column (QR Verification Hub) */}
          <div className="flex flex-col items-center justify-center sm:w-[200px] shrink-0 mt-4 sm:mt-0">
            <div className="p-2 bg-white rounded-2xl border-2 border-[var(--color-success)] shadow-md inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Verifikasi KISB"
                  className="w-36 h-36 sm:w-40 sm:h-40 block object-contain"
                />
              ) : (
                <div className="w-36 h-36 sm:w-40 sm:h-40 bg-gray-100 animate-pulse rounded-xl" />
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-success)] tracking-wider mt-2.5">
              <ShieldCheck className="w-4 h-4" />
              TERVERIFIKASI BGN
            </div>
          </div>
        </div>

        {/* Footer Row */}
        <div className="border-t border-cyan-500/20 mt-4 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-semibold px-3 py-1 rounded-lg text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {balita.risiko === "tinggi" ? "Risiko Tinggi" : balita.risiko === "sedang" ? "Risiko Sedang" : "Risiko Rendah"}
            </div>
            <div className="bg-blue-950/60 border border-blue-500/50 text-blue-300 font-semibold px-3 py-1 rounded-lg text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              {balita.statusPosyandu === "aktif" ? "Aktif Posyandu" : "Lulus Posyandu"}
            </div>
          </div>
          <div className="text-xs text-cyan-200/80 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Diperbarui: {formatTanggal(tanggalDiperbarui)}
          </div>
        </div>
      </div>

      {/* Grid 3 info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Riwayat Antropometri Terkini */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center justify-center"
              style={{ color: "var(--color-primary)" }}
              aria-hidden
            >
              <Ruler className="w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Riwayat Antropometri Terkini
            </h3>
          </div>
          {pengukuranTerakhir ? (
            <>
              <div className="text-[11px] mb-3" style={{ color: "var(--color-text-muted)" }}>
                Pengukuran {formatTanggal(pengukuranTerakhir.tanggal)} · Usia {pengukuranTerakhir.usiaBulan} bulan
              </div>
              <dl className="grid grid-cols-[1fr_auto] gap-y-2.5 gap-x-4 text-[13px]">
                <dt className="whitespace-nowrap shrink-0 text-left" style={{ color: "var(--color-text-muted)" }}>Berat Badan</dt>
                <dd className="text-right font-data" style={{ color: "var(--color-text)" }}>
                  {pengukuranTerakhir.beratBadan.toLocaleString("id-ID")} kg
                </dd>
                <dt className="whitespace-nowrap shrink-0 text-left" style={{ color: "var(--color-text-muted)" }}>Tinggi Badan</dt>
                <dd className="text-right font-data" style={{ color: "var(--color-text)" }}>
                  {pengukuranTerakhir.tinggiBadan.toLocaleString("id-ID")} cm
                </dd>
                <dt className="whitespace-nowrap shrink-0 text-left" style={{ color: "var(--color-text-muted)" }}>Lingkar Kepala</dt>
                <dd className="text-right font-data" style={{ color: "var(--color-text)" }}>
                  {pengukuranTerakhir.lingkarKepala.toLocaleString("id-ID")} cm
                </dd>
                <dt className="whitespace-nowrap shrink-0 text-left" style={{ color: "var(--color-text-muted)" }}>Z-score BB/U</dt>
                <dd className="text-right font-data" style={{
                  color: pengukuranTerakhir.zScoreBBU < -2 ? "var(--color-critical)" :
                         pengukuranTerakhir.zScoreBBU < -1 ? "#6b4f1a" : "#3a6b1a"
                }}>
                  {pengukuranTerakhir.zScoreBBU > 0 ? "+" : ""}{pengukuranTerakhir.zScoreBBU.toFixed(2)}
                </dd>
                <dt className="whitespace-nowrap shrink-0 text-left" style={{ color: "var(--color-text-muted)" }}>Z-score TB/U</dt>
                <dd className="text-right font-data" style={{
                  color: pengukuranTerakhir.zScoreTBU < -2 ? "var(--color-critical)" :
                         pengukuranTerakhir.zScoreTBU < -1 ? "#6b4f1a" : "#3a6b1a"
                }}>
                  {pengukuranTerakhir.zScoreTBU > 0 ? "+" : ""}{pengukuranTerakhir.zScoreTBU.toFixed(2)}
                </dd>
              </dl>
              <Separator className="my-3" style={{ backgroundColor: "rgba(181, 224, 234, 0.5)" }} />
              <button
                type="button"
                onClick={() => openBalita(balita.id, "detail-balita")}
                className="text-[12px] font-medium inline-flex items-center gap-1 hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Lihat grafik lengkap
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              Belum ada pengukuran tercatat.
            </div>
          )}
        </FlatCard>

        {/* 2. Status Imunisasi */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ color: "var(--color-success)" }} aria-hidden>
              <Syringe className="w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Status Imunisasi
            </h3>
          </div>
          <div className="text-[11px] mb-2" style={{ color: "var(--color-text-muted)" }}>
            Kelengkapan sesuai usia {balita.usiaBulan} bulan
          </div>
          <div className="w-full mt-1 mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>Progress</span>
              <span className="text-[12px] font-bold" style={{ color: imunisasiPct >= 90 ? "var(--color-success)" : imunisasiPct >= 60 ? "var(--color-warning)" : "var(--color-critical)" }}>{imunisasiPct}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ 
                  width: `${imunisasiPct}%`,
                  background: imunisasiPct >= 90 ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)" : imunisasiPct >= 60 ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)" : "linear-gradient(90deg, #ef4444 0%, #f87171 100%)"
                }}
              ></div>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(181, 224, 234, 0.5)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--color-text-muted)" }}>
              3 Imunisasi Terakhir
            </div>
            <ul className="space-y-2">
              {imunisasiTerakhir.length > 0 ? imunisasiTerakhir.map((im) => (
                <li key={im.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{
                        color: im.status === "lengkap" ? "var(--color-success)" : "var(--color-warning)",
                      }}
                    />
                    <span className="text-[12px] truncate" style={{ color: "var(--color-text)" }}>
                      {im.nama}
                    </span>
                  </div>
                  <span className="font-data text-[11px] shrink-0" style={{ color: "var(--color-text-muted)" }}>
                    {formatTanggal(im.tanggal)}
                  </span>
                </li>
              )) : (
                <li className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  Belum ada riwayat imunisasi.
                </li>
              )}
            </ul>
          </div>
        </FlatCard>

        {/* 3. Riwayat MBG */}
        <FlatCard>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ color: "var(--color-warning)" }} aria-hidden>
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Riwayat MBG
            </h3>
          </div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                Total porsi diterima
              </div>
              <div
                className="font-display text-[24px] leading-tight"
                style={{ color: "var(--color-primary)", fontWeight: 500 }}
              >
                {totalPorsiMBG}
                <span className="text-[12px] ml-1" style={{ color: "var(--color-text-muted)" }}>porsi</span>
              </div>
            </div>
            {balita.penerimaMBG ? (
              <StatusBadge tone="success">Penerima Aktif</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Bukan Penerima</StatusBadge>
            )}
          </div>
          <div className="pt-3" style={{ borderTop: "1px solid rgba(181, 224, 234, 0.5)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--color-text-muted)" }}>
              3 Penerimaan Terakhir
            </div>
            <ul className="space-y-2">
              {mbgTerakhir.length > 0 ? mbgTerakhir.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] break-words" style={{ color: "var(--color-text)" }}>
                      {m.menu}
                    </div>
                    <div className="font-data text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {formatTanggal(m.tanggal)} · {m.porsi} porsi
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-[4px] shrink-0"
                    style={{
                      backgroundColor:
                        m.status === "tersalurkan"
                          ? "var(--color-success-tint)"
                          : "var(--color-warning-tint)",
                      color:
                        m.status === "tersalurkan" ? "#3a6b1a" : "#6b4f1a",
                    }}
                  >
                    {m.status === "tersalurkan" ? "Tersalurkan" : "Terjadwal"}
                  </span>
                </li>
              )) : (
                <li className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  Belum ada riwayat penerimaan MBG.
                </li>
              )}
            </ul>
          </div>
        </FlatCard>
      </div>

      {/* Catatan kader (footer info) */}
      {balita.catatanKader && (
        <FlatCard>
          <div className="flex items-start gap-2">
            <div className="text-[11px] uppercase tracking-wide shrink-0 mt-0.5" style={{ color: "var(--color-warning)" }}>
              Catatan Kader
            </div>
            <Separator orientation="vertical" className="!h-auto self-stretch" />
            <p className="text-[13px]" style={{ color: "var(--color-text)" }}>
              {balita.catatanKader}
            </p>
          </div>
        </FlatCard>
      )}
    </div>
  );
}
