// ============================================================
// NutriKader — Domain Types
// Berdasarkan proposal Gemastik XVIII (F.1 Aktor, F.2 Kebutuhan Fungsional)
// ============================================================

export type RiskLevel = "rendah" | "sedang" | "tinggi";
export type Gender = "L" | "P";
export type PosyanduStatus = "aktif" | "perlu_perhatian" | "nonaktif";
export type MBGReceiver = "balita" | "ibu_hamil" | "ibu_menyusui";
export type SyncStatus = "tersinkron" | "tertunda" | "gagal";

export interface Wilayah {
  id: string;
  nama: string;          // nama wilayah/kelurahan
  puskesmas: string;
  jumlahPosyandu: number;
  jumlahBalita: number;
  prevalensiStunting: number;   // %
  cakupanMBG: number;           // % sasaran terverifikasi
  trenBulanan: number[];        // 6 bulan terakhir, % risiko
}

export interface Posyandu {
  id: string;
  nama: string;
  wilayahId: string;
  kelurahan: string;
  kaderAktif: number;
  balitaAktif: number;
  balitaBerisiko: number;
  jadwalBerikutnya: string;     // ISO date
  status: PosyanduStatus;
  capaianPencatatan: number;    // % kelengkapan data bulan ini
}

export interface Kader {
  id: string;
  nama: string;
  posyanduId: string;
  posyanduNama: string;
  telepon: string;
  pencatatanBulanIni: number;
}

export interface Pengukuran {
  id: string;
  tanggal: string;        // ISO
  usiaBulan: number;
  beratBadan: number;     // kg
  tinggiBadan: number;    // cm
  lingkarKepala: number;  // cm
  zScoreBBU: number;      // z-score berat badan menurut usia
  zScoreTBU: number;      // z-score tinggi badan menurut usia
  catatan?: string;
  sakitBulanItu?: boolean;
}

export interface Imunisasi {
  id: string;
  nama: string;           // BCG, DPT-HB1, Polio, Campak, dll
  tanggal: string;
  status: "lengkap" | "belum" | "tertunda";
}

export interface PenerimaanMBG {
  id: string;
  tanggal: string;
  penerima: MBGReceiver;
  menu: string;
  porsi: number;
  status: "tersalurkan" | "terjadwal";
}

export interface Balita {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: Gender;
  tanggalLahir: string;     // ISO
  posyanduId: string;
  posyanduNama: string;
  kelurahan: string;
  namaIbu: string;
  beratLahir: number;       // kg
  tinggiLahir: number;      // cm
  usiaBulan: number;
  risiko: RiskLevel;
  alasanRisiko: string[];
  pengukuran: Pengukuran[];
  imunisasi: Imunisasi[];
  penerimaanMBG: PenerimaanMBG[];
  penerimaMBG: boolean;
  statusPosyandu: "aktif" | "lulus";
  sinkronisasi: SyncStatus;
  catatanKader?: string;
  fotoSeed: string;          // untuk avatar placeholder
}

export interface EdukasiModul {
  id: string;
  judul: string;
  kategori: "MPASI" | "Pangan Lokal" | "Gizi Seimbang" | "Pencegahan Stunting";
  wilayah: string;           // "Semua" atau nama wilayah spesifik
  ringkasan: string;
  bahanUtama: string[];
  durasiBaca: number;        // menit
  penulis: string;
  tanggalTerbit: string;
}

export interface Seminar {
  id: string;
  judul: string;
  pembicara: string;
  instansi: string;
  tanggal: string;
  jam: string;
  modality: "tatap_muka" | "webinar";
  lokasi: string;
  kuota: number;
  terdaftar: number;
  hadir: number;
  status: "terjadwal" | "selesai" | "berlangsung";
  materi: string[];
  sertifikatDiterbitkan: number;
}

export interface JadwalPosyandu {
  id: string;
  posyanduId: string;
  posyanduNama: string;
  kelurahan: string;
  tanggal: string;
  jam: string;
  jenisKegiatan: "Pencatatan Rutin" | "Penimbangan" | "Imunisasi" | "Penyuluhan";
  estimasiBalita: number;
  kaderBertugas: string[];
  status: "terjadwal" | "hari_ini" | "selesai";
}

export interface LaporanBulanan {
  id: string;
  periode: string;          // "2026-01"
  posyanduNama: string;
  wilayah: string;
  totalBalita: number;
  balitaDiukur: number;
  balitaBerisikoTinggi: number;
  balitaBerisikoSedang: number;
  balitaRendah: number;
  cakupanMBG: number;
  rujukanDilakukan: number;
  statusPengumpulan: "lengkap" | "draft" | "belum";
  diunduhPada?: string;
}

export interface Notifikasi {
  id: string;
  tipe: "pengingat" | "risiko" | "mbg" | "sistem";
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  isRead: boolean;
  level: "info" | "success" | "warning" | "critical";
}

