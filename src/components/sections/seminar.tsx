"use client";

import { useMemo, useState, useRef } from "react";
import { SectionHeader } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { PitaCapaian } from "@/components/pita-capaian";
import { KpiCard } from "@/components/kpi-card";
import { seminarData as initialSeminarData, formatTanggal } from "@/lib/mock-data";
import type { Seminar } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Download,
  Plus,
  Video,
  Presentation,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

// ============================================================
// SeminarSection — KF-12 / MVP #13
// Modul Seminar Gizi Gratis untuk Ibu Balita
// ============================================================

type StatusFilter = "Semua" | Seminar["status"];

const statusLabel: Record<Seminar["status"], string> = {
  terjadwal: "Terjadwal",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
};

export function SeminarSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filter, setFilter] = useState<StatusFilter>("Semua");
  const [seminarData, setSeminarData] = useState<Seminar[]>(initialSeminarData);

  // Dialog States
  const [isBuatSeminarOpen, setIsBuatSeminarOpen] = useState(false);
  const [isDaftarPesertaOpen, setIsDaftarPesertaOpen] = useState(false);
  const [isInputPresensiOpen, setIsInputPresensiOpen] = useState(false);
  const [isKirimPengingatOpen, setIsKirimPengingatOpen] = useState(false);
  const [activeSeminar, setActiveSeminar] = useState<Seminar | null>(null);

  // Form State for Buat Seminar
  const [newSeminar, setNewSeminar] = useState({
    judul: "",
    pembicara: "",
    tanggal: "",
    jam: "",
    kuota: "",
  });

  const filtered = useMemo(() => {
    if (filter === "Semua") return seminarData;
    return seminarData.filter((s) => s.status === filter);
  }, [filter, seminarData]);

  const seminarTerjadwal = seminarData.filter((s) => s.status === "terjadwal");
  const totalPesertaTerdaftar = seminarTerjadwal.reduce(
    (acc, s) => acc + s.terdaftar,
    0
  );
  const seminarSelesai = seminarData.filter((s) => s.status === "selesai");
  const totalSertifikat = seminarSelesai.reduce(
    (acc, s) => acc + s.sertifikatDiterbitkan,
    0
  );

  const filterOptions: StatusFilter[] = [
    "Semua",
    "terjadwal",
    "berlangsung",
    "selesai",
  ];

  const handleBuatSeminar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeminar.judul || !newSeminar.tanggal || !newSeminar.kuota) {
      toast.error("Harap lengkapi semua bidang.");
      return;
    }
    const s: Seminar = {
      id: `S-NEW-${Date.now()}`,
      judul: newSeminar.judul,
      pembicara: newSeminar.pembicara,
      instansi: "Puskesmas Lokal",
      tanggal: newSeminar.tanggal,
      jam: newSeminar.jam || "09:00",
      lokasi: "Aula Kelurahan",
      modality: "tatap_muka",
      materi: ["Gizi Umum"],
      kuota: parseInt(newSeminar.kuota),
      terdaftar: 0,
      hadir: 0,
      status: "terjadwal",
      sertifikatDiterbitkan: 0,
    };
    setSeminarData([s, ...seminarData]);
    setIsBuatSeminarOpen(false);
    setNewSeminar({ judul: "", pembicara: "", tanggal: "", jam: "", kuota: "" });
    toast.success("Seminar baru berhasil dibuat!");
  };

  const handleUpdateSeminar = (updatedSeminar: Seminar) => {
    setSeminarData((prev) =>
      prev.map((s) => (s.id === updatedSeminar.id ? updatedSeminar : s))
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="EDUKASI & SEMINAR"
        title="Seminar Gizi Gratis untuk Ibu Balita"
        description="Pendaftaran, jadwal, presensi, dan sertifikat elektronik seminar edukasi gizi bersama Puskesmas/BGN."
        actions={
          isAdmin && (
            <Button
              onClick={() => setIsBuatSeminarOpen(true)}
              className="rounded-[8px]"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Seminar Baru
            </Button>
          )
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Seminar Terjadwal"
          value={seminarTerjadwal.length}
          unit="seminar"
          accent="info"
          icon={<Calendar className="w-4 h-4" />}
          hint="Menunggu pelaksanaan"
        />
        <KpiCard
          label="Total Peserta Terdaftar"
          value={totalPesertaTerdaftar}
          unit="peserta"
          accent="primary"
          icon={<Users className="w-4 h-4" />}
          hint="Akumulasi seminar terjadwal"
        />
        <KpiCard
          label="Sertifikat Diterbitkan"
          value={totalSertifikat}
          unit="sertifikat"
          accent="success"
          icon={<Award className="w-4 h-4" />}
          hint="Dari seminar selesai"
        />
      </div>

      {/* Filter chip */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Filter status seminar"
      >
        {filterOptions.map((f) => {
          const active = filter === f;
          const label = f === "Semua" ? "Semua" : statusLabel[f];
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-[4px] text-[12px] font-medium border transition-colors focus:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: active
                  ? "var(--color-primary)"
                  : "#FFFFFF",
                color: active
                  ? "#FFFFFF"
                  : "var(--color-text-muted)",
                borderColor: active
                  ? "var(--color-primary)"
                  : "rgba(7,30,73,0.12)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List seminar */}
      {filtered.length === 0 ? (
        <SeminarEmpty />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <SeminarCard
              key={s.id}
              seminar={s}
              onOpenDaftarPeserta={(s) => { setActiveSeminar(s); setIsDaftarPesertaOpen(true); }}
              onOpenInputPresensi={(s) => { setActiveSeminar(s); setIsInputPresensiOpen(true); }}
              onOpenKirimPengingat={(s) => { setActiveSeminar(s); setIsKirimPengingatOpen(true); }}
              onUpdateSeminar={handleUpdateSeminar}
            />
          ))}
        </div>
      )}

      {/* Dialog Buat Seminar */}
      <Dialog open={isBuatSeminarOpen} onOpenChange={setIsBuatSeminarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Seminar Baru</DialogTitle>
            <DialogDescription>
              Tambahkan seminar edukasi gizi baru ke dalam jadwal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBuatSeminar} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Seminar</Label>
              <Input
                value={newSeminar.judul}
                onChange={(e) => setNewSeminar({ ...newSeminar, judul: e.target.value })}
                placeholder="Contoh: MPASI Tepat untuk Balita 6-12 Bulan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Pembicara</Label>
              <Input
                value={newSeminar.pembicara}
                onChange={(e) => setNewSeminar({ ...newSeminar, pembicara: e.target.value })}
                placeholder="Contoh: dr. Gizi Sp.GK"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={newSeminar.tanggal}
                  onChange={(e) => setNewSeminar({ ...newSeminar, tanggal: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jam</Label>
                <Input
                  type="time"
                  value={newSeminar.jam}
                  onChange={(e) => setNewSeminar({ ...newSeminar, jam: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kuota Peserta</Label>
              <Input
                type="number"
                value={newSeminar.kuota}
                onChange={(e) => setNewSeminar({ ...newSeminar, kuota: e.target.value })}
                placeholder="50"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Simpan Seminar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Daftar Peserta */}
      {activeSeminar && (
        <DialogDaftarPeserta
          open={isDaftarPesertaOpen}
          onOpenChange={setIsDaftarPesertaOpen}
          seminar={activeSeminar}
        />
      )}

      {/* Dialog Input Presensi */}
      {activeSeminar && (
        <DialogInputPresensi
          open={isInputPresensiOpen}
          onOpenChange={setIsInputPresensiOpen}
          seminar={activeSeminar}
          onUpdateSeminar={handleUpdateSeminar}
        />
      )}

      {/* Dialog Kirim Pengingat */}
      {activeSeminar && (
        <DialogKirimPengingat
          open={isKirimPengingatOpen}
          onOpenChange={setIsKirimPengingatOpen}
          seminar={activeSeminar}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------
// SeminarCard
// ------------------------------------------------------------
function SeminarCard({
  seminar,
  onOpenDaftarPeserta,
  onOpenInputPresensi,
  onOpenKirimPengingat,
  onUpdateSeminar,
}: {
  seminar: Seminar;
  onOpenDaftarPeserta: (s: Seminar) => void;
  onOpenInputPresensi: (s: Seminar) => void;
  onOpenKirimPengingat: (s: Seminar) => void;
  onUpdateSeminar: (s: Seminar) => void;
}) {
  const kuotaPct = Math.round((seminar.terdaftar / seminar.kuota) * 100);
  // State pita: >=80 on-track, >=50 attention, else critical
  const pitaState: "on-track" | "attention" | "critical" =
    kuotaPct >= 80 ? "on-track" : kuotaPct >= 50 ? "attention" : "critical";

  const tanggal = new Date(seminar.tanggal);
  const hari = tanggal.toLocaleDateString("id-ID", { day: "2-digit" });
  const bulanTahun = tanggal
    .toLocaleDateString("id-ID", { month: "short", year: "numeric" })
    .replace(/\s/g, " ");

  const certificateRef = useRef<HTMLDivElement>(null);

  const handleUnduhSertifikat = async () => {
    if (certificateRef.current) {
      toast.info("Sedang menghasilkan sertifikat...");
      try {
        const canvas = await html2canvas(certificateRef.current);
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Sertifikat-${seminar.judul}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Sertifikat berhasil diunduh!");
      } catch (error) {
        toast.error("Gagal menghasilkan sertifikat.");
      }
    }
  };

  return (
    <div
      className="rounded-[8px] border p-4"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "rgba(7,30,73,0.08)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 lg:gap-6">
        {/* KIRI — info */}
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="flex items-start gap-3">
            {/* Tanggal besar */}
            <div
              className="flex-shrink-0 rounded-[8px] px-2.5 py-1.5 text-center min-w-[58px]"
              style={{ backgroundColor: "var(--color-info-tint)" }}
              aria-label={`Tanggal ${formatTanggal(seminar.tanggal)}`}
            >
              <div
                className="font-display leading-none"
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--color-primary)",
                }}
              >
                {hari}
              </div>
              <div
                className="font-data text-[10px] uppercase tracking-wide mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {bulanTahun}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Jam + modality badge */}
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span
                  className="font-data text-[11px] inline-flex items-center gap-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Clock className="w-3 h-3" aria-hidden />
                  {seminar.jam}
                </span>
                {seminar.modality === "tatap_muka" ? (
                  <StatusBadge tone="info" dot={false}>
                    <Presentation className="w-3 h-3" aria-hidden />
                    Tatap Muka
                  </StatusBadge>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] font-medium rounded-[4px] border"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "#FFFFFF",
                      borderColor: "var(--color-primary)",
                    }}
                  >
                    <Video className="w-3 h-3" aria-hidden />
                    Webinar
                  </span>
                )}
              </div>

              {/* Judul */}
              <h3
                className="font-display leading-tight"
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--color-primary)",
                }}
              >
                {seminar.judul}
              </h3>
            </div>
          </div>

          {/* Pembicara + instansi */}
          <div
            className="text-[12px] flex items-center gap-1.5 flex-wrap"
            style={{ color: "var(--color-text-muted)" }}
          >
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
              {seminar.pembicara}
            </span>
            <span aria-hidden>·</span>
            <span>{seminar.instansi}</span>
          </div>

          {/* Lokasi */}
          <div
            className="text-[12px] flex items-center gap-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            <span>{seminar.lokasi}</span>
          </div>

          {/* Materi chips */}
          <div className="flex flex-wrap gap-1 mt-1">
            {seminar.materi.map((m, i) => (
              <span
                key={i}
                className="text-[11px] px-1.5 py-0.5 rounded-[4px] border"
                style={{
                  backgroundColor: "var(--color-info-tint)",
                  color: "var(--color-primary)",
                  borderColor: "rgba(181,224,234,0.7)",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* KANAN — kuota & aksi */}
        <div
          className="flex flex-col gap-3 lg:border-l lg:pl-4"
          style={{ borderColor: "rgba(181,224,234,0.5)" }}
        >
          {/* Kuota pendaftar */}
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span
                className="text-[11px] uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Kuota Pendaftar
              </span>
              <span
                className="font-data text-[12px]"
                style={{ color: "var(--color-text)" }}
              >
                {seminar.terdaftar} / {seminar.kuota}
              </span>
            </div>
            <PitaCapaian
              value={kuotaPct}
              state={pitaState}
              segments={10}
              height={8}
            />
          </div>

          {/* State row */}
          {seminar.status === "selesai" && (
            <div className="flex items-center justify-between gap-2">
              <div
                className="text-[12px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Hadir:{" "}
                <span
                  className="font-data"
                  style={{ color: "var(--color-text)" }}
                >
                  {seminar.hadir}/{seminar.terdaftar}
                </span>
              </div>
              <StatusBadge tone="success">Selesai</StatusBadge>
            </div>
          )}

          {seminar.status === "berlangsung" && (
            <div className="flex items-center justify-between gap-2">
              <div
                className="text-[12px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Sedang berlangsung
              </div>
              <StatusBadge tone="warning">Berlangsung</StatusBadge>
            </div>
          )}

          {seminar.status === "terjadwal" && (
            <div className="flex items-center justify-between gap-2">
              <div
                className="text-[12px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Menunggu pelaksanaan
              </div>
              <StatusBadge tone="info">Terjadwal</StatusBadge>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {seminar.status === "selesai" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnduhSertifikat}
                className="rounded-[8px] border h-8"
                style={{
                  borderColor: "rgba(7,30,73,0.12)",
                  color: "var(--color-primary)",
                }}
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Unduh Sertifikat ({seminar.sertifikatDiterbitkan})
              </Button>
            )}

            {seminar.status === "terjadwal" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenDaftarPeserta(seminar)}
                  className="rounded-[8px] border h-8"
                  style={{
                    borderColor: "rgba(7,30,73,0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Users className="w-3.5 h-3.5 mr-2" />
                  Daftar Peserta
                </Button>
                <Button
                  size="sm"
                  onClick={() => onOpenInputPresensi(seminar)}
                  className="rounded-[8px] h-8"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#FFFFFF",
                  }}
                >
                  Input Presensi
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenKirimPengingat(seminar)}
                  className="rounded-[8px] border h-8"
                  style={{
                    borderColor: "rgba(7,30,73,0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-2" />
                  Kirim Pengingat
                </Button>
              </>
            )}

            {seminar.status === "berlangsung" && (
              <Button
                size="sm"
                onClick={() => onOpenInputPresensi(seminar)}
                className="rounded-[8px] h-8"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#FFFFFF",
                }}
              >
                Buka Presensi Live
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Certificate Template for html2canvas */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          ref={certificateRef}
          style={{
            width: "800px",
            height: "600px",
            backgroundColor: "#fff",
            border: "10px solid var(--color-primary)",
            padding: "40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ color: "var(--color-primary)", marginBottom: "10px" }}>SERTIFIKAT PENGHARGAAN</h1>
          <p style={{ fontSize: "18px", color: "#555" }}>Diberikan kepada:</p>
          <h2 style={{ fontSize: "28px", margin: "20px 0", color: "#333" }}>NAMA PESERTA</h2>
          <p style={{ fontSize: "18px", color: "#555" }}>Atas partisipasinya dalam seminar:</p>
          <h3 style={{ fontSize: "24px", margin: "20px 0", color: "var(--color-primary)" }}>{seminar.judul}</h3>
          <p style={{ fontSize: "16px", color: "#777" }}>Diselenggarakan pada {formatTanggal(seminar.tanggal)}</p>
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "150px", borderBottom: "1px solid #333", marginBottom: "10px" }}></div>
              <p>Panitia Penyelenggara</p>
            </div>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid red",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "red",
              fontWeight: "bold",
              transform: "rotate(-15deg)"
            }}>
              CAP RESMI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Dialog Components
// ------------------------------------------------------------
const MOCK_PARTICIPANTS = [
  { id: 1, ibu: "Siti Aminah", balita: "Budi", wa: "6281234567890", hadir: false },
  { id: 2, ibu: "Nurul Hidayah", balita: "Ayu", wa: "6289876543210", hadir: true },
  { id: 3, ibu: "Dewi Lestari", balita: "Cika", wa: "6281122334455", hadir: false },
  { id: 4, ibu: "Rina Marlina", balita: "Dodi", wa: "6285566778899", hadir: false },
  { id: 5, ibu: "Ayu Wandira", balita: "Eka", wa: "6283344556677", hadir: false },
];

function DialogDaftarPeserta({ open, onOpenChange, seminar }: { open: boolean; onOpenChange: (o: boolean) => void; seminar: Seminar }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Daftar Peserta: {seminar.judul}</DialogTitle>
          <DialogDescription>
            Terdapat {seminar.terdaftar} peserta yang terdaftar pada seminar ini.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Ibu</TableHead>
                <TableHead>Nama Balita</TableHead>
                <TableHead>No. WhatsApp</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PARTICIPANTS.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.ibu}</TableCell>
                  <TableCell>{p.balita}</TableCell>
                  <TableCell>{p.wa}</TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${p.wa}?text=Halo%20Ibu%20${p.ibu},%20jangan%20lupa%20hadir%20di%20seminar%20${seminar.judul}%20ya!`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-3.5 h-3.5 mr-2" />
                        Kirim WA Pengingat
                      </Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DialogInputPresensi({
  open,
  onOpenChange,
  seminar,
  onUpdateSeminar,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  seminar: Seminar;
  onUpdateSeminar: (s: Seminar) => void;
}) {
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);

  const handleToggle = (id: number) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, hadir: !p.hadir } : p)));
  };

  const handleSave = () => {
    const hadirCount = participants.filter((p) => p.hadir).length;
    onUpdateSeminar({ ...seminar, hadir: hadirCount });
    toast.success("Presensi berhasil disimpan!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Input Presensi: {seminar.judul}</DialogTitle>
          <DialogDescription>
            Tandai kehadiran peserta. Total hadir: {participants.filter((p) => p.hadir).length}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hadir</TableHead>
                <TableHead>Nama Ibu</TableHead>
                <TableHead>Nama Balita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={p.hadir}
                      onCheckedChange={() => handleToggle(p.id)}
                    />
                  </TableCell>
                  <TableCell>{p.ibu}</TableCell>
                  <TableCell>{p.balita}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Simpan Presensi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogKirimPengingat({ open, onOpenChange, seminar }: { open: boolean; onOpenChange: (o: boolean) => void; seminar: Seminar }) {
  const handleBroadcast = () => {
    toast.success(`Pengingat berhasil dikirim ke ${seminar.terdaftar} peserta!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kirim Pengingat (Broadcast)</DialogTitle>
          <DialogDescription>
            Anda akan mengirimkan pesan WhatsApp pengingat kepada seluruh peserta ({seminar.terdaftar} orang) untuk seminar "{seminar.judul}".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleBroadcast}>Kirim Sekarang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------
// Empty state
// ------------------------------------------------------------
function SeminarEmpty() {
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
        <Calendar
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
          Tidak ada seminar pada filter ini
        </div>
        <p
          className="text-[13px] mt-1 max-w-sm mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          Pilih tab lain atau buat seminar baru jika belum ada jadwal yang
          tercatat.
        </p>
      </div>
    </div>
  );
}
