import type {
  Balita, Kader, Posyandu, Wilayah, EdukasiModul, Seminar,
  JadwalPosyandu, LaporanBulanan, Notifikasi,
} from "./types";

// ============================================================
// NUTRIKADER — MOCK DATA
// Data ilustratif untuk demo dashboard. NIK/menu/nama bersifat
// contoh dan tidak merepresentasikan data riil individu.
// ============================================================

export const wilayahData: Wilayah[] = [
  { id: "W01", nama: "Cipinang Besar Selatan", puskesmas: "Puskesmas Jatinegara", jumlahPosyandu: 8, jumlahBalita: 642, prevalensiStunting: 22.4, cakupanMBG: 78, trenBulanan: [26, 25, 24, 23, 23, 22] },
  { id: "W02", nama: "Kampung Melayu", puskesmas: "Puskesmas Jatinegara", jumlahPosyandu: 6, jumlahBalita: 488, prevalensiStunting: 18.6, cakupanMBG: 82, trenBulanan: [22, 21, 20, 19, 19, 18] },
  { id: "W03", nama: "Cipinang", puskesmas: "Puskesmas Jatinegara", jumlahPosyandu: 7, jumlahBalita: 571, prevalensiStunting: 24.1, cakupanMBG: 71, trenBulanan: [27, 27, 26, 25, 25, 24] },
  { id: "W04", nama: "Bidara Cina", puskesmas: "Puskesmas Jatinegara", jumlahPosyandu: 5, jumlahBalita: 396, prevalensiStunting: 16.8, cakupanMBG: 88, trenBulanan: [20, 19, 18, 18, 17, 16] },
  { id: "W05", nama: "Balimeste", puskesmas: "Puskesmas Jatinegara", jumlahPosyandu: 4, jumlahBalita: 312, prevalensiStunting: 14.2, cakupanMBG: 91, trenBulanan: [17, 16, 16, 15, 14, 14] },
  { id: "W06", nama: "Cipinang Cempedak", puskesmas: "Puskesmas Jatinegara", jumlahPosyandu: 5, jumlahBalita: 428, prevalensiStunting: 27.3, cakupanMBG: 64, trenBulanan: [30, 29, 29, 28, 28, 27] },
];

export const posyanduData: Posyandu[] = [
  { id: "P01", nama: "Posyandu Melati I", wilayahId: "W01", kelurahan: "Cipinang Besar Selatan", kaderAktif: 6, balitaAktif: 84, balitaBerisiko: 11, jadwalBerikutnya: "2026-02-12", status: "aktif", capaianPencatatan: 92 },
  { id: "P02", nama: "Posyandu Melati II", wilayahId: "W01", kelurahan: "Cipinang Besar Selatan", kaderAktif: 5, balitaAktif: 76, balitaBerisiko: 9, jadwalBerikutnya: "2026-02-12", status: "aktif", capaianPencatatan: 88 },
  { id: "P03", nama: "Posyandu Anggrek I", wilayahId: "W02", kelurahan: "Kampung Melayu", kaderAktif: 7, balitaAktif: 102, balitaBerisiko: 8, jadwalBerikutnya: "2026-02-15", status: "aktif", capaianPencatatan: 95 },
  { id: "P04", nama: "Posyandu Mawar I", wilayahId: "W03", kelurahan: "Cipinang", kaderAktif: 4, balitaAktif: 68, balitaBerisiko: 14, jadwalBerikutnya: "2026-02-10", status: "perlu_perhatian", capaianPencatatan: 71 },
  { id: "P05", nama: "Posyandu Kenanga", wilayahId: "W04", kelurahan: "Bidara Cina", kaderAktif: 6, balitaAktif: 79, balitaBerisiko: 5, jadwalBerikutnya: "2026-02-18", status: "aktif", capaianPencatatan: 96 },
  { id: "P06", nama: "Posyandu Flamboyan", wilayahId: "W06", kelurahan: "Cipinang Cempedak", kaderAktif: 3, balitaAktif: 54, balitaBerisiko: 13, jadwalBerikutnya: "2026-02-11", status: "perlu_perhatian", capaianPencatatan: 64 },
  { id: "P07", nama: "Posyandu Dahlia", wilayahId: "W05", kelurahan: "Balimeste", kaderAktif: 5, balitaAktif: 71, balitaBerisiko: 3, jadwalBerikutnya: "2026-02-14", status: "aktif", capaianPencatatan: 98 },
  { id: "P08", nama: "Posyandu Teratai", wilayahId: "W01", kelurahan: "Cipinang Besar Selatan", kaderAktif: 4, balitaAktif: 62, balitaBerisiko: 7, jadwalBerikutnya: "2026-02-19", status: "aktif", capaianPencatatan: 84 },
];

