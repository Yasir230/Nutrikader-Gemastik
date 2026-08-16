import { NextRequest, NextResponse } from "next/server";
import { createSession, clearSession, getSessionUser } from "@/lib/server/session";
import { supabaseRpc } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password harus diisi." },
        { status: 400 },
      );
    }

    const rows = await supabaseRpc<Array<{
      id: string;
      email: string;
      name: string;
      role: "admin" | "warga";
      avatar: string | null;
    }>>("verify_user_password", {
      p_email: normalizedEmail,
      p_password: String(password),
    });

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah." },
        { status: 401 },
      );
    }

    await createSession(user.id);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("POST /api/auth failed", error);
    return NextResponse.json(
      { success: false, error: "Layanan autentikasi belum terkonfigurasi." },
      { status: 503 },
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json(
      { success: false, user: null, error: "Sesi tidak dapat diperiksa." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
