"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { edukasiData, formatTanggal } from "@/lib/mock-data";
import type { EdukasiModul } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Plus,
  Search,
  MapPin,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================
// EdukasiSection — KF-05 / MVP #5
// Modul Edukasi Gizi Berbasis Pangan Lokal
// ============================================================

type KategoriFilter = "Semua" | EdukasiModul["kategori"];

const kategoriTone: Record<
  EdukasiModul["kategori"],
  "info" | "success" | "warning" | "critical"
> = {
  MPASI: "info",
  "Pangan Lokal": "success",
  "Gizi Seimbang": "warning",
  "Pencegahan Stunting": "critical",
};

export function EdukasiSection() {
  const [kategori, setKategori] = useState<KategoriFilter>("Semua");
  const [wilayah, setWilayah] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EdukasiModul | null>(null);

  const wilayahOptions = useMemo(() => {
    const set = new Set<string>();
    edukasiData.forEach((e) => set.add(e.wilayah));
    const unique = Array.from(set).filter((w) => w !== "Semua");
    return ["Semua", ...unique];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return edukasiData.filter((e) => {
      if (kategori !== "Semua" && e.kategori !== kategori) return false;
      if (wilayah !== "Semua" && e.wilayah !== wilayah) return false;
      if (q && !e.judul.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kategori, wilayah, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="EDUKASI & SEMINAR"
        title="Edukasi Gizi Pangan Lokal"
        description="Konten edukasi dan rekomendasi menu berbasis pangan lokal sesuai wilayah pengguna."
        actions={
          <Button
            onClick={() =>
              toast.info(
                "[Demo] Fitur tambah modul akan tersedia untuk peran Petugas Gizi Puskesmas (TPG)."
              )
            }
            className="rounded-[8px]"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Modul Edukasi
          </Button>
        }
      />

      {/* Filter bar */}
      <div
        className="rounded-[8px] border p-3 flex flex-col sm:flex-row gap-2"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "rgba(7,30,73,0.08)",
        }}
      >
        <Select
          value={kategori}
          onValueChange={(v) => setKategori(v as KategoriFilter)}
        >
          <SelectTrigger className="w-full sm:w-[200px]" size="sm">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Kategori</SelectItem>
            <SelectItem value="MPASI">MPASI</SelectItem>
            <SelectItem value="Pangan Lokal">Pangan Lokal</SelectItem>
            <SelectItem value="Gizi Seimbang">Gizi Seimbang</SelectItem>
            <SelectItem value="Pencegahan Stunting">
              Pencegahan Stunting
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={wilayah} onValueChange={setWilayah}>
          <SelectTrigger className="w-full sm:w-[220px]" size="sm">
            <SelectValue placeholder="Wilayah" />
          </SelectTrigger>
          <SelectContent>
            {wilayahOptions.map((w) => (
              <SelectItem key={w} value={w}>
                {w === "Semua" ? "Semua Wilayah" : w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul modul edukasi..."
            className="pl-9"
            aria-label="Cari judul modul edukasi"
          />
        </div>
      </div>

      {/* Grid kartu */}
      {filtered.length === 0 ? (
        <EdukasiEmpty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <EdukasiCard key={m.id} modul={m} onOpen={() => setSelected(m)} />
          ))}
        </div>
      )}

      {/* Dialog detail modul */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selected && <EdukasiDetail modul={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------
// EdukasiCard
// ------------------------------------------------------------
function EdukasiCard({
  modul,
  onOpen,
}: {
  modul: EdukasiModul;
  onOpen: () => void;
}) {
  const visibleBahan = modul.bahanUtama.slice(0, 4);
  const sisa = modul.bahanUtama.length - visibleBahan.length;
  const isAllWilayah = modul.wilayah === "Semua";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Buka modul: ${modul.judul}`}
      className="text-left h-full rounded-[8px] border p-4 flex flex-col gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[--tw-ring-color:var(--color-success)] cursor-pointer"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "rgba(7,30,73,0.08)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-info)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(7,30,73,0.08)";
      }}
    >
      {/* Header: badge kategori + durasi baca */}
      <div className="flex items-center justify-between gap-2">
        <StatusBadge tone={kategoriTone[modul.kategori]}>
          {modul.kategori}
        </StatusBadge>
        <span
          className="font-data text-[11px] inline-flex items-center gap-1 whitespace-nowrap"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Clock className="w-3 h-3" aria-hidden />
          · {modul.durasiBaca} mnt baca
        </span>
      </div>

      {/* Judul */}
      <h3
        className="font-display line-clamp-2"
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "var(--color-primary)",
          lineHeight: 1.3,
        }}
      >
        {modul.judul}
      </h3>

      {/* Ringkasan */}
      <p
        className="text-[13px] line-clamp-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        {modul.ringkasan}
      </p>

      {/* Badge wilayah */}
      <div>
        {isAllWilayah ? (
          <StatusBadge tone="neutral">Semua Wilayah</StatusBadge>
        ) : (
          <StatusBadge tone="info" dot={false}>
            <MapPin className="w-3 h-3" aria-hidden />
            {modul.wilayah}
          </StatusBadge>
        )}
      </div>

      <Separator
        className="my-1"
        style={{ backgroundColor: "rgba(181,224,234,0.5)" }}
      />

      {/* Bahan utama */}
      <div>
        <div
          className="text-[11px] uppercase tracking-wide mb-1.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Bahan Utama
        </div>
        <div className="flex flex-wrap gap-1">
          {visibleBahan.map((b, i) => (
            <span
              key={i}
              className="text-[11px] px-1.5 py-0.5 rounded-[4px] border"
              style={{
                backgroundColor: "var(--color-info-tint)",
                color: "var(--color-primary)",
                borderColor: "rgba(181,224,234,0.7)",
              }}
            >
              {b}
            </span>
          ))}
          {sisa > 0 && (
            <span
              className="text-[11px] px-1.5 py-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              +{sisa} lainnya
            </span>
          )}
        </div>
      </div>

      {/* Footer meta: penulis + tanggal terbit */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <span
          className="text-[11px] inline-flex items-center gap-1 min-w-0"
          style={{ color: "var(--color-text-muted)" }}
        >
          <User className="w-3 h-3 flex-shrink-0" aria-hidden />
          <span className="truncate">{modul.penulis}</span>
        </span>
        <span
          className="font-data text-[11px] whitespace-nowrap"
          style={{ color: "var(--color-text-muted)" }}
        >
          {formatTanggal(modul.tanggalTerbit)}
        </span>
      </div>
    </button>
  );
}

// ------------------------------------------------------------
// EdukasiDetail (Dialog content)
// ------------------------------------------------------------
function EdukasiDetail({ modul }: { modul: EdukasiModul }) {
  const isAllWilayah = modul.wilayah === "Semua";
  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <StatusBadge tone={kategoriTone[modul.kategori]}>
            {modul.kategori}
          </StatusBadge>
          {isAllWilayah ? (
            <StatusBadge tone="neutral">Semua Wilayah</StatusBadge>
          ) : (
            <StatusBadge tone="info" dot={false}>
              <MapPin className="w-3 h-3" aria-hidden />
              {modul.wilayah}
            </StatusBadge>
          )}
        </div>
        <DialogTitle
          className="font-display"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {modul.judul}
        </DialogTitle>
        <DialogDescription
          className="text-[13px] leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {modul.ringkasan}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div>
          <div
            className="text-[11px] uppercase tracking-wide mb-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Bahan Utama
          </div>
          <div className="flex flex-wrap gap-1.5">
            {modul.bahanUtama.map((b, i) => (
              <span
                key={i}
                className="text-[12px] px-2 py-0.5 rounded-[4px] border"
                style={{
                  backgroundColor: "var(--color-info-tint)",
                  color: "var(--color-primary)",
                  borderColor: "rgba(181,224,234,0.7)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <Separator style={{ backgroundColor: "rgba(181,224,234,0.5)" }} />

        <div
          className="flex flex-wrap items-center gap-4 text-[12px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" aria-hidden />
            <span style={{ color: "var(--color-text)" }}>{modul.penulis}</span>
          </span>
          <span className="font-data inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {modul.durasiBaca} mnt baca
          </span>
          <span className="font-data">
            Terbit {formatTanggal(modul.tanggalTerbit)}
          </span>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="ghost"
          onClick={() => toast.info(`[Demo] Membuka modul edukasi: ${modul.judul}`)}
          className="rounded-[8px] border"
          style={{
            borderColor: "rgba(7,30,73,0.12)",
            color: "var(--color-primary)",
          }}
        >
          <BookOpen className="w-4 h-4" />
          Buka Modul
        </Button>
      </DialogFooter>
    </>
  );
}

// ------------------------------------------------------------
// Empty state
// ------------------------------------------------------------
function EdukasiEmpty() {
  return (
    <div
      className="rounded-[8px] border p-10 text-center flex flex-col items-center gap-3"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "rgba(7,30,73,0.08)",
      }}
    >
      <div
        className="w-12 h-12 rounded-[8px] flex items-center justify-center"
        style={{ backgroundColor: "var(--color-info-tint)" }}
      >
        <BookOpen
          className="w-6 h-6"
          style={{ color: "var(--color-primary)" }}
          aria-hidden
        />
      </div>
      <div>
        <div
          className="font-display text-[16px]"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          Tidak ada modul yang cocok
        </div>
        <p
          className="text-[13px] mt-1 max-w-sm mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          Coba ubah filter kategori, wilayah, atau kata kunci pencarian untuk
          menemukan modul edukasi yang relevan.
        </p>
      </div>
    </div>
  );
}
