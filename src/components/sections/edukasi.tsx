"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
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
  Download,
  Share2,
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
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [kategori, setKategori] = useState<KategoriFilter>("Semua");
  const [wilayah, setWilayah] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EdukasiModul | null>(null);
  const [bukaModul, setBukaModul] = useState<EdukasiModul | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const handleDownload = () => {
    if (!bukaModul) return;
    const content = `NutriKader — Program MBG Badan Gizi Nasional\n\nJudul: ${bukaModul.judul}\nKategori: ${bukaModul.kategori}\nWaktu Baca: ${bukaModul.durasiBaca} menit\nTarget Sasaran: ${bukaModul.wilayah === "Semua" ? "Semua Wilayah" : bukaModul.wilayah}\n\nRingkasan:\n${bukaModul.ringkasan}\n\nRincian Resep:\nBahan Utama: ${bukaModul.bahanUtama.join(", ")}\n\nNilai Gizi (Per Porsi):\nKalori: 250 kcal\nProtein: 12 g\nZat Besi: 4.5 mg\n\nLangkah-langkah:\n1. Cuci bersih semua bahan utama (${bukaModul.bahanUtama.join(", ")}).\n2. Siapkan bumbu halus dan tumis dengan sedikit minyak hingga harum.\n3. Masukkan bahan utama, tambahkan air secukupnya, dan masak hingga tekstur sesuai untuk anak/balita.\n4. Sajikan selagi hangat untuk mempertahankan nilai gizi optimal dan meningkatkan selera makan.\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bukaModul.judul}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Panduan PDF/Modul berhasil diunduh.");
  };

  const handleShare = () => {
    if (!bukaModul) return;
    const text = `*NutriKader — Program MBG Badan Gizi Nasional*\n\nMari baca modul edukasi ini:\n*${bukaModul.judul}*\n\nRingkasan: ${bukaModul.ringkasan}\n\nKategori: ${bukaModul.kategori}\nBahan Utama: ${bukaModul.bahanUtama.join(", ")}\n\nBagikan panduan ini untuk membantu cegah stunting dan penuhi gizi anak-anak kita!`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
    toast.success("Membuka WhatsApp...");
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <SectionHeader
        eyebrow="EDUKASI & SEMINAR"
        title="Edukasi Gizi Pangan Lokal"
        description="Konten edukasi dan rekomendasi menu berbasis pangan lokal sesuai wilayah pengguna."
        actions={
          isAdmin && (
            <Button
              onClick={() => setIsAddOpen(true)}
              className="rounded-[8px]"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
              }}
            >
              <Plus className="w-4 h-4" />
              Tambah Modul Edukasi
            </Button>
          )
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full">
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
          {selected && (
            <EdukasiDetail
              modul={selected}
              onBukaModul={() => {
                setBukaModul(selected);
                setSelected(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Buka Modul */}
      <Dialog
        open={!!bukaModul}
        onOpenChange={(open) => !open && setBukaModul(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {bukaModul && (
            <>
              <DialogHeader>
                <DialogTitle
                  style={{ color: "var(--color-primary)", fontWeight: 500 }}
                  className="text-xl"
                >
                  {bukaModul.judul}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                  <StatusBadge tone={kategoriTone[bukaModul.kategori]}>
                    {bukaModul.kategori}
                  </StatusBadge>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {bukaModul.penulis}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {bukaModul.durasiBaca} mnt baca
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <h4
                    className="font-medium text-[15px]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Ringkasan Materi & Manfaat Pangan Lokal
                  </h4>
                  <p className="text-[13.5px] leading-relaxed text-gray-600">
                    {bukaModul.ringkasan} Pangan lokal ini sangat bermanfaat untuk
                    memenuhi kebutuhan gizi harian anak dan keluarga, mendukung
                    pertumbuhan, serta mencegah stunting secara efektif karena mudah
                    didapatkan di lingkungan sekitar dengan harga terjangkau.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4
                    className="font-medium text-[15px]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Resep & Takaran Gizi (Per Porsi)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 border rounded-[8px] text-center bg-gray-50">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Kalori
                      </div>
                      <div className="font-medium text-gray-900">250 kcal</div>
                    </div>
                    <div className="p-3 border rounded-[8px] text-center bg-gray-50">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Protein
                      </div>
                      <div className="font-medium text-gray-900">12 g</div>
                    </div>
                    <div className="p-3 border rounded-[8px] text-center bg-gray-50">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Zat Besi
                      </div>
                      <div className="font-medium text-gray-900">4.5 mg</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4
                    className="font-medium text-[15px]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Langkah Pembuatan Makanan Bergizi
                  </h4>
                  <ol className="list-decimal pl-4 text-[13.5px] text-gray-600 space-y-2">
                    <li>
                      Cuci bersih semua bahan utama (
                      {bukaModul.bahanUtama.join(", ")}).
                    </li>
                    <li>
                      Siapkan bumbu halus dan tumis dengan sedikit minyak hingga harum.
                    </li>
                    <li>
                      Masukkan bahan utama, tambahkan air secukupnya, dan masak hingga
                      tekstur sesuai untuk anak/balita.
                    </li>
                    <li>
                      Sajikan selagi hangat untuk mempertahankan nilai gizi optimal dan
                      meningkatkan selera makan.
                    </li>
                  </ol>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-[8px]"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Unduh Panduan PDF
                </Button>
                <Button
                  className="flex items-center gap-2 rounded-[8px]"
                  onClick={handleShare}
                  style={{ backgroundColor: "#25D366", color: "white" }}
                >
                  <Share2 className="w-4 h-4" />
                  Bagikan Edukasi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Modul */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Modul Edukasi</DialogTitle>
            <DialogDescription>
              Buat modul edukasi berbasis pangan lokal baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul Modul</label>
              <Input placeholder="Masukkan judul modul" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MPASI">MPASI</SelectItem>
                  <SelectItem value="Pangan Lokal">Pangan Lokal</SelectItem>
                  <SelectItem value="Gizi Seimbang">Gizi Seimbang</SelectItem>
                  <SelectItem value="Pencegahan Stunting">
                    Pencegahan Stunting
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bahan (pisahkan dengan koma)</label>
              <Input placeholder="Contoh: Ikan Lele, Daun Kelor" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                toast.success("Modul berhasil ditambahkan!");
                setIsAddOpen(false);
              }}
              style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
            >
              Simpan
            </Button>
          </DialogFooter>
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
      className="text-left h-full rounded-[8px] border p-4 flex flex-col gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[--tw-ring-color:var(--color-success)] cursor-pointer min-w-0 overflow-hidden"
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
function EdukasiDetail({
  modul,
  onBukaModul,
}: {
  modul: EdukasiModul;
  onBukaModul: () => void;
}) {
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
          onClick={onBukaModul}
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
