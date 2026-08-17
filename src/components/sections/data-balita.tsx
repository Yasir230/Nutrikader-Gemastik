"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Users, AlertTriangle, UtensilsCrossed, FileText } from "lucide-react";
import { toast } from "sonner";

import { SectionHeader, FlatCard } from "@/components/section";
import { RiskBadge, StatusBadge, SyncBadge } from "@/components/status-badge";
import { useNav } from "@/lib/nav-store";
import { posyanduData } from "@/lib/mock-data";
import type { Balita } from "@/lib/types";
import { createBalita, deleteBalita, listBalita, updateBalita, type BalitaRecord } from "@/lib/balita-client";
import { listConflicts, resolveBalitaConflict } from "@/lib/sync-engine";
import type { SyncConflict } from "@/lib/sync/types";
import type { RiskLevel } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ============================================================
// NUTRIKADER — Data Balita section
// KF-02 (input antropometri), KF-13 (daftar balita), MVP #2 & #14
// ============================================================

export function DataBalitaSection() {
  const { openBalita } = useNav();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [posyanduFilter, setPosyanduFilter] = useState<"all" | string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BalitaRecord | null>(null);
  const [balita, setBalita] = useState<BalitaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setBalita(await listBalita());
      setConflicts(await listConflicts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    const onOnline = () => void refresh();
    window.addEventListener("online", onOnline);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return balita.filter((b) => {
      if (q) {
        const hay = `${b.nama} ${b.nik} ${b.namaIbu}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (riskFilter !== "all" && b.risiko !== riskFilter) return false;
      if (posyanduFilter !== "all" && b.posyanduId !== posyanduFilter) return false;
      return true;
    });
  }, [search, riskFilter, posyanduFilter]);

  const totalTinggi = filtered.filter((b) => b.risiko === "tinggi").length;
  const totalMBG = filtered.filter((b) => b.penerimaMBG).length;
  const hasActiveFilter = search !== "" || riskFilter !== "all" || posyanduFilter !== "all";

  function resetFilters() {
    setSearch("");
    setRiskFilter("all");
    setPosyanduFilter("all");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const existing = editing;
    const posyandu = posyanduData.find((p) => p.id === String(fd.get("posyanduId"))) ?? posyanduData[0];
    const data: Balita = {
      id: existing?.id ?? "",
      nik: String(fd.get("nik") || "").trim(),
      nama: String(fd.get("nama") || "").trim(),
      jenisKelamin: String(fd.get("jenisKelamin") || "L") as "L" | "P",
      tanggalLahir: String(fd.get("tanggalLahir") || ""),
      posyanduId: posyandu?.id ?? "",
      posyanduNama: posyandu?.nama ?? "",
      kelurahan: posyandu?.kelurahan ?? "",
      namaIbu: String(fd.get("namaIbu") || "").trim(),
      beratLahir: Number(fd.get("beratLahir") || 0),
      tinggiLahir: Number(fd.get("tinggiLahir") || 0),
      usiaBulan: Number(fd.get("usiaBulan") || 0),
      risiko: String(fd.get("risiko") || "rendah") as RiskLevel,
      alasanRisiko: existing?.alasanRisiko ?? ["Belum ada penilaian risiko"],
      pengukuran: existing?.pengukuran ?? [{
        id: crypto.randomUUID(),
        tanggal: new Date().toISOString().slice(0, 10),
        usiaBulan: Number(fd.get("usiaBulan") || 0),
        beratBadan: Number(fd.get("beratBadan") || 0),
        tinggiBadan: Number(fd.get("tinggiBadan") || 0),
        lingkarKepala: Number(fd.get("lingkarKepala") || 0),
        zScoreBBU: 0,
        zScoreTBU: 0,
        catatan: String(fd.get("catatan") || "") || undefined,
      }],
      imunisasi: existing?.imunisasi ?? [],
      penerimaanMBG: existing?.penerimaanMBG ?? [],
      penerimaMBG: fd.get("penerimaMBG") === "on",
      statusPosyandu: String(fd.get("statusPosyandu") || "aktif") as "aktif" | "lulus",
      sinkronisasi: existing?.sinkronisasi ?? "tertunda",
      catatanKader: String(fd.get("catatan") || "").trim() || undefined,
      fotoSeed: existing?.fotoSeed ?? "default",
    };

    if (!data.nama || !data.nik || !data.tanggalLahir || !data.namaIbu) {
      toast.error("Nama, NIK, tanggal lahir, dan nama ibu wajib diisi.");
      return;
    }

    try {
      const result = existing
        ? await updateBalita({ ...data, version: existing.version, updatedAt: existing.updatedAt })
        : await createBalita(data);

      if ("conflict" in result && result.conflict) {
        toast.error("Konflik data ditemukan. Pilih versi server atau versi lokal.");
      } else {
        toast.success(result.queued ? "Disimpan offline; masuk antrean sinkronisasi." : existing ? "Data balita diperbarui." : "Data balita tersimpan di server.");
        setDialogOpen(false);
        setEditing(null);
        await refresh();
      }
    } catch {
      toast.error("Data gagal disimpan.");
    }
  }

  async function handleDelete(item: BalitaRecord) {
    if (!window.confirm(`Hapus data ${item.nama}?`)) return;
    const result = await deleteBalita(item);
    if ("conflict" in result && result.conflict) {
      toast.error("Penghapusan konflik. Pilih versi yang benar pada panel konflik.");
    } else {
      toast.success(result.queued ? "Penghapusan disimpan di antrean offline." : "Data balita dihapus.");
      await refresh();
    }
  }

  async function handleConflict(conflict: SyncConflict, choice: "server" | "local") {
    try {
      await resolveBalitaConflict(conflict, choice);
      toast.success(choice === "server" ? "Versi server dipertahankan." : "Versi lokal dipertahankan dan dikirim.");
      await refresh();
    } catch {
      toast.error("Resolusi konflik gagal. Pastikan koneksi tersedia.");
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Data Balita"
        description="Pencatatan antropometri, status risiko, dan integrasi MBG per balita aktif di seluruh posyandu."
        actions={
          <button
            type="button"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            className="px-3 py-2 rounded-[8px] text-[13px] font-medium inline-flex items-center gap-1.5"
            style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
          >
            <Plus className="w-4 h-4" />
            Input Data Balita
          </button>
        }
      />

      {conflicts.length > 0 && (
        <FlatCard pad="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-semibold" style={{ color: "var(--color-critical)" }}>
                Konflik sinkronisasi ({conflicts.length})
              </div>
              <div className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                Jangan overwrite diam-diam. Pilih versi server atau versi lokal untuk setiap konflik.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="rounded-[8px] border p-3" style={{ borderColor: "rgba(179,58,58,0.2)" }}>
                <div className="font-medium" style={{ color: "var(--color-text)" }}>
                  {conflict.localPayload.nama}
                </div>
                <div className="text-[12px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                  Versi lokal: v{conflict.localPayload.version} · Versi server: v{conflict.serverPayload?.version ?? "—"}
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => void handleConflict(conflict, "server")} className="px-2.5 py-1.5 rounded-[6px] border text-[12px]">
                    Pakai Server
                  </button>
                  <button type="button" onClick={() => void handleConflict(conflict, "local")} className="px-2.5 py-1.5 rounded-[6px] text-[12px]" style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}>
                    Pakai Lokal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </FlatCard>
      )}

      {/* Filter bar */}
      <FlatCard pad="p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-text-muted)" }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama balita, NIK, atau nama ibu…"
              className="pl-9 rounded-[4px] h-9"
              style={{ borderColor: "rgba(7,30,73,0.14)" }}
              aria-label="Cari balita"
            />
          </div>

          {/* Risk filter */}
          <div className="flex items-center gap-2">
            <Label
              className="text-[12px] whitespace-nowrap"
              style={{ color: "var(--color-text-muted)" }}
            >
              Risiko
            </Label>
            <Select
              value={riskFilter}
              onValueChange={(v) => setRiskFilter(v as "all" | RiskLevel)}
            >
              <SelectTrigger
                className="w-[150px] rounded-[4px] h-9"
                style={{ borderColor: "rgba(7,30,73,0.14)" }}
                aria-label="Filter risiko"
              >
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="rounded-[8px]">
                <SelectItem value="all">Semua risiko</SelectItem>
                <SelectItem value="rendah">Rendah</SelectItem>
                <SelectItem value="sedang">Sedang</SelectItem>
                <SelectItem value="tinggi">Tinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posyandu filter */}
          <div className="flex items-center gap-2">
            <Label
              className="text-[12px] whitespace-nowrap"
              style={{ color: "var(--color-text-muted)" }}
            >
              Posyandu
            </Label>
            <Select value={posyanduFilter} onValueChange={(v) => setPosyanduFilter(v)}>
              <SelectTrigger
                className="w-[200px] rounded-[4px] h-9"
                style={{ borderColor: "rgba(7,30,73,0.14)" }}
                aria-label="Filter posyandu"
              >
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="rounded-[8px]">
                <SelectItem value="all">Semua posyandu</SelectItem>
                {posyanduData.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium border"
              style={{
                borderColor: "rgba(7,30,73,0.14)",
                color: "var(--color-primary)",
                backgroundColor: "transparent",
              }}
            >
              Reset
            </button>
          )}
        </div>
      </FlatCard>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat
          label="Total ditampilkan"
          value={filtered.length}
          icon={<Users className="w-4 h-4" />}
          accent="primary"
        />
        <MiniStat
          label="Risiko Tinggi"
          value={totalTinggi}
          icon={<AlertTriangle className="w-4 h-4" />}
          accent="critical"
        />
        <MiniStat
          label="Penerima MBG"
          value={totalMBG}
          icon={<UtensilsCrossed className="w-4 h-4" />}
          accent="success"
        />
      </div>

      {/* Tabel balita */}
      <FlatCard pad="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[480px] overflow-y-auto scroll-thin">
            <table className="w-full text-[13px] min-w-[960px]">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderBottom: "1px solid rgba(181,224,234,0.5)",
                }}
              >
                <tr className="text-left" style={{ color: "var(--color-text-muted)" }}>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-4">
                    Nama Balita
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-3">
                    Posyandu
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-3 text-right">
                    Usia
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-3">
                    Risiko
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-3">
                    Penerima MBG
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-3">
                    Sinkronisasi
                  </th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-3 px-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center" style={{ color: "var(--color-text-muted)" }}>Memuat data balita…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search
                          className="w-6 h-6"
                          style={{ color: "var(--color-text-muted)" }}
                        />
                        <p
                          className="text-[13px] font-medium"
                          style={{ color: "var(--color-text)" }}
                        >
                          Tidak ada balita yang cocok dengan filter.
                        </p>
                        <p
                          className="text-[12px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Coba ubah kata kunci atau reset filter.
                        </p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 px-3 py-1.5 rounded-[8px] text-[12px] font-medium border"
                          style={{
                            borderColor: "rgba(7,30,73,0.14)",
                            color: "var(--color-primary)",
                            backgroundColor: "transparent",
                          }}
                        >
                          Reset filter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => openBalita(b.id)}
                      className="cursor-pointer border-t transition-colors hover:bg-[var(--color-info-tint)]"
                      style={{ borderColor: "rgba(181,224,234,0.5)" }}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold" style={{ color: "var(--color-text)" }}>
                          {b.nama}
                        </div>
                        <div
                          className="font-data text-[11px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          NIK {b.nik}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div style={{ color: "var(--color-text)" }}>{b.posyanduNama}</div>
                        <div
                          className="text-[11px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {b.kelurahan}
                        </div>
                      </td>
                      <td
                        className="py-3 px-3 text-right font-data"
                        style={{ color: "var(--color-text)" }}
                      >
                        {b.usiaBulan} bln
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge level={b.risiko} />
                      </td>
                      <td className="py-3 px-3">
                        {b.penerimaMBG ? (
                          <StatusBadge tone="success">Aktif</StatusBadge>
                        ) : (
                          <StatusBadge tone="info" dot={false}>
                            Belum
                          </StatusBadge>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <SyncBadge status={b.sinkronisasi} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="inline-flex gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openBalita(b.id)}
                            className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium border"
                            style={{
                              borderColor: "rgba(7,30,73,0.14)",
                              color: "var(--color-primary)",
                              backgroundColor: "transparent",
                            }}
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => openBalita(b.id, "kisb")}
                            className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1"
                            style={{
                              backgroundColor: "var(--color-primary)",
                              color: "#FFFFFF",
                            }}
                          >
                            <FileText className="w-3 h-3" />
                            KISB
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditing(b); setDialogOpen(true); }}
                            className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium border"
                            style={{ borderColor: "rgba(7,30,73,0.14)", color: "var(--color-primary)" }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(b)}
                            className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium border"
                            style={{ borderColor: "rgba(179,58,58,0.25)", color: "var(--color-critical)" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FlatCard>

      {/* Dialog form input antropometri (KF-02) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[560px] rounded-[12px] max-h-[85vh] overflow-y-auto p-4 sm:p-6 border-none"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display text-[20px]"
              style={{ color: "var(--color-primary)", fontWeight: 500 }}
            >
              {editing ? "Edit Data Balita" : "Input Data Balita"}
            </DialogTitle>
            <DialogDescription style={{ color: "var(--color-text-muted)" }}>
              Catat antropometri baru. Data akan tersinkron otomatis ke server BGN.
            </DialogDescription>
          </DialogHeader>

          <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nik" style={{ color: "var(--color-text)" }}>
                  NIK
                </Label>
                <Input
                  id="nik"
                  name="nik"
                  defaultValue={editing?.nik ?? ""}
                  required
                  placeholder="16 digit NIK"
                  className="font-data rounded-[4px]"
                  style={{ borderColor: "rgba(7,30,73,0.14)" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nama" style={{ color: "var(--color-text)" }}>
                  Nama Balita
                </Label>
                <Input
                  id="nama"
                  name="nama"
                  defaultValue={editing?.nama ?? ""}
                  required
                  placeholder="Nama lengkap"
                  className="rounded-[4px]"
                  style={{ borderColor: "rgba(7,30,73,0.14)" }}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="namaIbu" style={{ color: "var(--color-text)" }}>Nama Ibu</Label>
                <Input id="namaIbu" name="namaIbu" defaultValue={editing?.namaIbu ?? ""} required className="rounded-[4px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={{ color: "var(--color-text)" }}>Jenis Kelamin</Label>
                <RadioGroup
                  name="jenisKelamin"
                  defaultValue={editing?.jenisKelamin ?? "L"}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="L" id="jk-l" />
                    <Label htmlFor="jk-l" style={{ color: "var(--color-text)" }}>
                      Laki-laki
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="P" id="jk-p" />
                    <Label htmlFor="jk-p" style={{ color: "var(--color-text)" }}>
                      Perempuan
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tglLahir" style={{ color: "var(--color-text)" }}>
                  Tanggal Lahir
                </Label>
                <Input
                  id="tglLahir"
                  name="tanggalLahir"
                  defaultValue={editing?.tanggalLahir ?? ""}
                  type="date"
                  required
                  className="font-data rounded-[4px]"
                  style={{ borderColor: "rgba(7,30,73,0.14)" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label style={{ color: "var(--color-text)" }}>Posyandu</Label>
              <Select name="posyanduId" defaultValue={editing?.posyanduId ?? posyanduData[0]?.id}>
                <SelectTrigger
                  className="w-full rounded-[4px] h-9"
                  style={{ borderColor: "rgba(7,30,73,0.14)" }}
                >
                  <SelectValue placeholder="Pilih posyandu" />
                </SelectTrigger>
                <SelectContent className="rounded-[8px]">
                  {posyanduData.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama} — {p.kelurahan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="beratBadan" style={{ color: "var(--color-text)" }}>BB (kg)</Label>
                <Input id="beratBadan" name="beratBadan" type="number" step="0.1" defaultValue={editing?.pengukuran.at(-1)?.beratBadan ?? ""} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tinggiBadan" style={{ color: "var(--color-text)" }}>TB (cm)</Label>
                <Input id="tinggiBadan" name="tinggiBadan" type="number" step="0.1" defaultValue={editing?.pengukuran.at(-1)?.tinggiBadan ?? ""} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usiaBulan" style={{ color: "var(--color-text)" }}>Usia (bln)</Label>
                <Input id="usiaBulan" name="usiaBulan" type="number" min="0" defaultValue={editing?.usiaBulan ?? ""} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lingkarKepala" className="whitespace-nowrap" style={{ color: "var(--color-text)" }}>Lingkar Kepala (cm)</Label>
                <Input id="lingkarKepala" name="lingkarKepala" type="number" step="0.1" defaultValue={editing?.pengukuran.at(-1)?.lingkarKepala ?? ""} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catatan" style={{ color: "var(--color-text)" }}>
                Catatan (opsional)
              </Label>
              <Textarea
                id="catatan"
                name="catatan"
                defaultValue={editing?.catatanKader ?? ""}
                placeholder="Contoh: ibu melaporkan anak demam minggu lalu…"
                className="rounded-[4px]"
                style={{ borderColor: "rgba(7,30,73,0.14)" }}
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium border"
                style={{
                  borderColor: "rgba(7,30,73,0.14)",
                  color: "var(--color-primary)",
                  backgroundColor: "transparent",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium"
                style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
              >
                Simpan Data Balita
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----- Mini stat card (untuk summary strip) -----
function MiniStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "primary" | "critical" | "success";
}) {
  const accentColor =
    accent === "primary"
      ? "var(--color-primary)"
      : accent === "critical"
      ? "var(--color-critical)"
      : "var(--color-success)";
  return (
    <div
      className="rounded-[8px] p-3 border flex items-center gap-3"
      style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(7,30,73,0.08)" }}
    >
      <span
        className="w-8 h-8 rounded-[6px] inline-flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "var(--color-info-tint)", color: accentColor }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className="text-[11px] uppercase tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </div>
        <div
          className="font-display tabular-nums"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "var(--color-primary)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
