import { z } from "zod";

const pengukuranSchema = z.object({
  id: z.string(),
  tanggal: z.string().date(),
  usiaBulan: z.number().int().nonnegative(),
  beratBadan: z.number().nonnegative(),
  tinggiBadan: z.number().nonnegative(),
  lingkarKepala: z.number().nonnegative(),
  zScoreBBU: z.number(),
  zScoreTBU: z.number(),
  catatan: z.string().optional(),
  sakitBulanItu: z.boolean().optional(),
});

const imunisasiSchema = z.object({
  id: z.string(),
  nama: z.string(),
  tanggal: z.string().date(),
  status: z.enum(["lengkap", "belum", "tertunda"]),
});

const mbgSchema = z.object({
  id: z.string(),
  tanggal: z.string().date(),
  penerima: z.enum(["balita", "ibu_hamil", "ibu_menyusui"]),
  menu: z.string(),
  porsi: z.number().nonnegative(),
  status: z.enum(["tersalurkan", "terjadwal"]),
});

export const balitaWriteSchema = z.object({
  id: z.string().min(1).max(64),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit."),
  nama: z.string().trim().min(2).max(120),
  jenisKelamin: z.enum(["L", "P"]),
  tanggalLahir: z.string().date(),
  posyanduId: z.string().min(1).max(64),
  posyanduNama: z.string().min(1).max(160),
  kelurahan: z.string().min(1).max(160),
  namaIbu: z.string().trim().min(2).max(120),
  beratLahir: z.number().nonnegative().max(20),
  tinggiLahir: z.number().nonnegative().max(150),
  usiaBulan: z.number().int().nonnegative().max(72),
  risiko: z.enum(["rendah", "sedang", "tinggi"]),
  alasanRisiko: z.array(z.string()).max(20),
  pengukuran: z.array(pengukuranSchema).max(120),
  imunisasi: z.array(imunisasiSchema).max(100),
  penerimaanMBG: z.array(mbgSchema).max(100),
  penerimaMBG: z.boolean(),
  statusPosyandu: z.enum(["aktif", "lulus"]),
  catatanKader: z.string().max(2000).optional(),
  fotoSeed: z.string().max(120),
});

export const balitaUpdateSchema = balitaWriteSchema.extend({
  version: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type ValidatedBalitaWrite = z.infer<typeof balitaWriteSchema>;
