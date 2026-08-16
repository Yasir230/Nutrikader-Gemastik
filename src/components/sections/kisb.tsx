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
  const { selectedBalitaId, openBalita } = useNav();
  const [activeId, setActiveId] = useState<string>(
    selectedBalitaId ?? balitaData[0]?.id ?? ""
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

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
          margin: 1,
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
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `KISB-${balita.nama.replace(/\s+/g, "_")}-${nomorKartu}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Berhasil mengunduh KISB.");
    } catch (error) {
      toast.error("Gagal mengunduh KISB.");
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
              className="border-[rgba(7,30,73,0.14)] text-[var(--color-primary)] hover:bg-[var(--color-info-tint)]"
            >
              <Download className="w-4 h-4" />
              Unduh KISB (PDF)
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

      {/* Kartu KISB visual (signature visual) */}
      <div
        ref={cardRef}
        className="relative rounded-[12px] p-[1px]"
        style={{ backgroundColor: "var(--color-warning)" }}
        aria-label={`Kartu KISB ${balita.nama}`}
      >
        <div
          className="rounded-[11px] p-5 sm:p-7"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "#FFFFFF",
          }}
        >
          {/* Header kartu */}
          <div className="flex items-start justify-between gap-3 pb-4"
            style={{ borderBottom: "1px solid rgba(181, 224, 234, 0.22)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  backgroundColor: "var(--color-success)",
                  color: "var(--color-primary)",
                }}
                aria-hidden
              >
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div
                  className="font-display text-[16px] sm:text-[18px] leading-tight"
                  style={{ fontWeight: 500, color: "#FFFFFF" }}
                >
                  KARTU INDONESIA SEHAT BALITA
                </div>
                <div
                  className="text-[11px] sm:text-[12px] mt-0.5"
                  style={{ color: "var(--color-info)" }}
                >
                  NutriKader · Badan Gizi Nasional
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--color-info)" }}
              >
                No. Kartu
              </div>
              <div
                className="font-data text-[13px] sm:text-[14px]"
                style={{ color: "#FFFFFF" }}
              >
                {nomorKartu}
              </div>
            </div>
          </div>

          {/* Body kartu */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 sm:gap-6 py-5">
            {/* Kiri: identitas */}
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="flex items-center justify-center font-display shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  backgroundColor: "var(--color-success)",
                  color: "var(--color-primary)",
                  fontSize: 20,
                  fontWeight: 500,
                }}
                aria-hidden
              >
                {getInitials(balita.nama)}
              </div>
              <div className="min-w-0 space-y-1.5">
                <div
                  className="font-display text-[20px] leading-tight truncate"
                  style={{ fontWeight: 500, color: "#FFFFFF" }}
                >
                  {balita.nama}
                </div>
                <div className="space-y-0.5 text-[12px] sm:text-[13px]" style={{ color: "var(--color-info)" }}>
                  <div className="flex items-center gap-2">
                    <span className="opacity-80 w-[68px] shrink-0">NIK</span>
                    <span className="font-data" style={{ color: "#FFFFFF" }}>{balita.nik}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-80 w-[68px] shrink-0">Tgl. Lahir</span>
                    <span style={{ color: "#FFFFFF" }}>{formatTanggal(balita.tanggalLahir)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-80 w-[68px] shrink-0">Jenis Kelamin</span>
                    <span style={{ color: "#FFFFFF" }}>{jenisKelaminLabel(balita.jenisKelamin)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-80 w-[68px] shrink-0">Posyandu</span>
                    <span className="truncate" style={{ color: "#FFFFFF" }}>{balita.posyanduNama}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanan: QR */}
            <div className="flex flex-col items-center sm:items-end gap-1.5">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code Verifikasi KISB" 
                  className="w-[88px] h-[88px] rounded-[4px] border border-[rgba(7,30,73,0.18)] bg-white"
                />
              ) : (
                <div className="w-[88px] h-[88px] rounded-[4px] border border-[rgba(7,30,73,0.18)] bg-white animate-pulse" />
              )}
              <div
                className="text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold"
                style={{ color: "var(--color-success)" }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Terverifikasi BGN
              </div>
            </div>
          </div>

          {/* Footer kartu — status strip */}
          <div
            className="flex flex-wrap items-center gap-2 sm:gap-3 pt-4"
            style={{ borderTop: "1px solid rgba(181, 224, 234, 0.22)" }}
          >
            {/* RiskBadge versi on-dark */}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-[4px] border"
              style={{
                backgroundColor:
                  balita.risiko === "tinggi"
                    ? "rgba(179, 58, 58, 0.32)"
                    : balita.risiko === "sedang"
                    ? "rgba(209, 176, 108, 0.28)"
                    : "rgba(146, 208, 93, 0.28)",
                color: "#FFFFFF",
                borderColor:
                  balita.risiko === "tinggi"
                    ? "rgba(179, 58, 58, 0.6)"
                    : balita.risiko === "sedang"
                    ? "rgba(209, 176, 108, 0.55)"
                    : "rgba(146, 208, 93, 0.55)",
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    balita.risiko === "tinggi"
                      ? "#FFFFFF"
                      : balita.risiko === "sedang"
                      ? "var(--color-warning)"
                      : "var(--color-success)",
                }}
                aria-hidden
              />
              {balita.risiko === "tinggi"
                ? "Risiko Tinggi"
                : balita.risiko === "sedang"
                ? "Risiko Sedang"
                : "Risiko Rendah"}
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-[4px] border"
              style={{
                backgroundColor: "rgba(181, 224, 234, 0.14)",
                color: "#FFFFFF",
                borderColor: "rgba(181, 224, 234, 0.4)",
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-info)" }}
                aria-hidden
              />
              {balita.statusPosyandu === "aktif" ? "Aktif Posyandu" : "Lulus Posyandu"}
            </span>

            <span
              className="ml-auto text-[11px] sm:text-[12px] flex items-center gap-1.5"
              style={{ color: "var(--color-info)" }}
            >
              <Clock className="w-3.5 h-3.5" />
              Diperbarui: <span className="font-data" style={{ color: "#FFFFFF" }}>{formatTanggal(tanggalDiperbarui)}</span>
            </span>
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
              <dl className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-[13px]">
                <dt style={{ color: "var(--color-text-muted)" }}>Berat Badan</dt>
                <dd className="text-right font-data" style={{ color: "var(--color-text)" }}>
                  {pengukuranTerakhir.beratBadan.toLocaleString("id-ID")} kg
                </dd>
                <dt style={{ color: "var(--color-text-muted)" }}>Tinggi Badan</dt>
                <dd className="text-right font-data" style={{ color: "var(--color-text)" }}>
                  {pengukuranTerakhir.tinggiBadan.toLocaleString("id-ID")} cm
                </dd>
                <dt style={{ color: "var(--color-text-muted)" }}>Lingkar Kepala</dt>
                <dd className="text-right font-data" style={{ color: "var(--color-text)" }}>
                  {pengukuranTerakhir.lingkarKepala.toLocaleString("id-ID")} cm
                </dd>
                <dt style={{ color: "var(--color-text-muted)" }}>Z-score BB/U</dt>
                <dd className="text-right font-data" style={{
                  color: pengukuranTerakhir.zScoreBBU < -2 ? "var(--color-critical)" :
                         pengukuranTerakhir.zScoreBBU < -1 ? "#6b4f1a" : "#3a6b1a"
                }}>
                  {pengukuranTerakhir.zScoreBBU > 0 ? "+" : ""}{pengukuranTerakhir.zScoreBBU.toFixed(2)}
                </dd>
                <dt style={{ color: "var(--color-text-muted)" }}>Z-score TB/U</dt>
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
          <PitaCapaian
            value={imunisasiPct}
            state={imunisasiPct >= 90 ? "on-track" : imunisasiPct >= 60 ? "attention" : "critical"}
            segments={10}
            label={`${imunisasiPct}% lengkap`}
          />
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
                    <div className="text-[12px] truncate" style={{ color: "var(--color-text)" }}>
                      {m.menu}
                    </div>
                    <div className="font-data text-[11px]" style={{ color: "var(--color-text-muted)" }}>
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
