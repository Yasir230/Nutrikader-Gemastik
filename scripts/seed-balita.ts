import { balitaData } from "../src/lib/mock-data";
import { posyanduData } from "../src/lib/mock-data";

const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function rest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function rpc(name: string, body: Record<string, unknown>) {
  return rest(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}

const adminId = await rpc("seed_user", {
  p_email: process.env.DEMO_ADMIN_EMAIL || "admin@nutrikader.id",
  p_password: process.env.DEMO_ADMIN_PASSWORD || "admin123",
  p_name: "dr. Rina Marlina",
  p_role: "admin",
});

await rpc("seed_user", {
  p_email: process.env.DEMO_WARGA_EMAIL || "warga@nutrikader.id",
  p_password: process.env.DEMO_WARGA_PASSWORD || "warga123",
  p_name: "Siti Aisyah",
  p_role: "warga",
});

const posyanduById = new Map(posyanduData.map((p) => [p.id, p]));

const rows = balitaData.map((b) => ({
  id: b.id,
  nik: b.nik,
  nama: b.nama,
  jenis_kelamin: b.jenisKelamin,
  tanggal_lahir: b.tanggalLahir,
  posyandu_id: b.posyanduId,
  posyandu_nama: b.posyanduNama,
  kelurahan: b.kelurahan,
  nama_ibu: b.namaIbu,
  berat_lahir: b.beratLahir,
  tinggi_lahir: b.tinggiLahir,
  usia_bulan: b.usiaBulan,
  risiko: b.risiko,
  alasan_risiko: b.alasanRisiko,
  pengukuran: b.pengukuran,
  imunisasi: b.imunisasi,
  penerimaan_mbg: b.penerimaanMBG,
  penerima_mbg: b.penerimaMBG,
  status_posyandu: b.statusPosyandu,
  catatan_kader: b.catatanKader ?? null,
  foto_seed: b.fotoSeed,
  version: 1,
  updated_by: adminId,
  updated_at: new Date().toISOString(),
  deleted_at: null,
}));

// Posyandu references are intentionally validated against mock-data so the seed
// remains derived from the prototype dataset rather than inventing records.
for (const row of rows) {
  if (!posyanduById.has(row.posyandu_id)) {
    throw new Error(`Unknown posyandu ${row.posyandu_id} in mock-data.ts`);
  }
}

await rest("balita?on_conflict=id", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(rows),
});

console.log(`Seeded ${rows.length} Balita records and demo users.`);
