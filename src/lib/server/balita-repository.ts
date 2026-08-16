import { supabaseRest } from "./supabase-admin";
import { balitaToRow, rowToBalita, type BalitaRow, type BalitaWrite } from "@/lib/balita-dto";

const SELECT = "id,nik,nama,jenis_kelamin,tanggal_lahir,posyandu_id,posyandu_nama,kelurahan,nama_ibu,berat_lahir,tinggi_lahir,usia_bulan,risiko,alasan_risiko,pengukuran,imunisasi,penerimaan_mbg,penerima_mbg,status_posyandu,catatan_kader,foto_seed,version,updated_by,updated_at,deleted_at";

export async function listBalita() {
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    query: {
      select: SELECT,
      deleted_at: "is.null",
      order: "nama.asc",
    },
  });
  return rows.map(rowToBalita);
}

export async function getBalita(id: string) {
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    query: { select: SELECT, id: `eq.${encodeURIComponent(id)}`, deleted_at: "is.null", limit: "1" },
  });
  return rows[0] ? rowToBalita(rows[0]) : null;
}

export async function getBalitaAny(id: string) {
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    query: { select: SELECT, id: `eq.${id}`, limit: "1" },
  });
  return rows[0] ? rowToBalita(rows[0]) : null;
}

export async function restoreBalita(input: BalitaWrite, userId: string, expectedVersion: number) {
  const row = balitaToRow(input, userId);
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...row, version: expectedVersion + 1, deleted_at: null }),
    query: {
      select: SELECT,
      id: `eq.${input.id}`,
      version: `eq.${expectedVersion}`,
    },
  });
  if (!rows[0]) return { conflict: true as const, current: await getBalitaAny(input.id) };
  return { conflict: false as const, data: rowToBalita(rows[0]) };
}

export async function createBalita(input: BalitaWrite, userId: string) {
  const row = balitaToRow(input, userId, 1);
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
    query: { select: SELECT },
  });
  return rowToBalita(rows[0]);
}

export async function updateBalita(input: BalitaWrite, userId: string, expectedVersion: number) {
  const row = balitaToRow(input, userId);
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...row, version: expectedVersion + 1 }),
    query: {
      select: SELECT,
      id: `eq.${encodeURIComponent(input.id)}`,
      version: `eq.${expectedVersion}`,
      deleted_at: "is.null",
    },
  });
  if (!rows[0]) {
    const current = await getBalitaAny(input.id);
    return { conflict: true as const, current };
  }
  return { conflict: false as const, data: rows[0] ? rowToBalita(rows[0]) : null };
}

export async function deleteBalita(id: string, userId: string, expectedVersion: number) {
  const rows = await supabaseRest<BalitaRow[]>("balita", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      deleted_at: new Date().toISOString(),
      updated_by: userId,
      updated_at: new Date().toISOString(),
      version: expectedVersion + 1,
    }),
    query: {
      select: SELECT,
      id: `eq.${encodeURIComponent(id)}`,
      version: `eq.${expectedVersion}`,
      deleted_at: "is.null",
    },
  });
  if (!rows[0]) {
    return { conflict: true as const, current: await getBalitaAny(id) };
  }
  return { conflict: false as const, data: rowToBalita(rows[0]) };
}
