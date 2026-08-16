"use client";

import { useMemo, useState } from "react";
import { SectionHeader, FlatCard } from "@/components/section";
import { PitaCapaian } from "@/components/pita-capaian";
import { StatusBadge } from "@/components/status-badge";
import { laporanData } from "@/lib/mock-data";
import type { LaporanBulanan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  FileText,
  Archive,
  FileUp,
  CheckCircle2,
  FileEdit,
  FilePlus2,
} from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "semua" | "lengkap" | "draft" | "belum";

const PERIODE_OPTIONS = [
  { value: "2026-01", label: "Januari 2026" },
  { value: "2025-12", label: "Desember 2025" },
];

const PERIODE_LABEL: Record<string, string> = {
  "2026-01": "Januari 2026",
  "2025-12": "Desember 2025",
};

export function LaporanSection() {
  const [periode, setPeriode] = useState<string>("2026-01");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [laporanList, setLaporanList] = useState<LaporanBulanan[]>(laporanData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLaporan, setActiveLaporan] = useState<LaporanBulanan | null>(null);
  const [formData, setFormData] = useState<Partial<LaporanBulanan>>({});

  const laporan = useMemo(() => {
    return laporanList.filter((l) => {
      if (l.periode !== periode) return false;
      if (statusFilter === "semua") return true;
      return l.statusPengumpulan === statusFilter;
    });
  }, [periode, statusFilter, laporanList]);

  const summary = useMemo(() => {
    const base = laporanList.filter((l) => l.periode === periode);
    const lengkap = base.filter((l) => l.statusPengumpulan === "lengkap").length;
    const draft = base.filter((l) => l.statusPengumpulan === "draft").length;
    const belum = base.filter((l) => l.statusPengumpulan === "belum").length;
    const total = base.length;
    const kelengkapan = total > 0 ? Math.round((lengkap / total) * 100) : 0;
    return { total, lengkap, draft, belum, kelengkapan };
  }, [periode, laporanList]);

  const handleUnduhPdf = (l: LaporanBulanan) => {
    const filename = `Laporan-Bulanan-${l.posyanduNama.replace(/\s+/g, '_')}-${l.periode}.csv`;
    const header = "Posyandu,Periode,Wilayah,Total Balita,Diukur,Rendah,Sedang,Tinggi,Cakupan MBG,Rujukan Dilakukan\n";
    const row = `${l.posyanduNama},${PERIODE_LABEL[l.periode]},${l.wilayah},${l.totalBalita},${l.balitaDiukur},${l.balitaRendah},${l.balitaBerisikoSedang},${l.balitaBerisikoTinggi},${l.cakupanMBG}%,${l.rujukanDilakukan}\n`;
    const content = header + row;
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Laporan ${l.posyanduNama} berhasil diunduh.`);
  };

  const handleOpenModal = (l: LaporanBulanan) => {
    setActiveLaporan(l);
    setFormData({
      totalBalita: l.totalBalita,
      balitaDiukur: l.balitaDiukur,
      balitaRendah: l.balitaRendah,
      balitaBerisikoSedang: l.balitaBerisikoSedang,
      balitaBerisikoTinggi: l.balitaBerisikoTinggi,
      cakupanMBG: l.cakupanMBG,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = () => {
    if (!activeLaporan) return;
    
    setLaporanList((prev) => 
      prev.map((item) => {
        if (item.id === activeLaporan.id) {
          return {
            ...item,
            ...formData,
            statusPengumpulan: "lengkap",
          } as LaporanBulanan;
        }
        return item;
      })
    );
    
    setIsModalOpen(false);
    toast.success("Laporan bulanan berhasil disimpan dan diverifikasi!");
  };

  const handleUnduhSemua = () => {
    const filename = "rekap-laporan-semua-posyandu.csv";
    const header = "Posyandu,Periode,Wilayah,Total Balita,Diukur,Rendah,Sedang,Tinggi,Cakupan MBG,Rujukan Dilakukan,Status\n";
    const rows = laporanList.map((l) => 
      `${l.posyanduNama},${PERIODE_LABEL[l.periode]},${l.wilayah},${l.totalBalita},${l.balitaDiukur},${l.balitaRendah},${l.balitaBerisikoSedang},${l.balitaBerisikoTinggi},${l.cakupanMBG}%,${l.rujukanDilakukan},${l.statusPengumpulan}`
    ).join('\n');
    const content = header + rows;
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Semua laporan berhasil diunduh.");
  };

  const handleEksporEppgbm = () => {
    const filename = "ekspor-eppgbm-jatinegara.csv";
    const header = "NIK,Nama_Balita,Jenis_Kelamin,Tanggal_Lahir,Berat_Badan,Tinggi_Badan,Status_Gizi,Posyandu\n";
    let rows = "";
    laporanList.forEach(l => {
        if (l.statusPengumpulan === "lengkap") {
            rows += `1234567890123456,Balita ${l.posyanduNama} A,L,2024-01-01,10.5,80.2,Gizi Baik,${l.posyanduNama}\n`;
            rows += `1234567890123457,Balita ${l.posyanduNama} B,P,2024-02-01,9.5,75.2,Risiko Stunting,${l.posyanduNama}\n`;
        }
    });
    
    const content = header + rows;
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data e-PPGBM berhasil diekspor.");
  };

  const statusBadge = (s: LaporanBulanan["statusPengumpulan"]) => {
    if (s === "lengkap")
      return <StatusBadge tone="success">Lengkap</StatusBadge>;
    if (s === "draft")
      return <StatusBadge tone="warning">Draft</StatusBadge>;
    return <StatusBadge tone="critical">Belum</StatusBadge>;
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="MBG & LAPORAN"
        title="Laporan Bulanan Posyandu"
        description="Rekap data bulanan posyandu yang dapat diunduh untuk pelaporan ke Dinas Kesehatan."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEksporEppgbm}
              className="border"
              style={{
                borderColor: "rgba(181,224,234,0.7)",
                color: "var(--color-primary)",
              }}
            >
              <FileUp className="w-4 h-4" />
              Ekspor ke e-PPGBM
            </Button>
            <Button
              size="sm"
              onClick={handleUnduhSemua}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
              }}
            >
              <Archive className="w-4 h-4" />
              Unduh Semua (ZIP)
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <FlatCard>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "var(--color-text-muted)" }}>
              Periode
            </label>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[200px]" style={{ height: 36, fontSize: 13 }}>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {PERIODE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "var(--color-text-muted)" }}>
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-[180px]" style={{ height: 36, fontSize: 13 }}>
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="lengkap">Lengkap</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="belum">Belum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            Menampilkan <span className="font-data" style={{ color: "var(--color-text)" }}>{laporan.length}</span> dari {summary.total} posyandu
          </div>
        </div>
      </FlatCard>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FlatCard pad="p-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Total Posyandu
            </span>
          </div>
          <div className="mt-1.5 font-display tabular-nums" style={{ fontSize: 28, fontWeight: 500, color: "var(--color-primary)" }}>
            {summary.total}
          </div>
        </FlatCard>
        <FlatCard pad="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-success)" }} />
            <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Lengkap
            </span>
          </div>
          <div className="mt-1.5 font-display tabular-nums" style={{ fontSize: 28, fontWeight: 500, color: "var(--color-primary)" }}>
            {summary.lengkap}
          </div>
        </FlatCard>
        <FlatCard pad="p-3">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4" style={{ color: "var(--color-warning)" }} />
            <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Draft
            </span>
          </div>
          <div className="mt-1.5 font-display tabular-nums" style={{ fontSize: 28, fontWeight: 500, color: "var(--color-primary)" }}>
            {summary.draft}
          </div>
        </FlatCard>
        <FlatCard pad="p-3">
          <div className="flex items-center gap-2">
            <FilePlus2 className="w-4 h-4" style={{ color: "var(--color-critical)" }} />
            <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Belum
            </span>
          </div>
          <div className="mt-1.5 font-display tabular-nums" style={{ fontSize: 28, fontWeight: 500, color: "var(--color-primary)" }}>
            {summary.belum}
          </div>
        </FlatCard>
      </div>

      {/* Pita kelengkapan agregat */}
      <FlatCard pad="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--color-primary)" }}>
              Kelengkapan Laporan Agregat — {PERIODE_LABEL[periode]}
            </div>
            <div className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {summary.lengkap} dari {summary.total} posyandu telah melengkapi laporan bulanan
            </div>
          </div>
          <div className="w-full sm:w-[280px]">
            <PitaCapaian value={summary.kelengkapan} state="on-track" segments={12} height={8} />
          </div>
        </div>
      </FlatCard>

      {/* Tabel laporan */}
      <FlatCard pad="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left" style={{ color: "var(--color-text-muted)" }}>
                <th className="font-medium text-[11px] uppercase tracking-wide px-4 py-2">Posyandu</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 hidden md:table-cell">Wilayah</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">Total</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">Diukur</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right" style={{ color: "#3a6b1a" }}>Rendah</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right" style={{ color: "#6b4f1a" }}>Sedang</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right" style={{ color: "var(--color-critical)" }}>Tinggi</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">MBG</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right hidden lg:table-cell">Rujukan</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2">Status</th>
                <th className="font-medium text-[11px] uppercase tracking-wide px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                    Tidak ada laporan pada periode dan filter ini.
                  </td>
                </tr>
              )}
              {laporan.map((l) => (
                <tr
                  key={l.id}
                  className="border-t hover:bg-[var(--color-info-tint)] transition-colors"
                  style={{ borderColor: "rgba(181,224,234,0.5)" }}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold" style={{ color: "var(--color-text)" }}>{l.posyanduNama}</div>
                    <div className="font-data text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      {l.diunduhPada ? `Diunduh ${l.diunduhPada}` : "Belum diunduh"}
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell" style={{ color: "var(--color-text)" }}>{l.wilayah}</td>
                  <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-text)" }}>{l.totalBalita}</td>
                  <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-text)" }}>{l.balitaDiukur}</td>
                  <td className="px-3 py-3 text-right font-data" style={{ color: "#3a6b1a" }}>{l.balitaRendah}</td>
                  <td className="px-3 py-3 text-right font-data" style={{ color: "#6b4f1a" }}>{l.balitaBerisikoSedang}</td>
                  <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-critical)" }}>{l.balitaBerisikoTinggi}</td>
                  <td className="px-3 py-3 text-right font-data" style={{ color: "var(--color-text)" }}>{l.cakupanMBG}%</td>
                  <td className="px-3 py-3 text-right font-data hidden lg:table-cell" style={{ color: "var(--color-text)" }}>{l.rujukanDilakukan}</td>
                  <td className="px-3 py-3">{statusBadge(l.statusPengumpulan)}</td>
                  <td className="px-3 py-3 text-right">
                    {l.statusPengumpulan === "lengkap" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[12px] border"
                        style={{ borderColor: "rgba(181,224,234,0.7)", color: "var(--color-primary)" }}
                        onClick={() => handleUnduhPdf(l)}
                      >
                        <Download className="w-3 h-3" />
                        Unduh PDF
                      </Button>
                    )}
                    {l.statusPengumpulan === "draft" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[12px] border"
                        style={{
                          borderColor: "rgba(209,176,108,0.5)",
                          backgroundColor: "var(--color-warning-tint)",
                          color: "#6b4f1a",
                        }}
                        onClick={() => handleOpenModal(l)}
                      >
                        <FileEdit className="w-3 h-3" />
                        Lengkapi
                      </Button>
                    )}
                    {l.statusPengumpulan === "belum" && (
                      <Button
                        size="sm"
                        className="h-7 px-2 text-[12px]"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "#FFFFFF",
                        }}
                        onClick={() => handleOpenModal(l)}
                      >
                        <FilePlus2 className="w-3 h-3" />
                        Mulai
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FlatCard>

      {/* Dialog Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lengkapi Laporan</DialogTitle>
            <DialogDescription>
              {activeLaporan?.posyanduNama} - {activeLaporan?.periode && PERIODE_LABEL[activeLaporan.periode]}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalBalita" className="text-right text-xs">Total Balita</Label>
              <Input
                id="totalBalita"
                type="number"
                value={formData.totalBalita || ""}
                onChange={(e) => setFormData({ ...formData, totalBalita: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balitaDiukur" className="text-right text-xs">Diukur</Label>
              <Input
                id="balitaDiukur"
                type="number"
                value={formData.balitaDiukur || ""}
                onChange={(e) => setFormData({ ...formData, balitaDiukur: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balitaRendah" className="text-right text-xs">Risiko Rendah</Label>
              <Input
                id="balitaRendah"
                type="number"
                value={formData.balitaRendah || ""}
                onChange={(e) => setFormData({ ...formData, balitaRendah: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balitaSedang" className="text-right text-xs">Risiko Sedang</Label>
              <Input
                id="balitaSedang"
                type="number"
                value={formData.balitaBerisikoSedang || ""}
                onChange={(e) => setFormData({ ...formData, balitaBerisikoSedang: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balitaTinggi" className="text-right text-xs">Risiko Tinggi</Label>
              <Input
                id="balitaTinggi"
                type="number"
                value={formData.balitaBerisikoTinggi || ""}
                onChange={(e) => setFormData({ ...formData, balitaBerisikoTinggi: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cakupanMBG" className="text-right text-xs">Cakupan MBG (%)</Label>
              <Input
                id="cakupanMBG"
                type="number"
                value={formData.cakupanMBG || ""}
                onChange={(e) => setFormData({ ...formData, cakupanMBG: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveForm}>Simpan & Verifikasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

