"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  FileText,
  PlusCircle,
  Stethoscope,
  Activity,
  Info,
  UtensilsCrossed,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { SectionHeader, FlatCard } from "@/components/section";
import { RiskBadge, StatusBadge } from "@/components/status-badge";
import { useNav } from "@/lib/nav-store";
import { formatTanggal } from "@/lib/mock-data";
import { getBalita, type BalitaRecord } from "@/lib/balita-client";

// ============================================================
// NUTRIKADER — Detail Balita section
// KF-03 (grafik pertumbuhan), KF-04 (analisis risiko), MVP #3 #4 #11
// ============================================================

function zScoreInterpretation(z: number): { color: string; label: string } {
  if (z >= -1) return { color: "var(--color-success)", label: "Normal" };
  if (z >= -2) return { color: "var(--color-warning)", label: "Perlu perhatian" };
  return { color: "var(--color-critical)", label: "Berisiko" };
}

function getInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function DetailBalitaSection() {
  const { selectedBalitaId, openBalita, setSection } = useNav();
  const [balita, setBalita] = useState<BalitaRecord | null>(null);

  useEffect(() => {
    let active = true;
    if (!selectedBalitaId) return;

    void getBalita(selectedBalitaId).then((data) => {
      if (active) setBalita(data ?? null);
    });

    return () => {
      active = false;
    };
  }, [selectedBalitaId]);

  if (!selectedBalitaId || !balita) {
    return (
      <div className="space-y-4">
        <SectionHeader
          eyebrow="OPERASIONAL"
          title="Detail Balita"
          description="Detail antropometri, riwayat pengukuran, imunisasi, dan integrasi MBG."
        />
        <FlatCard className="py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-[8px] inline-flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-info-tint)",
                color: "var(--color-primary)",
              }}
            >
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p
                className="font-display text-[18px]"
                style={{ color: "var(--color-primary)", fontWeight: 500 }}
              >
                Belum ada balita dipilih
              </p>
              <p
                className="text-[13px] mt-1 max-w-md"
                style={{ color: "var(--color-text-muted)" }}
              >
                Pilih balita dari daftar Data Balita untuk melihat detail riwayat
                pertumbuhan, imunisasi, dan penerimaan MBG.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSection("data-balita")}
              className="mt-2 px-4 py-2 rounded-[8px] text-[13px] font-medium inline-flex items-center gap-1.5"
              style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Data Balita
            </button>
          </div>
        </FlatCard>
      </div>
    );
  }

  const chartRef = useRef<HTMLDivElement>(null);

  const handleUnduhGrafik = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
      } as any);
      const link = document.createElement('a');
      link.download = `grafik-pertumbuhan-${balita.nama.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(`Grafik pertumbuhan ${balita.nama} berhasil diunduh.`);
    } catch (err) {
      console.error('Download chart error:', err);
      toast.error('Gagal mengunduh grafik. Silakan coba lagi.');
    }
  };

  const initials = getInitials(balita.nama);
  // pengukuran di mock data sudah di-sort descending (terbaru di awal).
  // Untuk grafik kita butuh ascending (termuda → tertua) supaya garis L→R.
  const pengukuranAsc = [...balita.pengukuran].sort(
    (a, b) => a.usiaBulan - b.usiaBulan
  );
  const terakhir = pengukuranAsc[pengukuranAsc.length - 1];
  const zBBUInfo = terakhir
    ? zScoreInterpretation(terakhir.zScoreBBU)
    : null;
  const zTBUInfo = terakhir
    ? zScoreInterpretation(terakhir.zScoreTBU)
    : null;

  const bbData = pengukuranAsc.map((p) => ({ usia: p.usiaBulan, value: p.beratBadan }));
  const tbData = pengukuranAsc.map((p) => ({ usia: p.usiaBulan, value: p.tinggiBadan }));

  // pengukuran untuk tabel: tampilkan terbaru di atas
  const riwayatTabel = [...pengukuranAsc].reverse();

  // warna untuk risk badge besar
  const riskBigStyle =
    balita.risiko === "tinggi"
      ? {
          bg: "var(--color-critical-tint)",
          fg: "var(--color-critical)",
          border: "rgba(179,58,58,0.4)",
        }
      : balita.risiko === "sedang"
      ? {
          bg: "var(--color-warning-tint)",
          fg: "#6b4f1a",
          border: "rgba(209,176,108,0.5)",
        }
      : {
          bg: "var(--color-success-tint)",
          fg: "#3a6b1a",
          border: "rgba(146,208,93,0.5)",
        };
  const riskBigLabel =
    balita.risiko === "tinggi"
      ? "Risiko Tinggi"
      : balita.risiko === "sedang"
      ? "Risiko Sedang"
      : "Risiko Rendah";

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setSection("data-balita")}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium"
        style={{ color: "var(--color-primary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Data Balita
      </button>

      {/* Header card */}
      <FlatCard pad="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Avatar — rounded-full diizinkan untuk avatar (design-system §5) */}
            <div
              className="w-14 h-14 rounded-full inline-flex items-center justify-center flex-shrink-0 font-display"
              style={{
                backgroundColor: "var(--color-info)",
                color: "var(--color-primary)",
                fontSize: 20,
                fontWeight: 500,
              }}
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="font-display text-[22px] leading-tight"
                  style={{ color: "var(--color-primary)", fontWeight: 500 }}
                >
                  {balita.nama}
                </h2>
                <RiskBadge level={balita.risiko} />
              </div>
              <div
                className="font-data text-[12px] mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                NIK {balita.nik}
              </div>
              <div
                className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]"
                style={{ color: "var(--color-text)" }}
              >
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>Usia:</span>{" "}
                  <span className="font-data">{balita.usiaBulan} bln</span>
                </span>
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Jenis kelamin:
                  </span>{" "}
                  {balita.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                </span>
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>Posyandu:</span>{" "}
                  {balita.posyanduNama}
                </span>
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>Kelurahan:</span>{" "}
                  {balita.kelurahan}
                </span>
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>Nama ibu:</span>{" "}
                  {balita.namaIbu}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch lg:w-[210px]">
            <button
              type="button"
              onClick={() => openBalita(balita.id, "kisb")}
              className="px-3 py-2 rounded-[8px] text-[13px] font-medium inline-flex items-center justify-center gap-1.5"
              style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
            >
              <FileText className="w-4 h-4" />
              Lihat KISB Digital
            </button>
            <button
              type="button"
              onClick={() =>
                toast.success("[Demo] Form pengukuran baru", {
                  description:
                    "Form pencatatan antropometri akan dibuka (demo).",
                })
              }
              className="px-3 py-2 rounded-[8px] text-[13px] font-medium inline-flex items-center justify-center gap-1.5 border"
              style={{
                borderColor: "rgba(7,30,73,0.14)",
                color: "var(--color-primary)",
                backgroundColor: "transparent",
              }}
            >
              <PlusCircle className="w-4 h-4" />
              Catat Pengukuran Baru
            </button>
            {balita.risiko !== "rendah" && (
              <button
                type="button"
                onClick={() =>
                  toast.success("[Demo] Rujukan ke puskesmas dibuat", {
                    description: `${balita.nama} dirujuk untuk konseling TPG (demo).`,
                  })
                }
                className="px-3 py-2 rounded-[8px] text-[13px] font-medium inline-flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "var(--color-critical)", color: "#FFFFFF" }}
              >
                <Stethoscope className="w-4 h-4" />
                Rujuk ke Puskesmas
              </button>
            )}
          </div>
        </div>
      </FlatCard>

      {/* Grid 2 kolom: Grafik kiri, Analisis kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT — Grafik Pertumbuhan (KF-03) */}
        <FlatCard>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3
                className="text-[15px] font-semibold"
                style={{ color: "var(--color-primary)" }}
              >
                Tren Pertumbuhan Balita
              </h3>
              <p
                className="text-[12px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Berat badan (kg) &amp; tinggi badan (cm) per usia
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUnduhGrafik}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-semibold transition-colors hover:bg-[var(--color-info-tint)]"
                style={{
                  borderColor: "rgba(7,30,73,0.12)",
                  color: "var(--color-primary)",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Grafik
              </button>
              <Activity
                className="w-4 h-4"
                style={{ color: "var(--color-text-muted)" }}
              />
            </div>
          </div>

          <div ref={chartRef} className="bg-white p-2 -m-2 rounded">
            {/* BB chart */}
            <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: "var(--color-primary)" }}
                aria-hidden
              />
              <span
                className="whitespace-nowrap text-[12px] font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Berat Badan (kg)
              </span>
            </div>
            <div style={{ width: "100%", height: 150 }}>
              <ResponsiveContainer>
                <LineChart
                  data={bbData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(181,224,234,0.4)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="usia"
                    tick={{ fontSize: 11, fill: "#5B6B7A" }}
                    axisLine={false}
                    tickLine={false}
                    unit=" bln"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#5B6B7A" }}
                    axisLine={false}
                    tickLine={false}
                    domain={["dataMin - 1", "dataMax + 1"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(7,30,73,0.12)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v} kg`, "Berat"]}
                    labelFormatter={(l) => `Usia ${l} bln`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#071E49"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#071E49" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TB chart */}
          <div
            className="pt-3 border-t"
            style={{ borderColor: "rgba(181,224,234,0.5)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: "var(--color-success)" }}
                aria-hidden
              />
              <span
                className="whitespace-nowrap text-[12px] font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Tinggi Badan (cm)
              </span>
            </div>
            <div style={{ width: "100%", height: 150 }}>
              <ResponsiveContainer>
                <LineChart
                  data={tbData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(181,224,234,0.4)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="usia"
                    tick={{ fontSize: 11, fill: "#5B6B7A" }}
                    axisLine={false}
                    tickLine={false}
                    unit=" bln"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#5B6B7A" }}
                    axisLine={false}
                    tickLine={false}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(7,30,73,0.12)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v} cm`, "Tinggi"]}
                    labelFormatter={(l) => `Usia ${l} bln`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#92D05D"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#92D05D" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>
        </FlatCard>

        {/* RIGHT — Status Risiko & Analisis (KF-04) */}
        <FlatCard>
          <h3
            className="text-[15px] font-semibold mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            Status Risiko &amp; Analisis
          </h3>

          {/* Risk badge besar */}
          <div className="mb-4">
            <div
              className="text-[11px] uppercase tracking-wide mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Status Risiko Saat Ini
            </div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border"
              style={{
                backgroundColor: riskBigStyle.bg,
                color: riskBigStyle.fg,
                borderColor: riskBigStyle.border,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "currentColor" }}
                aria-hidden
              />
              <span className="text-[14px] font-semibold">{riskBigLabel}</span>
            </div>
          </div>

          {/* Alasan risiko */}
          <div className="mb-4">
            <div
              className="text-[12px] font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Alasan deteksi risiko
            </div>
            <ul className="space-y-1.5">
              {balita.alasanRisiko.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px]"
                  style={{ color: "var(--color-text)" }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: "var(--color-warning)" }}
                    aria-hidden
                  />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Z-score terakhir */}
          {terakhir && zBBUInfo && zTBUInfo && (
            <div className="mb-4">
              <div
                className="text-[12px] font-medium mb-2"
                style={{ color: "var(--color-text)" }}
              >
                Z-score terakhir (usia {terakhir.usiaBulan} bln)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-2.5 rounded-[6px] border"
                  style={{ borderColor: "rgba(7,30,73,0.08)" }}
                >
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    BB/U
                  </div>
                  <div
                    className="font-data text-[18px] font-medium"
                    style={{ color: zBBUInfo.color }}
                  >
                    {terakhir.zScoreBBU.toFixed(2)}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: zBBUInfo.color }}
                  >
                    {zBBUInfo.label}
                  </div>
                </div>
                <div
                  className="p-2.5 rounded-[6px] border"
                  style={{ borderColor: "rgba(7,30,73,0.08)" }}
                >
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    TB/U
                  </div>
                  <div
                    className="font-data text-[18px] font-medium"
                    style={{ color: zTBUInfo.color }}
                  >
                    {terakhir.zScoreTBU.toFixed(2)}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: zTBUInfo.color }}
                  >
                    {zTBUInfo.label}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logika deteksi box */}
          <div
            className="p-3 rounded-[6px]"
            style={{
              backgroundColor: "var(--color-info-tint)",
              borderLeft: "3px solid var(--color-info)",
            }}
          >
            <div className="flex items-start gap-2">
              <Info
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              />
              <div>
                <div
                  className="text-[12px] font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  Logika Deteksi (rule-based)
                </div>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--color-text)" }}
                >
                  Sistem menggunakan aturan berbasis tren: berat badan stagnan
                  &ge; 2 bulan, riwayat BBLR &lt; 2,5 kg, z-score BB/U atau TB/U
                  &lt; -2, serta frekuensi sakit tinggi.
                </p>
              </div>
            </div>
          </div>
        </FlatCard>
      </div>

      {/* Riwayat Pengukuran */}
      <FlatCard pad="p-0" className="overflow-hidden">
        <div className="p-4">
          <h3
            className="text-[15px] font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Riwayat Pengukuran
          </h3>
          <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            {pengukuranAsc.length} titik pengukuran antropometri
          </p>
        </div>
        <div className="overflow-x-auto border-t" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
          <table className="w-full text-[13px] min-w-[860px]">
            <thead style={{ backgroundColor: "var(--color-bg)" }}>
              <tr
                className="text-left border-b"
                style={{
                  color: "var(--color-text-muted)",
                  borderColor: "rgba(181,224,234,0.5)",
                }}
              >
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-4">
                  Tanggal
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                  Usia (bln)
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                  BB (kg)
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                  TB (cm)
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                  LK (cm)
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                  Z-score BB/U
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                  Z-score TB/U
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-3">
                  Sakit
                </th>
                <th className="whitespace-nowrap font-medium text-[11px] uppercase tracking-wide py-2.5 px-4">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody>
              {riwayatTabel.map((p) => {
                const zBB = zScoreInterpretation(p.zScoreBBU);
                const zTB = zScoreInterpretation(p.zScoreTBU);
                return (
                  <tr
                    key={p.id}
                    className="border-t transition-colors hover:bg-[var(--color-info-tint)]"
                    style={{ borderColor: "rgba(181,224,234,0.5)" }}
                  >
                    <td
                      className="py-2.5 px-4 font-data"
                      style={{ color: "var(--color-text)" }}
                    >
                      {formatTanggal(p.tanggal)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-data"
                      style={{ color: "var(--color-text)" }}
                    >
                      {p.usiaBulan}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-data"
                      style={{ color: "var(--color-text)" }}
                    >
                      {p.beratBadan.toFixed(1)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-data"
                      style={{ color: "var(--color-text)" }}
                    >
                      {p.tinggiBadan.toFixed(1)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-data"
                      style={{ color: "var(--color-text)" }}
                    >
                      {p.lingkarKepala.toFixed(1)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-data font-medium"
                      style={{ color: zBB.color }}
                    >
                      {p.zScoreBBU.toFixed(2)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-data font-medium"
                      style={{ color: zTB.color }}
                    >
                      {p.zScoreTBU.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      {p.sakitBulanItu ? (
                        <StatusBadge tone="warning">Sakit</StatusBadge>
                      ) : (
                        <StatusBadge tone="success" dot={false}>
                          Sehat
                        </StatusBadge>
                      )}
                    </td>
                    <td
                      className="py-2.5 px-4 text-[12px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {p.catatan ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FlatCard>

      {/* Riwayat Imunisasi & MBG — 2 kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Imunisasi */}
        <FlatCard pad="p-0" className="overflow-hidden">
          <div className="p-4">
            <h3
              className="text-[15px] font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Riwayat Imunisasi
            </h3>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {balita.imunisasi.length} imunisasi tercatat
            </p>
          </div>
          <div
            className="max-h-[320px] overflow-x-auto overflow-y-auto scroll-thin border-t"
            style={{ borderColor: "rgba(181,224,234,0.5)" }}
          >
            <table className="w-full text-[13px]">
              <thead className="sticky top-0" style={{ backgroundColor: "#FFFFFF" }}>
                <tr
                  className="text-left border-b"
                  style={{
                    color: "var(--color-text-muted)",
                    borderColor: "rgba(181,224,234,0.5)",
                  }}
                >
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-4">
                    Vaksin
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-3">
                    Tanggal
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {balita.imunisasi.map((im) => (
                  <tr
                    key={im.id}
                    className="border-t transition-colors hover:bg-[var(--color-info-tint)]"
                    style={{ borderColor: "rgba(181,224,234,0.5)" }}
                  >
                    <td
                      className="py-2.5 px-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      {im.nama}
                    </td>
                    <td
                      className="py-2.5 px-3 font-data"
                      style={{ color: "var(--color-text)" }}
                    >
                      {formatTanggal(im.tanggal)}
                    </td>
                    <td className="py-2.5 px-4">
                      {im.status === "lengkap" ? (
                        <StatusBadge tone="success">Lengkap</StatusBadge>
                      ) : im.status === "tertunda" ? (
                        <StatusBadge tone="warning">Tertunda</StatusBadge>
                      ) : (
                        <StatusBadge tone="info" dot={false}>
                          Belum
                        </StatusBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FlatCard>

        {/* MBG (KF-11) */}
        <FlatCard pad="p-0" className="overflow-hidden">
          <div className="p-4">
            <h3
              className="text-[15px] font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Riwayat Penerimaan MBG
            </h3>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {balita.penerimaanMBG.length} distribusi tercatat
            </p>
          </div>
          {balita.penerimaanMBG.length === 0 ? (
            <div
              className="p-4 border-t"
              style={{ borderColor: "rgba(181,224,234,0.5)" }}
            >
              <div
                className="p-4 rounded-[6px] text-center"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px dashed rgba(7,30,73,0.14)",
                }}
              >
                <UtensilsCrossed
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Balita belum terdaftar sebagai penerima MBG.
                </p>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Daftarkan via modul Integrasi MBG.
                </p>
                <button
                  type="button"
                  onClick={() => setSection("mbg")}
                  className="mt-3 px-3 py-1.5 rounded-[8px] text-[12px] font-medium"
                  style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
                >
                  Buka Integrasi MBG
                </button>
              </div>
            </div>
          ) : (
            <div
              className="max-h-[320px] overflow-x-auto overflow-y-auto scroll-thin border-t"
              style={{ borderColor: "rgba(181,224,234,0.5)" }}
            >
              <table className="w-full text-[13px]">
                <thead className="sticky top-0" style={{ backgroundColor: "#FFFFFF" }}>
                  <tr
                    className="text-left border-b"
                    style={{
                      color: "var(--color-text-muted)",
                      borderColor: "rgba(181,224,234,0.5)",
                    }}
                  >
                    <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-4">
                      Tanggal
                    </th>
                    <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-3">
                      Menu
                    </th>
                    <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-3 text-right">
                      Porsi
                    </th>
                    <th className="font-medium text-[11px] uppercase tracking-wide py-2.5 px-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {balita.penerimaanMBG.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t transition-colors hover:bg-[var(--color-info-tint)]"
                      style={{ borderColor: "rgba(181,224,234,0.5)" }}
                    >
                      <td
                        className="py-2.5 px-4 font-data"
                        style={{ color: "var(--color-text)" }}
                      >
                        {formatTanggal(m.tanggal)}
                      </td>
                      <td
                        className="py-2.5 px-3"
                        style={{ color: "var(--color-text)" }}
                      >
                        {m.menu}
                      </td>
                      <td
                        className="py-2.5 px-3 text-right font-data"
                        style={{ color: "var(--color-text)" }}
                      >
                        {m.porsi}
                      </td>
                      <td className="py-2.5 px-4">
                        {m.status === "tersalurkan" ? (
                          <StatusBadge tone="success">Tersalurkan</StatusBadge>
                        ) : (
                          <StatusBadge tone="info">Terjadwal</StatusBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FlatCard>
      </div>

      {/* Catatan kader */}
      {balita.catatanKader && (
        <FlatCard>
          <div
            className="p-4 rounded-[6px]"
            style={{
              backgroundColor: "var(--color-warning-tint)",
              borderLeft: "3px solid var(--color-warning)",
            }}
          >
            <div
              className="text-[12px] font-semibold mb-1"
              style={{ color: "#6b4f1a" }}
            >
              Catatan Kader
            </div>
            <p className="text-[13px]" style={{ color: "var(--color-text)" }}>
              {balita.catatanKader}
            </p>
          </div>
        </FlatCard>
      )}
    </div>
  );
}