export const kaderData: Kader[] = [
  { id: "K01", nama: "Siti Aminah", posyanduId: "P01", posyanduNama: "Posyandu Melati I", telepon: "0812-1140-2231", pencatatanBulanIni: 78 },
  { id: "K02", nama: "Rukmini", posyanduId: "P01", posyanduNama: "Posyandu Melati I", telepon: "0813-8821-0098", pencatatanBulanIni: 64 },
  { id: "K03", nama: "Endang Sulastri", posyanduId: "P03", posyanduNama: "Posyandu Anggrek I", telepon: "0856-7710-2233", pencatatanBulanIni: 92 },
  { id: "K04", nama: "Wartini", posyanduId: "P04", posyanduNama: "Posyandu Mawar I", telepon: "0821-3398-1122", pencatatanBulanIni: 41 },
  { id: "K05", nama: "Sumarni", posyanduId: "P06", posyanduNama: "Posyandu Flamboyan", telepon: "0857-2200-1199", pencatatanBulanIni: 33 },
  { id: "K06", nama: "Tutik Rahayu", posyanduId: "P07", posyanduNama: "Posyandu Dahlia", telepon: "0811-5566-7788", pencatatanBulanIni: 88 },
];

// Helper untuk generate pengukuran konsisten
function genPengukuran(usiaSekarang: number, beratLahir: number, trend: "naik" | "stagnan" | "turun"): {
  pengukuran: Balita["pengukuran"];
} {
  const pengukuran: Balita["pengukuran"] = [];
  // ambil 8 titik terakhir (per ~6-8 minggu)
  const titik = Math.min(8, Math.floor(usiaSekarang / 1.5) + 1);
  let bb = beratLahir;
  let tb = 49;
  for (let i = titik - 1; i >= 0; i--) {
    const usia = Math.max(0, usiaSekarang - i * 2);
    if (usia === 0) { bb = beratLahir; tb = 49; }
    else {
      const delta = trend === "naik" ? 0.42 + Math.random() * 0.18 :
                    trend === "stagnan" ? 0.05 + Math.random() * 0.12 :
                    -0.08 + Math.random() * 0.18;
      bb = Math.round((bb + delta) * 100) / 100;
      tb = tb + 1.6 + Math.random() * 0.4;
    }
    const zBBU = trend === "naik" ? -0.4 + Math.random() * 0.6 :
                trend === "stagnan" ? -1.6 + Math.random() * 0.5 :
                -2.4 + Math.random() * 0.5;
    const zTBU = trend === "naik" ? -0.3 + Math.random() * 0.6 :
                 trend === "stagnan" ? -1.4 + Math.random() * 0.4 :
                 -2.6 + Math.random() * 0.4;
    const tgl = new Date();
    tgl.setMonth(tgl.getMonth() - i);
    pengukuran.push({
      id: `U-${i}`,
      tanggal: tgl.toISOString().slice(0, 10),
      usiaBulan: usia,
      beratBadan: Math.round(bb * 10) / 10,
      tinggiBadan: Math.round(tb * 10) / 10,
      lingkarKepala: Math.round((39 + usia * 0.18) * 10) / 10,
      zScoreBBU: Math.round(zBBU * 100) / 100,
      zScoreTBU: Math.round(zTBU * 100) / 100,
      sakitBulanItu: trend === "turun" && i < 2 ? true : Math.random() > 0.85,
    });
  }
  return { pengukuran: pengukuran.reverse() };
}

