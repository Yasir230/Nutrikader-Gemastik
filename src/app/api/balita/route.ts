import { NextRequest, NextResponse } from "next/server";
import { createBalita, listBalita } from "@/lib/server/balita-repository";
import { requireRole } from "@/lib/server/session";
import { balitaWriteSchema } from "@/lib/balita-validation";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  try {
    return NextResponse.json({ data: await listBalita() });
  } catch (error) {
    console.error("GET /api/balita failed", error);
    return NextResponse.json({ error: "Gagal mengambil data balita." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  try {
    const parsed = balitaWriteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Data balita tidak valid.", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = await createBalita(parsed.data, auth.user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/balita failed", error);
    return NextResponse.json({ error: "Gagal membuat data balita." }, { status: 503 });
  }
}
