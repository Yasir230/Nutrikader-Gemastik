"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { PitaCapaian } from "@/components/pita-capaian";
import { KpiCard } from "@/components/kpi-card";
import { seminarData, formatTanggal } from "@/lib/mock-data";
import type { Seminar } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const [filter, setFilter] = useState<StatusFilter>("Semua");

  const filtered = useMemo(() => {
    if (filter === "Semua") return seminarData;
    return seminarData.filter((s) => s.status === filter);
  }, [filter]);

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

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="EDUKASI & SEMINAR"
        title="Seminar Gizi Gratis untuk Ibu Balita"
        description="Pendaftaran, jadwal, presensi, dan sertifikat elektronik seminar edukasi gizi bersama Puskesmas/BGN."
        actions={
          <Button
            onClick={() =>
              toast.info(
                "[Demo] Fitur buat seminar tersedia untuk peran TPG/koordinator."
              )
            }
            className="rounded-[8px]"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
            }}
          >
            <Plus className="w-4 h-4" />
            Buat Seminar Baru
          </Button>
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
            <SeminarCard key={s.id} seminar={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// SeminarCard
// ------------------------------------------------------------
function SeminarCard({ seminar }: { seminar: Seminar }) {
  const kuotaPct = Math.round((seminar.terdaftar / seminar.kuota) * 100);
  // State pita: >=80 on-track, >=50 attention, else critical
  const pitaState: "on-track" | "attention" | "critical" =
    kuotaPct >= 80 ? "on-track" : kuotaPct >= 50 ? "attention" : "critical";

  const tanggal = new Date(seminar.tanggal);
  const hari = tanggal.toLocaleDateString("id-ID", { day: "2-digit" });
  const bulanTahun = tanggal
    .toLocaleDateString("id-ID", { month: "short", year: "numeric" })
    .replace(/\s/g, " ");

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
                onClick={() =>
                  toast.info(
                    `[Demo] Mengunduh ${seminar.sertifikatDiterbitkan} sertifikat seminar "${seminar.judul}".`
                  )
                }
                className="rounded-[8px] border h-8"
                style={{
                  borderColor: "rgba(7,30,73,0.12)",
                  color: "var(--color-primary)",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Sertifikat ({seminar.sertifikatDiterbitkan})
              </Button>
            )}

            {seminar.status === "terjadwal" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toast.info(
                      `[Demo] Membuka daftar peserta seminar "${seminar.judul}".`
                    )
                  }
                  className="rounded-[8px] border h-8"
                  style={{
                    borderColor: "rgba(7,30,73,0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Users className="w-3.5 h-3.5" />
                  Daftar Peserta
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    toast.info(
                      `[Demo] Membuka input presensi seminar "${seminar.judul}".`
                    )
                  }
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
                  onClick={() =>
                    toast.info(
                      `[Demo] Pengingat dikirim ke ${seminar.terdaftar} peserta seminar "${seminar.judul}".`
                    )
                  }
                  className="rounded-[8px] border h-8"
                  style={{
                    borderColor: "rgba(7,30,73,0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  Kirim Pengingat
                </Button>
              </>
            )}

            {seminar.status === "berlangsung" && (
              <Button
                size="sm"
                onClick={() =>
                  toast.info(
                    `[Demo] Membuka presensi live seminar "${seminar.judul}".`
                  )
                }
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
    </div>
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
