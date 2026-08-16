import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { supabaseRest } from "./supabase-admin";
import type { AuthUser, UserRole } from "@/lib/auth-types";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "nutrikader_session";
const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || "7");

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
  users?: { id: string; email: string; name: string; role: UserRole; avatar: string | null } | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86400000).toISOString();

  await supabaseRest("sessions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: expiresAt,
    }),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await supabaseRest("sessions", {
      method: "DELETE",
      query: { token_hash: `eq.${hashToken(token)}` },
    }).catch(() => undefined);
  }
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await supabaseRest<SessionRow[]>("sessions", {
    query: {
      select: "id,user_id,expires_at,users(id,email,name,role,avatar)",
      token_hash: `eq.${hashToken(token)}`,
      expires_at: `gt.${new Date().toISOString()}`,
      limit: "1",
    },
  });

  const session = rows[0];
  const user = session?.users;
  if (!session || !user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar ?? null,
  };
}

export async function requireRole(roles: UserRole[]) {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false as const, status: 401 as const, user: null };
  }
  if (!roles.includes(user.role)) {
    return { ok: false as const, status: 403 as const, user };
  }
  return { ok: true as const, status: 200 as const, user };
}
