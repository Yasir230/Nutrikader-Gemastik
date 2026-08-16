const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required on the server.");
  }
  return { supabaseUrl, serviceRoleKey };
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string> } = {},
): Promise<T> {
  const { supabaseUrl, serviceRoleKey } = requireConfig();
  const url = new URL(`${supabaseUrl}/rest/v1/${path.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(init.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase REST ${response.status}: ${text || response.statusText}`);
  }
  return (text ? JSON.parse(text) : undefined) as T;
}

export function supabaseRpc<T>(name: string, body: Record<string, unknown>) {
  return supabaseRest<T>(`rpc/${name}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
