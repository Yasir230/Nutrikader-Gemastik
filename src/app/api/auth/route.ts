import { NextRequest, NextResponse } from "next/server";
import { createSession, clearSession, getSessionUser } from "@/lib/server/session";
import { supabaseRpc } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

// Rate Limiting (In-Memory Simulation)
type RateLimitInfo = { count: number; lastAttempt: number };
const rateLimitStore = new Map<string, RateLimitInfo>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function isAllowed(ip: string): boolean {
  const now = Date.now();
  const info = rateLimitStore.get(ip) ?? { count: 0, lastAttempt: now };
  if (now - info.lastAttempt > WINDOW_MS) info.count = 0;
  info.count += 1;
  info.lastAttempt = now;
  rateLimitStore.set(ip, info);
  return info.count <= MAX_ATTEMPTS;
}

// Sanitization
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim()
    .replace(/\0/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validation
function validateCredentials(email: string, password: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return { isValid: false, error: 'Format email tidak valid.' };
  if (password.length < 8) return { isValid: false, error: 'Password minimal 8 karakter.' };
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (!isAllowed(ip)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const rawEmail = body?.email || "";
    const rawPassword = body?.password || "";

    const sanitizedEmail = sanitizeInput(rawEmail).toLowerCase();
    // Keep password characters intact, but remove null bytes to prevent injection,
    // HTML-escaping password could prevent valid logins with special chars.
    const sanitizedPassword = typeof rawPassword === 'string' ? rawPassword.replace(/\0/g, '') : '';

    if (!sanitizedEmail || !sanitizedPassword) {
      return NextResponse.json(
        { success: false, error: "Email dan password harus diisi." },
        { status: 400 },
      );
    }

    const validation = validateCredentials(sanitizedEmail, sanitizedPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
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
      p_email: sanitizedEmail,
      p_password: sanitizedPassword,
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
