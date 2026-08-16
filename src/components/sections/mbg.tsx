"use client";

import { KpiCard } from "@/components/kpi-card";
import { PitaCapaian } from "@/components/pita-capaian";
import { SectionHeader, FlatCard } from "@/components/section";
import { RiskBadge, StatusBadge } from "@/components/status-badge";
import { useNav } from "@/lib/nav-store";
import {
  kpiAgregat,
  balitaData,
  wilayahData,
  formatTanggal,
} from "@/lib/mock-data";
import {
  Users,
  UtensilsCrossed,
  AlertTriangle,
  RefreshCw,
  Download,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const BULAN = ["Ags", "Sep", "Okt", "Nov", "Des", "Jan"];

export function MbgSection() {
  const { openBalita } = useNav();

  const sasaranTerverifikasi = Math.round(kpiAgregat.totalBalita * 0.79);
  const sinkronisasiTertunda = balitaData.filter(
    (b) => b.sinkronisasi !== "tersinkron"
  ).length;
  const porsiMBG30Hari = 4238;

  const trenData = BULAN.map((b, i) => ({
    bulan: b,
    cakupan: [68, 71, 74, 76, 78, 79][i],
    stunting: kpiAgregat.trenStunting6Bulan[i],
  }));

  const balitaPrioritasMBG = balitaData.filter(
    (b) => b.penerimaMBG === true && b.risiko === "tinggi"
  );

  const handleSinkron = () => {
    toast.success(
      "[Demo] Sinkronisasi data sasaran MBG ke Badan Gizi Nasional berhasil dimulai."
    );
  };

  const handleUnduhDampak = () => {
    toast.success("[Demo] Laporan dampak MBG sedang disiapkan untuk diunduh.");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="MBG & LAPORAN"
        title="Integrasi Program Makan Bergizi Gratis (MBG)"
        description="Pemantauan data sasaran penerima MBG (balita, ibu hamil, ibu menyusui) yang terverifikasi NIK, cakupan penyaluran, dan evaluasi dampak gizi."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnduhDampak}
              className="border"
              style={{
                borderColor: "rgba(181,224,234,0.7)",
                color: "var(--color-primary)",
              }}
            >
              <Download className="w-4 h-4" />
              Unduh Laporan Dampak MBG
            </Button>
            <Button
              size="sm"
              onClick={handleSinkron}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Sinkronkan ke Server BGN
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Sasaran MBG Terverifikasi"
          value={sasaranTerverifikasi}
          unit="balita"
          accent="success"
          icon={<Users className="w-4 h-4" />}
          hint="Berdasarkan verifikasi NIK"
        />
        <KpiCard
          label="Cakupan Penyaluran Bulan Ini"
          value={kpiAgregat.cakupanMBGBulanan}
          unit="%"
          accent="primary"
          icon={<UtensilsCrossed className="w-4 h-4" />}
          delta={{ value: 4.2, positive: true, label: "vs bulan lalu" }}
        />
        <KpiCard
          label="Porsi MBG Tersalurkan (30 hari)"
          value={porsiMBG30Hari}
          unit="porsi"
          accent="success"
          icon={<UtensilsCrossed className="w-4 h-4" />}
          hint="Realisasi penyaluran harian"
        />
        <KpiCard
          label="Sinkronisasi Tertunda"
          value={sinkronisasiTertunda}
          unit="data"
          accent="critical"
          icon={<AlertTriangle className="w-4 h-4" />}
          hint="Perlu sinkron ulang ke BGN"
        />
      </div>

      {/* Chart tren cakupan MBG vs prevalensi stunting */}
      <FlatCard>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Korelasi Cakupan MBG vs Prevalensi Stunting
            </h3>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              Naiknya cakupan MBG beriringan dengan turunnya prevalensi stunting (6 bulan terakhir)
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              <span className="inline-block w-3 h-[2px]" style={{ backgroundColor: "var(--color-primary)" }} />
              Cakupan MBG (%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              <span className="inline-block w-3 h-[2px]" style={{ backgroundColor: "var(--color-success)" }} />
              Stunting (%)
            </span>
          </div>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <ComposedChart data={trenData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(181,224,234,0.4)" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#5B6B7A" }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: "#5B6B7A" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[18, 26]}
                tick={{ fontSize: 11, fill: "#5B6B7A" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(7,30,73,0.12)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(7,30,73,0.12)",
                }}
                formatter={(v: number, n: string) => [
                  `${v}%`,
                  n === "cakupan" ? "Cakupan MBG" : "Prevalensi Stunting",
                ]}
              />
              <Legend wrapperStyle={{ display: "none" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cakupan"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-primary)" }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="stunting"
                stroke="var(--color-success)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-success)" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </FlatCard>

      {/* Tabel sasaran MBG per wilayah */}
      <FlatCard pad="p-0">
        <div className="p-4 pb-2">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
            Sasaran MBG per Wilayah (Kelurahan)
          </h3>
          <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            Cakupan penyaluran MBG & status capaian per kelurahan
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left" style={{ color: "var(--color-text-muted)" }}>
                <th className="font-medium text-[11px] uppercase tracking-wide px-4 py-2">Kelurahan</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">Posyandu</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">Balita Sasaran</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 min-w-[180px]">Cakupan MBG</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">Stunting</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {wilayahData.map((w) => {
                const state: "on-track" | "attention" | "critical" =
                  w.cakupanMBG >= 85 ? "on-track" : w.cakupanMBG >= 70 ? "attention" : "critical";
                const statusBadge =
                  w.cakupanMBG >= 85 ? (
                    <StatusBadge tone="success">Optimal</StatusBadge>
                  ) : w.cakupanMBG >= 70 ? (
                    <StatusBadge tone="warning">Perlu Peningkatan</StatusBadge>
                  ) : (
                    <StatusBadge tone="critical">Rendah</StatusBadge>
                  );
                return (
                  <tr
                    key={w.id}
                    className="border-t hover:bg-[var(--color-info-tint)] transition-colors"
                    style={{ borderColor: "rgba(181,224,234,0.5)" }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold" style={{ color: "var(--color-text)" }}>{w.nama}</div>
                      <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{w.puskesmas}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-text)" }}>{w.jumlahPosyandu}</td>
                    <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-text)" }}>{w.jumlahBalita}</td>
                    <td className="px-3 py-3">
                      <PitaCapaian value={w.cakupanMBG} state={state} segments={10} height={6} />
                    </td>
                    <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-text)" }}>
                      {w.prevalensiStunting}%
                    </td>
                    <td className="px-3 py-3">{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FlatCard>

      {/* Prioritas penyaluran MBG — Balita Risiko Tinggi */}
      <FlatCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Prioritas Penyaluran MBG — Balita Risiko Tinggi
            </h3>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {balitaPrioritasMBG.length} balita penerima MBG dengan risiko tinggi memerlukan pendampingan harian
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-[4px]"
            style={{ backgroundColor: "var(--color-critical-tint)", color: "var(--color-critical)" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-critical)" }} aria-hidden />
            Prioritas
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {balitaPrioritasMBG.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-[8px] border flex flex-col gap-2"
              style={{
                borderColor: "rgba(179,58,58,0.2)",
                backgroundColor: "var(--color-critical-tint)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text)" }}>
                    {b.nama}
                  </div>
                  <div className="font-data text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    NIK {b.nik}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {b.posyanduNama} · {b.kelurahan}
                  </div>
                </div>
                <RiskBadge level={b.risiko} />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: "rgba(179,58,58,0.15)" }}>
                <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  Penerima MBG aktif · {b.penerimaanMBG.length} catatan tersalurkan
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openBalita(b.id, "kisb")}
                  className="h-7 px-2 text-[12px]"
                  style={{ color: "var(--color-primary)" }}
                >
                  Lihat KISB
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </FlatCard>

      {/* Box info sinergi NutriKader × MBG */}
      <div
        className="rounded-[8px] p-4 border-l-[3px]"
        style={{
          backgroundColor: "var(--color-info-tint)",
          borderColor: "var(--color-info)",
          borderTop: "1px solid rgba(181,224,234,0.5)",
          borderRight: "1px solid rgba(181,224,234,0.5)",
          borderBottom: "1px solid rgba(181,224,234,0.5)",
        }}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
          <div className="min-w-0 flex-1">
            <h4 className="text-[14px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Sinergi NutriKader × Program MBG
            </h4>
            <ul className="mt-2 space-y-1.5 text-[13px]" style={{ color: "var(--color-text)" }}>
              <li className="flex gap-2">
                <span className="font-data shrink-0" style={{ color: "var(--color-text-muted)" }}>1.</span>
                <span>Integrasi data sasaran berbasis NIK antara pencatatan posyandu dan penyaluran MBG.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-data shrink-0" style={{ color: "var(--color-text-muted)" }}>2.</span>
                <span>Pemantauan berkelanjutan dari lahir hingga keluar posyandu melalui Kartu Ibu Sadar Gizi (KISB).</span>
              </li>
              <li className="flex gap-2">
                <span className="font-data shrink-0" style={{ color: "var(--color-text-muted)" }}>3.</span>
                <span>Evaluasi dampak MBG via tren antropometri (BB/U, TB/U, LiKa) yang tercatat berkala.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-data shrink-0" style={{ color: "var(--color-text-muted)" }}>4.</span>
                <span>Dukungan kebijakan kepala daerah berbasis bukti untuk alokasi anggaran MBG di wilayahnya.</span>
              </li>
            </ul>
            <p className="text-[11px] mt-3 italic" style={{ color: "var(--color-text-muted)" }}>
              Referensi: Proposal NutriKader Gemastik XVIII — Bagian B.3 (Sinergi Program).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
