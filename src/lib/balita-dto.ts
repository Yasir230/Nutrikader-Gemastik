import type { Balita } from "@/lib/types";

export type BalitaRow = {
  id: string;
  nik: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  tanggal_lahir: string;
  posyandu_id: string;
  posyandu_nama: string;
  kelurahan: string;
  nama_ibu: string;
  berat_lahir: number;
  tinggi_lahir: number;
  usia_bulan: number;
  risiko: "rendah" | "sedang" | "tinggi";
  alasan_risiko: string[];
  pengukuran: Balita["pengukuran"];
  imunisasi: Balita["imunisasi"];
  penerimaan_mbg: Balita["penerimaanMBG"];
  penerima_mbg: boolean;
  status_posyandu: "aktif" | "lulus";
  catatan_kader: string | null;
  foto_seed: string;
  version: number;
  updated_by: string | null;
  updated_at: string;
  deleted_at: string | null;
};

export function rowToBalita(row: BalitaRow): Balita & { version: number; updatedAt: string } {
  return {
    id: row.id,
    nik: row.nik,
    nama: row.nama,
    jenisKelamin: row.jenis_kelamin,
    tanggalLahir: row.tanggal_lahir,
    posyanduId: row.posyandu_id,
    posyanduNama: row.posyandu_nama,
    kelurahan: row.kelurahan,
    namaIbu: row.nama_ibu,
    beratLahir: Number(row.berat_lahir),
    tinggiLahir: Number(row.tinggi_lahir),
    usiaBulan: row.usia_bulan,
    risiko: row.risiko,
    alasanRisiko: row.alasan_risiko ?? [],
    pengukuran: row.pengukuran ?? [],
    imunisasi: row.imunisasi ?? [],
    penerimaanMBG: row.penerimaan_mbg ?? [],
    penerimaMBG: row.penerima_mbg,
    statusPosyandu: row.status_posyandu,
    sinkronisasi: row.deleted_at ? "gagal" : "tersinkron",
    catatanKader: row.catatan_kader ?? undefined,
    fotoSeed: row.foto_seed,
    version: row.version,
    updatedAt: row.updated_at,
  };
}

export type BalitaWrite = Omit<ReturnType<typeof rowToBalita>, "sinkronisasi" | "version" | "updatedAt">;

export function balitaToRow(input: BalitaWrite, userId: string, version?: number) {
  return {
    id: input.id,
    nik: input.nik,
    nama: input.nama,
    jenis_kelamin: input.jenisKelamin,
    tanggal_lahir: input.tanggalLahir,
    posyandu_id: input.posyanduId,
    posyandu_nama: input.posyanduNama,
    kelurahan: input.kelurahan,
    nama_ibu: input.namaIbu,
    berat_lahir: input.beratLahir,
    tinggi_lahir: input.tinggiLahir,
    usia_bulan: input.usiaBulan,
    risiko: input.risiko,
    alasan_risiko: input.alasanRisiko,
    pengukuran: input.pengukuran,
    imunisasi: input.imunisasi,
    penerimaan_mbg: input.penerimaanMBG,
    penerima_mbg: input.penerimaMBG,
    status_posyandu: input.statusPosyandu,
    catatan_kader: input.catatanKader ?? null,
    foto_seed: input.fotoSeed,
    ...(version !== undefined ? { version } : {}),
    updated_by: userId,
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
}