function genImunisasi(usiaBulan: number): Balita["imunisasi"] {
  const all = [
    { nama: "Hepatitis B 0", usia: 0 },
    { nama: "BCG", usia: 1 },
    { nama: "Polio 1", usia: 2 },
    { nama: "DPT-HB-Hib 1", usia: 2 },
    { nama: "Polio 2", usia: 3 },
    { nama: "DPT-HB-Hib 2", usia: 3 },
    { nama: "Polio 3", usia: 4 },
    { nama: "DPT-HB-Hib 3", usia: 4 },
    { nama: "Polio 4", usia: 6 },
    { nama: "Campak", usia: 9 },
    { nama: "Campak Lanjutan", usia: 18 },
  ];
  return all
    .filter(v => v.usia <= usiaBulan)
    .map((v, i) => {
      const tgl = new Date();
      tgl.setMonth(tgl.getMonth() - (usiaBulan - v.usia));
      return {
        id: `IM-${i}`,
        nama: v.nama,
        tanggal: tgl.toISOString().slice(0, 10),
        status: i < 8 ? "lengkap" : Math.random() > 0.3 ? "lengkap" : "tertunda",
      };
    });
}

function genMBG(penerima: boolean): Balita["penerimaanMBG"] {
  if (!penerima) return [];
  const out: Balita["penerimaanMBG"] = [];
  const menus = [
    "Nasi tim ikan lele + sayur bayam + pisang",
    "Bubur kacang hijau + telur + buah",
    "Nasi ayam suwir + capcay + jeruk",
    "Tim ikan patin + labu kuning + pepaya",
    "Nasi tahu tempe + kangkung + melon",
  ];
  for (let i = 0; i < 6; i++) {
    const tgl = new Date();
    tgl.setDate(tgl.getDate() - i * 7);
    out.push({
      id: `MBG-${i}`,
      tanggal: tgl.toISOString().slice(0, 10),
      penerima: "balita",
      menu: menus[i % menus.length],
      porsi: 1,
      status: i === 0 ? "terjadwal" : "tersalurkan",
    });
  }
  return out;
}

