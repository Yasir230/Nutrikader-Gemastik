import { NextRequest, NextResponse } from "next/server";
import { deleteBalita, getBalita, updateBalita } from "@/lib/server/balita-repository";
import { requireRole } from "@/lib/server/session";
import { balitaUpdateSchema } from "@/lib/balita-validation";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  const { id } = await params;
  const data = await getBalita(id);
  if (!data) return NextResponse.json({ error: "Balita tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: Context) {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  const { id } = await params;
  try {
    const parsed = balitaUpdateSchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.id !== id) {
      return NextResponse.json({ error: "Data balita tidak valid.", details: parsed.success ? undefined : parsed.error.flatten() }, { status: 400 });
    }
    const result = await updateBalita(parsed.data, auth.user.id, parsed.data.version);
    if (result.conflict) {
      return NextResponse.json(
        { error: "CONFLICT", current: result.current },
        { status: 409 },
      );
    }
    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error(`PUT /api/balita/${id} failed`, error);
    return NextResponse.json({ error: "Gagal memperbarui data balita." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  const { id } = await params;
  const version = Number(new URL(request.url).searchParams.get("version"));
  if (!Number.isInteger(version)) {
    return NextResponse.json({ error: "version wajib diisi." }, { status: 400 });
  }
  try {
    const result = await deleteBalita(id, auth.user.id, version);
    if (result.conflict) {
      return NextResponse.json({ error: "CONFLICT", current: result.current }, { status: 409 });
    }
    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error(`DELETE /api/balita/${id} failed`, error);
    return NextResponse.json({ error: "Gagal menghapus data balita." }, { status: 503 });
  }
}
