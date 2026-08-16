"use client";

import { useMemo, useState } from "react";
import { SectionHeader, FlatCard } from "@/components/section";
import { PitaCapaian } from "@/components/pita-capaian";
import { StatusBadge, RiskBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { useNav } from "@/lib/nav-store";
import {
  sebaranRisiko,
  wilayahData,
  posyanduData,
  balitaData,
  kpiAgregat,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  TrendingDown,
  AlertTriangle,
  UtensilsCrossed,
  Search,
  MapPin,
  Info,
  ArrowRight,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

type Level = "tinggi" | "sedang" | "rendah";

const levelTint: Record<Level, string> = {
  tinggi: "var(--color-critical-tint)",
  sedang: "var(--color-warning-tint)",
  rendah: "var(--color-success-tint)",
};
const levelBorder: Record<Level, string> = {
  tinggi: "var(--color-critical)",
  sedang: "var(--color-warning)",
  rendah: "var(--color-success)",
};
const levelLabel: Record<Level, string> = {
  tinggi: "Risiko Tinggi",
  sedang: "Risiko Sedang",
  rendah: "Risiko Rendah",
};

const rekomendasi: Record<Level, string[]> = {
  tinggi: ["Tingkatkan cakupan MBG", "Aktifkan kembali kader nonaktif", "Rujukan balita BBLR"],
  sedang: ["Tingkatkan cakupan MBG", "Edukasi MPASI intensif"],
  rendah: ["Pertahankan kinerja posyandu"],
};

export function PetaRisikoSection() {
  const { setSection, openBalita } = useNav();
  const [openWilayah, setOpenWilayah] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const totalBalitaWilayah = wilayahData.reduce((s, w) => s + w.jumlahBalita, 0);
  const rataPrevalensi =
    wilayahData.reduce((s, w) => s + w.prevalensiStunting, 0) / wilayahData.length;
  const wilayahRisikoTinggi = sebaranRisiko.filter((w) => w.level === "tinggi").length;
  const rataMBG =
    wilayahData.reduce((s, w) => s + w.cakupanMBG, 0) / wilayahData.length;

  const topPrioritas = useMemo(
    () => [...sebaranRisiko].sort((a, b) => b.prevalensi - a.prevalensi).slice(0, 3),
    []
  );

  const hasilCari = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return balitaData.filter(
      (b) =>
        b.nama.toLowerCase().includes(q) || b.nik.toLowerCase().includes(q)
    );
  }, [query]);

  const handleCari = () => {
    if (!query.trim()) {
      toast.info("Masukkan nama atau NIK balita untuk mencari.");
      setSearched(false);
      return;
    }
    setSearched(true);
    if (hasilCari.length === 0) {
      toast.info(`Tidak ditemukan balita dengan kata kunci "${query}".`);
    } else {
      toast.success(`Ditemukan ${hasilCari.length} balita cocok dengan pencarian.`);
    }
  };

  const activeWilayah = openWilayah
    ? wilayahData.find((w) => w.id === openWilayah) ?? null
    : null;
  const posyanduInWilayah = activeWilayah
    ? posyanduData.filter((p) => p.wilayahId === activeWilayah.id)
    : [];
  const balitaTinggiInWilayah = activeWilayah
    ? balitaData.filter(
        (b) => b.kelurahan === activeWilayah.nama && b.risiko === "tinggi"
      )
    : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="MBG & LAPORAN"
        title="Peta Sebaran Risiko Stunting"
        description="Visualisasi sebaran risiko stunting per kelurahan untuk mendukung kebijakan kepala daerah (bupati/wali kota/gubernur)."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Balita Wilayah"
          value={totalBalitaWilayah}
          unit="balita"
          accent="primary"
          icon={<Users className="w-4 h-4" />}
          hint={`${wilayahData.length} kelurahan`}
        />
        <KpiCard
          label="Rata-rata Prevalensi"
          value={Math.round(rataPrevalensi * 10) / 10}
          unit="%"
          accent="warning"
          icon={<TrendingDown className="w-4 h-4" />}
          delta={{ value: 2.8, positive: true, label: "turun vs bulan lalu" }}
        />
        <KpiCard
          label="Wilayah Risiko Tinggi"
          value={wilayahRisikoTinggi}
          unit="kelurahan"
          accent="critical"
          icon={<AlertTriangle className="w-4 h-4" />}
          hint="Prioritas intervensi"
        />
        <KpiCard
          label="Cakupan MBG Rata-rata"
          value={Math.round(rataMBG)}
          unit="%"
          accent="success"
          icon={<UtensilsCrossed className="w-4 h-4" />}
          hint="Sasaran terverifikasi NIK"
        />
      </div>

      {/* Peta visual — grid kartu wilayah (heatmap-like) */}
      <FlatCard pad="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Peta Sebaran Risiko per Kelurahan
            </h3>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              Warna kartu mencerminkan level risiko · klik untuk detail wilayah
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "var(--color-critical)" }} />
              Tinggi
            </span>
            <span className="inline-flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "var(--color-warning)" }} />
              Sedang
            </span>
            <span className="inline-flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "var(--color-success)" }} />
              Rendah
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sebaranRisiko.map((s) => {
            const level = s.level as Level;
            const w = wilayahData.find((x) => x.nama === s.wilayah);
            return (
              <button
                key={s.wilayah}
                type="button"
                onClick={() => setOpenWilayah(w?.id ?? null)}
                className="text-left p-4 rounded-[8px] border-l-[4px] transition-all hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: levelTint[level],
                  borderLeftColor: levelBorder[level],
                  borderTop: "1px solid rgba(181,224,234,0.5)",
                  borderRight: "1px solid rgba(181,224,234,0.5)",
                  borderBottom: "1px solid rgba(181,224,234,0.5)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display text-[16px] truncate" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                      {s.wilayah}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      {s.posyandu} posyandu · {s.balita} balita
                    </div>
                  </div>
                  <StatusBadge
                    tone={level === "tinggi" ? "critical" : level === "sedang" ? "warning" : "success"}
                  >
                    {levelLabel[level]}
                  </StatusBadge>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                      Prevalensi Stunting
                    </div>
                    <div className="font-display tabular-nums" style={{ fontSize: 28, fontWeight: 500, color: "var(--color-primary)", lineHeight: 1.1 }}>
                      {s.prevalensi}%
                    </div>
                  </div>
                  <div className="w-[120px]">
                    <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--color-text-muted)" }}>
                      Cakupan MBG
                    </div>
                    <PitaCapaian
                      value={s.cakupanMBG}
                      state={s.cakupanMBG >= 85 ? "on-track" : s.cakupanMBG >= 70 ? "attention" : "critical"}
                      segments={8}
                      height={6}
                      showLabel={false}
                    />
                    <div className="text-[11px] mt-0.5 font-data" style={{ color: "var(--color-text-muted)" }}>
                      {s.cakupanMBG}%
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </FlatCard>

      {/* Top 3 wilayah prioritas intervensi */}
      <FlatCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Prioritas Intervensi
            </h3>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              3 kelurahan dengan prevalensi stunting tertinggi — rekomendasi tindakan
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-[4px]"
            style={{ backgroundColor: "var(--color-critical-tint)", color: "var(--color-critical)" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-critical)" }} aria-hidden />
            Prioritas
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topPrioritas.map((s, i) => {
            const level = s.level as Level;
            const reks = rekomendasi[level] ?? rekomendasi.tinggi;
            return (
              <div
                key={s.wilayah}
                className="p-4 rounded-[8px] border"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "var(--color-critical)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-[20px] tabular-nums" style={{ color: "var(--color-critical)", fontWeight: 500 }}>
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text)" }}>
                      {s.wilayah}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      {s.posyandu} posyandu · {s.balita} balita
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display tabular-nums" style={{ fontSize: 22, fontWeight: 500, color: "var(--color-critical)" }}>
                    {s.prevalensi}%
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>prevalensi stunting</span>
                </div>
                <ul className="space-y-1.5 text-[12px]">
                  {reks.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5" style={{ color: "var(--color-text)" }}>
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "var(--color-critical)" }} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </FlatCard>

      {/* Pencarian data balita untuk kepala daerah */}
      <FlatCard>
        <div className="mb-3">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
            Pencarian Data Balita
          </h3>
          <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            Khusus kepala daerah — cari balita berdasarkan nama atau NIK untuk monitoring individual
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (searched) setSearched(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCari();
              }}
              placeholder="Cari nama atau NIK balita..."
              className="pl-9"
              style={{ height: 38, fontSize: 13 }}
            />
          </div>
          <Button
            size="sm"
            onClick={handleCari}
            style={{ height: 38, backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
          >
            <Search className="w-4 h-4" />
            Cari
          </Button>
        </div>

        {searched && hasilCari.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {hasilCari.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-[8px] border"
                style={{ borderColor: "rgba(7,30,73,0.08)", backgroundColor: "var(--color-bg)" }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
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
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
                  <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    Status MBG:{" "}
                    <span className="font-data" style={{ color: b.penerimaMBG ? "#3a6b1a" : "var(--color-text-muted)" }}>
                      {b.penerimaMBG ? "Penerima aktif" : "Bukan penerima"}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[12px]"
                    onClick={() => openBalita(b.id)}
                    style={{ color: "var(--color-primary)" }}
                  >
                    Lihat Detail
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {searched && hasilCari.length === 0 && (
          <div className="mt-4 p-4 rounded-[8px] border text-center text-[13px]"
            style={{ borderColor: "rgba(7,30,73,0.08)", backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
            Tidak ada balita yang cocok dengan kriteria pencarian.
          </div>
        )}
      </FlatCard>

      {/* Box info kebijakan */}
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
          <div className="min-w-0">
            <h4 className="text-[14px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Catatan untuk Kepala Daerah
            </h4>
            <p className="text-[13px] mt-1" style={{ color: "var(--color-text)" }}>
              Data ini dapat digunakan penuh oleh kepala daerah sebagai dasar kebijakan anggaran
              dan monitoring MBG di wilayahnya.
            </p>
          </div>
        </div>
      </div>

      {/* Dialog detail wilayah */}
      <Dialog open={openWilayah !== null} onOpenChange={(o) => !o && setOpenWilayah(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-display" style={{ color: "var(--color-primary)" }}>
              {activeWilayah?.nama}
            </DialogTitle>
            <DialogDescription>
              Detail sebaran risiko & daftar balita prioritas di kelurahan ini.
            </DialogDescription>
          </DialogHeader>
          {activeWilayah && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 rounded-[6px]" style={{ backgroundColor: "var(--color-bg)" }}>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>Prevalensi</div>
                  <div className="font-display tabular-nums" style={{ fontSize: 20, fontWeight: 500, color: "var(--color-critical)" }}>
                    {activeWilayah.prevalensiStunting}%
                  </div>
                </div>
                <div className="p-2 rounded-[6px]" style={{ backgroundColor: "var(--color-bg)" }}>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>Balita</div>
                  <div className="font-display tabular-nums" style={{ fontSize: 20, fontWeight: 500, color: "var(--color-primary)" }}>
                    {activeWilayah.jumlahBalita}
                  </div>
                </div>
                <div className="p-2 rounded-[6px]" style={{ backgroundColor: "var(--color-bg)" }}>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>MBG</div>
                  <div className="font-display tabular-nums" style={{ fontSize: 20, fontWeight: 500, color: "var(--color-primary)" }}>
                    {activeWilayah.cakupanMBG}%
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                  <MapPin className="w-3.5 h-3.5" />
                  Posyandu di wilayah ini ({posyanduInWilayah.length})
                </div>
                {posyanduInWilayah.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                    Tidak ada posyandu terdaftar pada mock data.
                  </p>
                ) : (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto scroll-thin pr-1">
                    {posyanduInWilayah.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2 p-2 rounded-[6px]" style={{ backgroundColor: "var(--color-bg)" }}>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text)" }}>{p.nama}</div>
                          <div className="font-data text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                            {p.balitaAktif} balita · {p.kaderAktif} kader · capaian {p.capaianPencatatan}%
                          </div>
                        </div>
                        <StatusBadge tone={p.status === "aktif" ? "success" : p.status === "perlu_perhatian" ? "warning" : "neutral"}>
                          {p.status === "aktif" ? "Aktif" : p.status === "perlu_perhatian" ? "Perlu Perhatian" : "Nonaktif"}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                  <Activity className="w-3.5 h-3.5" />
                  Balita Risiko Tinggi ({balitaTinggiInWilayah.length})
                </div>
                {balitaTinggiInWilayah.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                    Tidak ada balita risiko tinggi di wilayah ini.
                  </p>
                ) : (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto scroll-thin pr-1">
                    {balitaTinggiInWilayah.map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-2 p-2 rounded-[6px]" style={{ backgroundColor: "var(--color-critical-tint)" }}>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text)" }}>{b.nama}</div>
                          <div className="font-data text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                            NIK {b.nik} · {b.usiaBulan} bln
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => openBalita(b.id)} style={{ color: "var(--color-primary)" }}>
                          Detail
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t" style={{ borderColor: "rgba(181,224,234,0.5)" }}>
                <Button
                  size="sm"
                  onClick={() => {
                    setOpenWilayah(null);
                    setSection("data-balita");
                  }}
                  style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
                >
                  Lihat Data Balita Wilayah
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