export const balitaData: Balita[] = [
  {
    id: "B001", nik: "3174011201230001", nama: "Aisyah Putri Ramadhani", jenisKelamin: "P",
    tanggalLahir: "2023-01-12", posyanduId: "P01", posyanduNama: "Posyandu Melati I",
    kelurahan: "Cipinang Besar Selatan", namaIbu: "Dewi Lestari", beratLahir: 3.1, tinggiLahir: 49,
    usiaBulan: 37, risiko: "rendah", alasanRisiko: ["Tren berat badan naik konsisten"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "aisyah", catatanKader: "Perkembangan baik, ibu aktif mengikuti edukasi.",
    ...genPengukuran(37, 3.1, "naik"),
    imunisasi: genImunisasi(37),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B002", nik: "3174010508230002", nama: "Muhammad Rakha Saputra", jenisKelamin: "L",
    tanggalLahir: "2023-08-05", posyanduId: "P01", posyanduNama: "Posyandu Melati I",
    kelurahan: "Cipinang Besar Selatan", namaIbu: "Sri Wahyuni", beratLahir: 2.6, tinggiLahir: 47,
    usiaBulan: 30, risiko: "sedang", alasanRisiko: ["Berat badan stagnan 2 bulan terakhir", "Z-score BB/U menurun ke -1.8"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "rakha", catatanKader: "Perlu edukasi MPASI dan konseling gizi.",
    ...genPengukuran(30, 2.6, "stagnan"),
    imunisasi: genImunisasi(30),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B003", nik: "3174011809220003", nama: "Khalisa Nayla Azzahra", jenisKelamin: "P",
    tanggalLahir: "2022-09-18", posyanduId: "P04", posyanduNama: "Posyandu Mawar I",
    kelurahan: "Cipinang", namaIbu: "Nuraini", beratLahir: 2.4, tinggiLahir: 46,
    usiaBulan: 40, risiko: "tinggi", alasanRisiko: ["Berat badan turun 2 bulan berturut", "Riwayat BBLR (2.4 kg)", "Frekuensi sakit tinggi", "Z-score BB/U < -2"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tertunda",
    fotoSeed: "khalisa", catatanKader: "Sudah dirujuk ke puskesmas untuk konseling TPG.",
    ...genPengukuran(40, 2.4, "turun"),
    imunisasi: genImunisasi(40),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B004", nik: "3174012207220004", nama: "Arsyad Bilal Pratama", jenisKelamin: "L",
    tanggalLahir: "2022-07-22", posyanduId: "P03", posyanduNama: "Posyandu Anggrek I",
    kelurahan: "Kampung Melayu", namaIbu: "Fatimah Zahra", beratLahir: 3.3, tinggiLahir: 50,
    usiaBulan: 42, risiko: "rendah", alasanRisiko: ["Tren pertumbuhan optimal"],
    penerimaMBG: false, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "arsyad",
    ...genPengukuran(42, 3.3, "naik"),
    imunisasi: genImunisasi(42),
    penerimaanMBG: genMBG(false),
  },
  {
    id: "B005", nik: "3174013011230005", nama: "Zahra Aulia Salsabila", jenisKelamin: "P",
    tanggalLahir: "2023-11-30", posyanduId: "P04", posyanduNama: "Posyandu Mawar I",
    kelurahan: "Cipinang", namaIbu: "Mardiah", beratLahir: 2.8, tinggiLahir: 48,
    usiaBulan: 26, risiko: "sedang", alasanRisiko: ["Z-score BB/U mendekati -2", "Kunjungan posyandu tidak rutin"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "zahra",
    ...genPengukuran(26, 2.8, "stagnan"),
    imunisasi: genImunisasi(26),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B006", nik: "3174011404240006", nama: "Kenzo Arvian Mahesa", jenisKelamin: "L",
    tanggalLahir: "2024-04-14", posyanduId: "P06", posyanduNama: "Posyandu Flamboyan",
    kelurahan: "Cipinang Cempedak", namaIbu: "Yuliani", beratLahir: 2.2, tinggiLahir: 45,
    usiaBulan: 21, risiko: "tinggi", alasanRisiko: ["BBLR (2.2 kg)", "Berat badan stagnan 3 bulan", "Z-score TB/U < -2.5"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "gagal",
    fotoSeed: "kenzo", catatanKader: "Prioritas rujukan + pendampingan MBG harian.",
    ...genPengukuran(21, 2.2, "turun"),
    imunisasi: genImunisasi(21),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B007", nik: "3174010708230007", nama: "Naura Azzahra", jenisKelamin: "P",
    tanggalLahir: "2023-08-07", posyanduId: "P05", posyanduNama: "Posyandu Kenanga",
    kelurahan: "Bidara Cina", namaIbu: "Rahmawati", beratLahir: 3.0, tinggiLahir: 49,
    usiaBulan: 30, risiko: "rendah", alasanRisiko: ["Tren berat badan naik konsisten", "Imunisasi lengkap"],
    penerimaMBG: false, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "naura",
    ...genPengukuran(30, 3.0, "naik"),
    imunisasi: genImunisasi(30),
    penerimaanMBG: genMBG(false),
  },
  {
    id: "B008", nik: "3174012512220008", nama: "Rafa Pradipta Wibowo", jenisKelamin: "L",
    tanggalLahir: "2022-12-25", posyanduId: "P07", posyanduNama: "Posyandu Dahlia",
    kelurahan: "Balimeste", namaIbu: "Indah Permata", beratLahir: 3.4, tinggiLahir: 50,
    usiaBulan: 38, risiko: "rendah", alasanRisiko: ["Tren optimal"],
    penerimaMBG: false, statusPosyandu: "lulus", sinkronisasi: "tersinkron",
    fotoSeed: "rafa",
    ...genPengukuran(38, 3.4, "naik"),
    imunisasi: genImunisasi(38),
    penerimaanMBG: genMBG(false),
  },
  {
    id: "B009", nik: "3174011906230009", nama: "Aira Shabrina", jenisKelamin: "P",
    tanggalLahir: "2023-06-19", posyanduId: "P06", posyanduNama: "Posyandu Flamboyan",
    kelurahan: "Cipinang Cempedak", namaIbu: "Susilowati", beratLahir: 2.5, tinggiLahir: 47,
    usiaBulan: 32, risiko: "tinggi", alasanRisiko: ["BBLR (2.5 kg)", "Berat badan turun", "Frekuensi sakit tinggi"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tertunda",
    fotoSeed: "aira",
    ...genPengukuran(32, 2.5, "turun"),
    imunisasi: genImunisasi(32),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B010", nik: "3174010301240010", nama: "Bilqis Khairunnisa", jenisKelamin: "P",
    tanggalLahir: "2024-01-03", posyanduId: "P01", posyanduNama: "Posyandu Melati I",
    kelurahan: "Cipinang Besar Selatan", namaIbu: "Hartati", beratLahir: 3.2, tinggiLahir: 50,
    usiaBulan: 25, risiko: "rendah", alasanRisiko: ["Tren optimal"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "bilqis",
    ...genPengukuran(25, 3.2, "naik"),
    imunisasi: genImunisasi(25),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B011", nik: "3174012809230011", nama: "Damar Satria Buana", jenisKelamin: "L",
    tanggalLahir: "2023-09-28", posyanduId: "P03", posyanduNama: "Posyandu Anggrek I",
    kelurahan: "Kampung Melayu", namaIbu: "Wulandari", beratLahir: 3.1, tinggiLahir: 49,
    usiaBulan: 28, risiko: "sedang", alasanRisiko: ["Z-score BB/U -1.6", "Stagnan 1 bulan"],
    penerimaMBG: true, statusPosyandu: "aktif", sinkronisasi: "tersinkron",
    fotoSeed: "damar",
    ...genPengukuran(28, 3.1, "stagnan"),
    imunisasi: genImunisasi(28),
    penerimaanMBG: genMBG(true),
  },
  {
    id: "B012", nik: "3174011502220012", nama: "Cinta Lestari Anggraini", jenisKelamin: "P",
    tanggalLahir: "2022-02-15", posyanduId: "P08", posyanduNama: "Posyandu Teratai",
    kelurahan: "Cipinang Besar Selatan", namaIbu: "Mariyam", beratLahir: 2.9, tinggiLahir: 48,
    usiaBulan: 48, risiko: "rendah", alasanRisiko: ["Tren optimal"],
    penerimaMBG: false, statusPosyandu: "lulus", sinkronisasi: "tersinkron",
    fotoSeed: "cinta",
    ...genPengukuran(48, 2.9, "naik"),
    imunisasi: genImunisasi(48),
    penerimaanMBG: genMBG(false),
  },
];

export const edukasiData: EdukasiModul[] = [
  { id: "E01", judul: "MPASI Berbasis Pangan Lokal: Tempe-Jagung untuk Usia 6-9 Bulan", kategori: "MPASI", wilayah: "Semua", ringkasan: "Panduan praktis memperkenalkan makanan pendamping ASI menggunakan tempe dan jagung yang mudah didapat di pasar lokal.", bahanUtama: ["Tempe", "Jagung manis", "Bayam", "Pisang"], durasiBaca: 6, penulis: "TPG Puskesmas Jatinegara", tanggalTerbit: "2026-01-08" },
  { id: "E02", judul: "Menu Hemat Tinggi Protein untuk Keluarga Balita Usia 1-3 Tahun", kategori: "Gizi Seimbang", wilayah: "Cipinang Besar Selatan", ringkasan: "Kombinasi lauk nabati-hewani dengan biaya terjangkau untuk memenuhi kebutuhan protein balita usia 1-3 tahun.", bahanUtama: ["Ikan lele", "Tahu", "Telur", "Kangkung"], durasiBaca: 8, penulis: "Tim Gizi BGN", tanggalTerbit: "2026-01-12" },
  { id: "E03", judul: "Pencegahan Stunting: Kenali Tanda Pertumbuhan Tidak Optimal", kategori: "Pencegahan Stunting", wilayah: "Semua", ringkasan: "Edukasi tanda dini balita berisiko stunting dan langkah yang dapat dilakukan ibu di rumah.", bahanUtama: ["—"], durasiBaca: 5, penulis: "Dinas Kesehatan", tanggalTerbit: "2026-01-15" },
  { id: "E04", judul: "Pemanfaatan Labu Kuning dan Ubi Jalar sebagai Sumber Vitamin A", kategori: "Pangan Lokal", wilayah: "Cipinang Cempedak", ringkasan: "Resep olahan labu kuning dan ubi jalar lokal untuk meningkatkan asupan vitamin A balita.", bahanUtama: ["Labu kuning", "Ubi jalar", "Santan", "Pandan"], durasiBaca: 7, penulis: "Kader Posyandu Flamboyan", tanggalTerbit: "2026-01-20" },
  { id: "E05", judul: "Pola Makan Sehat Ibu Menyusui Penerima Program MBG", kategori: "Gizi Seimbang", wilayah: "Semua", ringkasan: "Panduan gizi untuk ibu menyusui agar kualitas ASI optimal dan dampak MBG maksimal.", bahanUtama: ["Ikan", "Sayur hijau", "Kacang-kacangan"], durasiBaca: 9, penulis: "Tim Gizi BGN", tanggalTerbit: "2026-01-22" },
  { id: "E06", judul: "Camilan Sehat dari Pisang dan Kacang Hijau untuk Balita", kategori: "MPASI", wilayah: "Kampung Melayu", ringkasan: "Ide camilan sehat dan murah untuk balita di sela waktu makan utama.", bahanUtama: ["Pisang", "Kacang hijau", "Madu"], durasiBaca: 4, penulis: "Kader Posyandu Anggrek I", tanggalTerbit: "2026-01-25" },
];

export const seminarData: Seminar[] = [
  { id: "S01", judul: "Seminar Gizi Balita: Pentingnya 1000 Hari Pertama Kehidupan", pembicara: "dr. Rina Marlina, M.Gizi", instansi: "Puskesmas Jatinegara", tanggal: "2026-02-08", jam: "09:00 - 11:30", modality: "tatap_muka", lokasi: "Aula Kelurahan Cipinang Besar Selatan", kuota: 80, terdaftar: 76, hadir: 0, status: "terjadwal", materi: ["Modul 1000 HPK", "Panduan MPASI", "Pakan Lokal"], sertifikatDiterbitkan: 0 },
  { id: "S02", judul: "Webinar: Memaksimalkan Program MBG untuk Pencegahan Stunting", pembicara: "Prof. dr. Budi Santoso, PhD", instansi: "Badan Gizi Nasional", tanggal: "2026-02-14", jam: "13:00 - 15:00", modality: "webinar", lokasi: "Zoom Webinar", kuota: 200, terdaftar: 184, hadir: 0, status: "terjadwal", materi: ["Panduan MBG", "Evaluasi Dampak"], sertifikatDiterbitkan: 0 },
  { id: "S03", judul: "Penyuluhan: Hidup Sehat dengan Pangan Lokal", pembicara: "Siti Aminah, A.Md.Kes", instansi: "Posyandu Melati I", tanggal: "2026-01-25", jam: "10:00 - 12:00", modality: "tatap_muka", lokasi: "Posyandu Melati I", kuota: 50, terdaftar: 48, hadir: 44, status: "selesai", materi: ["Demo masak", "Pangan lokal"], sertifikatDiterbitkan: 44 },
  { id: "S04", judul: "Kelas Ibu Balita: Membaca KMS dan Tren Pertumbuhan", pembicara: "Endang Sulastri", instansi: "Posyandu Anggrek I", tanggal: "2026-01-18", jam: "09:30 - 11:00", modality: "tatap_muka", lokasi: "Posyandu Anggrek I", kuota: 40, terdaftar: 40, hadir: 38, status: "selesai", materi: ["Cara baca KMS", "Interpretasi grafik"], sertifikatDiterbitkan: 38 },
];

export const jadwalData: JadwalPosyandu[] = [
  { id: "J01", posyanduId: "P06", posyanduNama: "Posyandu Flamboyan", kelurahan: "Cipinang Cempedak", tanggal: "2026-02-04", jam: "08:00 - 11:00", jenisKegiatan: "Pencatatan Rutin", estimasiBalita: 54, kaderBertugas: ["Sumarni", "Tutik"], status: "hari_ini" },
  { id: "J02", posyanduId: "P04", posyanduNama: "Posyandu Mawar I", kelurahan: "Cipinang", tanggal: "2026-02-04", jam: "08:30 - 11:30", jenisKegiatan: "Penimbangan", estimasiBalita: 68, kaderBertugas: ["Wartini"], status: "hari_ini" },
  { id: "J03", posyanduId: "P01", posyanduNama: "Posyandu Melati I", kelurahan: "Cipinang Besar Selatan", tanggal: "2026-02-12", jam: "08:00 - 11:00", jenisKegiatan: "Pencatatan Rutin", estimasiBalita: 84, kaderBertugas: ["Siti Aminah", "Rukmini"], status: "terjadwal" },
  { id: "J04", posyanduId: "P02", posyanduNama: "Posyandu Melati II", kelurahan: "Cipinang Besar Selatan", tanggal: "2026-02-12", jam: "08:00 - 11:00", jenisKegiatan: "Pencatatan Rutin", estimasiBalita: 76, kaderBertugas: ["Sumirah"], status: "terjadwal" },
  { id: "J05", posyanduId: "P03", posyanduNama: "Posyandu Anggrek I", kelurahan: "Kampung Melayu", tanggal: "2026-02-15", jam: "08:30 - 11:30", jenisKegiatan: "Imunisasi", estimasiBalita: 102, kaderBertugas: ["Endang Sulastri"], status: "terjadwal" },
  { id: "J06", posyanduId: "P07", posyanduNama: "Posyandu Dahlia", kelurahan: "Balimeste", tanggal: "2026-02-14", jam: "09:00 - 12:00", jenisKegiatan: "Penyuluhan", estimasiBalita: 71, kaderBertugas: ["Tutik Rahayu"], status: "terjadwal" },
  { id: "J07", posyanduId: "P05", posyanduNama: "Posyandu Kenanga", kelurahan: "Bidara Cina", tanggal: "2026-02-18", jam: "08:00 - 11:00", jenisKegiatan: "Pencatatan Rutin", estimasiBalita: 79, kaderBertugas: ["Wartini", "Sumarni"], status: "terjadwal" },
  { id: "J08", posyanduId: "P08", posyanduNama: "Posyandu Teratai", kelurahan: "Cipinang Besar Selatan", tanggal: "2026-02-19", jam: "08:30 - 11:30", jenisKegiatan: "Pencatatan Rutin", estimasiBalita: 62, kaderBertugas: ["Rukmini"], status: "terjadwal" },
];

export const laporanData: LaporanBulanan[] = [
  { id: "L01", periode: "2026-01", posyanduNama: "Posyandu Melati I", wilayah: "Cipinang Besar Selatan", totalBalita: 84, balitaDiukur: 78, balitaBerisikoTinggi: 2, balitaBerisikoSedang: 9, balitaRendah: 67, cakupanMBG: 88, rujukanDilakukan: 2, statusPengumpulan: "lengkap", diunduhPada: "2026-02-01" },
  { id: "L02", periode: "2026-01", posyanduNama: "Posyandu Melati II", wilayah: "Cipinang Besar Selatan", totalBalita: 76, balitaDiukur: 73, balitaBerisikoTinggi: 1, balitaBerisikoSedang: 8, balitaRendah: 64, cakupanMBG: 84, rujukanDilakukan: 1, statusPengumpulan: "lengkap", diunduhPada: "2026-02-01" },
  { id: "L03", periode: "2026-01", posyanduNama: "Posyandu Anggrek I", wilayah: "Kampung Melayu", totalBalita: 102, balitaDiukur: 98, balitaBerisikoTinggi: 1, balitaBerisikoSedang: 7, balitaRendah: 90, cakupanMBG: 92, rujukanDilakukan: 1, statusPengumpulan: "lengkap", diunduhPada: "2026-02-01" },
  { id: "L04", periode: "2026-01", posyanduNama: "Posyandu Mawar I", wilayah: "Cipinang", totalBalita: 68, balitaDiukur: 48, balitaBerisikoTinggi: 4, balitaBerisikoSedang: 10, balitaRendah: 34, cakupanMBG: 64, rujukanDilakukan: 4, statusPengumpulan: "draft" },
  { id: "L05", periode: "2026-01", posyanduNama: "Posyandu Kenanga", wilayah: "Bidara Cina", totalBalita: 79, balitaDiukur: 77, balitaBerisikoTinggi: 0, balitaBerisikoSedang: 5, balitaRendah: 72, cakupanMBG: 94, rujukanDilakukan: 0, statusPengumpulan: "lengkap", diunduhPada: "2026-02-01" },
  { id: "L06", periode: "2026-01", posyanduNama: "Posyandu Flamboyan", wilayah: "Cipinang Cempedak", totalBalita: 54, balitaDiukur: 35, balitaBerisikoTinggi: 5, balitaBerisikoSedang: 8, balitaRendah: 22, cakupanMBG: 58, rujukanDilakukan: 5, statusPengumpulan: "belum" },
  { id: "L07", periode: "2026-01", posyanduNama: "Posyandu Dahlia", wilayah: "Balimeste", totalBalita: 71, balitaDiukur: 70, balitaBerisikoTinggi: 0, balitaBerisikoSedang: 3, balitaRendah: 67, cakupanMBG: 96, rujukanDilakukan: 0, statusPengumpulan: "lengkap", diunduhPada: "2026-02-01" },
  { id: "L08", periode: "2026-01", posyanduNama: "Posyandu Teratai", wilayah: "Cipinang Besar Selatan", totalBalita: 62, balitaDiukur: 52, balitaBerisikoTinggi: 1, balitaBerisikoSedang: 6, balitaRendah: 45, cakupanMBG: 80, rujukanDilakukan: 1, statusPengumpulan: "draft" },
];

export const notifikasiData: Notifikasi[] = [
  { id: "N01", tipe: "risiko", judul: "Balita baru naik ke risiko tinggi", pesan: "Kenzo Arvian Mahesa (Posyandu Flamboyan) terdeteksi berat badan turun 2 bulan berturut.", waktu: "10 menit lalu", dibaca: false, isRead: false, level: "critical" },
  { id: "N02", tipe: "mbg", judul: "Sinkronisasi MBG tertunda", pesan: "5 data penerimaan MBG dari Posyandu Flamboyan belum tersinkron ke server BGN.", waktu: "35 menit lalu", dibaca: false, isRead: false, level: "warning" },
  { id: "N03", tipe: "pengingat", judul: "Jadwal posyandu hari ini", pesan: "2 posyandu (Flamboyan & Mawar I) menyelenggarakan pencatatan rutin hari ini.", waktu: "2 jam lalu", dibaca: false, isRead: false, level: "info" },
  { id: "N04", tipe: "sistem", judul: "Laporan Januari 2026 siap diunduh", pesan: "6 dari 8 posyandu telah melengkapi laporan bulanan.", waktu: "5 jam lalu", dibaca: true, isRead: true, level: "success" },
  { id: "N05", tipe: "risiko", judul: "Rujukan baru memerlukan tindak lanjut", pesan: "Khalisa Nayla Azzahra dirujuk ke puskesmas, menunggu konfirmasi TPG.", waktu: "1 hari lalu", dibaca: true, isRead: true, level: "warning" },
];

// ============================================================
// KPI agregat (turunan dari mock data di atas)
// ============================================================
export const kpiAgregat = {
  totalBalita: 644,
  balitaBerisikoTinggi: 23,
  balitaBerisikoSedang: 58,
  balitaRendah: 563,
  posyanduAktif: 8,
  kaderAktif: 31,
  cakupanMBGBulanan: 79,
  pencatatanBulanIni: 532,
  rujukanBulanIni: 14,
  seminarTerjadwal: 2,
  trenStunting6Bulan: [24.2, 23.8, 23.1, 22.6, 22.0, 21.4],
};

// Distribusi risiko per wilayah (untuk peta sebaran)
export const sebaranRisiko = wilayahData.map(w => ({
  wilayah: w.nama,
  prevalensi: w.prevalensiStunting,
  balita: w.jumlahBalita,
  posyandu: w.jumlahPosyandu,
  cakupanMBG: w.cakupanMBG,
  level: w.prevalensiStunting >= 25 ? "tinggi" : w.prevalensiStunting >= 20 ? "sedang" : "rendah" as "tinggi" | "sedang" | "rendah",
}));

// Helper: format tanggal Indonesia
export function formatTanggal(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTanggalPanjang(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
