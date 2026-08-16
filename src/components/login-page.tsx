"use client";

import { useState } from "react";
import { useAuth, type UserRole } from "@/lib/auth-store";
import { HeartPulse, Eye, EyeOff, Shield, UserCircle, ArrowRight } from "lucide-react";

// ============================================================
// NutriKader — Login Page (MBG/BGN Design System)
// ============================================================

const DEMO_ACCOUNTS = [
  {
    role: "admin" as UserRole,
    label: "Admin (Koordinator Puskesmas)",
    email: "admin@nutrikader.id",
    password: "admin123",
    name: "dr. Rina Marlina",
    icon: Shield,
    color: "var(--color-primary)",
    description: "Akses lengkap: dashboard, data balita, laporan, pengaturan sistem",
  },
  {
    role: "warga" as UserRole,
    label: "Warga (Orang Tua / Kader Posyandu)",
    email: "warga@nutrikader.id",
    password: "warga123",
    name: "Siti Aisyah",
    icon: UserCircle,
    color: "var(--color-success)",
    description: "Akses terbatas: data anak, edukasi gizi, jadwal posyandu",
  },
];

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    clearError();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Top accent bar */}
      <div
        className="w-full h-1.5"
        style={{
          background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 50%, var(--color-warning) 100%)",
        }}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo & branding */}
          <div className="text-center mb-8">
            <div
              className="inline-flex w-14 h-14 rounded-[10px] items-center justify-center mb-4"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              <HeartPulse className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <h1
              className="font-display leading-tight"
              style={{ color: "var(--color-primary)", fontWeight: 500, fontSize: "var(--text-display-sm)" }}
            >
              NutriKader
            </h1>
            <p className="mt-1.5" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-body)" }}>
              Dashboard Pendampingan Gizi Balita &amp; MBG
            </p>
            <p className="mt-0.5 font-data" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-data)" }}>
              Badan Gizi Nasional (BGN)
            </p>
          </div>

          {/* Login form card */}
          <div
            className="rounded-[8px] border p-6"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "rgba(7, 30, 73, 0.12)",
              boxShadow: "0 4px 16px rgba(7,30,73,0.08)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <div
                  className="rounded-[6px] px-3 py-2.5 flex items-start gap-2"
                  style={{
                    backgroundColor: "var(--color-critical-tint)",
                    color: "var(--color-critical)",
                    border: "1px solid rgba(179, 58, 58, 0.2)",
                    fontSize: "var(--text-body)",
                  }}
                  role="alert"
                >
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block font-semibold mb-1.5 tracking-wide"
                  style={{ color: "var(--color-primary)", fontSize: "var(--text-label)" }}
                >
                  Email
                </label>
                <div
                  className="flex items-center gap-2 rounded-[8px] border px-3 py-2.5"
                  style={{
                    borderColor: email ? "var(--color-primary)" : "rgba(7, 30, 73, 0.14)",
                    backgroundColor: "var(--color-bg)",
                    transition: "border-color 120ms",
                  }}
                >
                  <UserCircle className="w-4 h-4 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Masukkan email akun Anda"
                    className="flex-1 bg-transparent outline-none min-w-0"
                    style={{ color: "var(--color-text)", fontSize: "var(--text-body)" }}
                    autoComplete="email"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block font-semibold mb-1.5 tracking-wide"
                  style={{ color: "var(--color-primary)", fontSize: "var(--text-label)" }}
                >
                  Password
                </label>
                <div
                  className="flex items-center gap-2 rounded-[8px] border px-3 py-2.5"
                  style={{
                    borderColor: password ? "var(--color-primary)" : "rgba(7, 30, 73, 0.14)",
                    backgroundColor: "var(--color-bg)",
                    transition: "border-color 120ms",
                  }}
                >
                  <Shield className="w-4 h-4 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Masukkan password"
                    className="flex-1 bg-transparent outline-none min-w-0"
                    style={{ color: "var(--color-text)", fontSize: "var(--text-body)" }}
                    autoComplete="current-password"
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-[4px] min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex items-center justify-center"
                    style={{ color: "var(--color-text-muted)" }}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-[8px] font-semibold flex items-center justify-center gap-2 transition-colors duration-150 min-h-[var(--touch-min)]"
                style={{
                  backgroundColor: isLoading ? "rgba(7, 30, 73, 0.6)" : "var(--color-primary)",
                  color: "#FFFFFF",
                  opacity: isLoading ? 0.7 : 1,
                  fontSize: "var(--text-button)",
                }}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden
                    />
                    Memproses…
                  </span>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(181, 224, 234, 0.5)" }} />
              <span className="font-semibold tracking-wide" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-eyebrow)" }}>
                AKUN DEMO
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(181, 224, 234, 0.5)" }} />
            </div>

            {/* Demo account cards */}
            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => fillDemo(account)}
                    className="w-full text-left rounded-[8px] border p-3.5 hover:bg-[var(--color-info-tint)] transition-colors duration-150"
                    style={{
                      borderColor: "rgba(7, 30, 73, 0.1)",
                      backgroundColor: "transparent",
                    }}
                    aria-label={`Isi form dengan akun demo ${account.label}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[6px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${account.color}14`, color: account.color }}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold" style={{ color: "var(--color-text)", fontSize: "var(--text-body)" }}>
                          {account.label}
                        </div>
                        <div className="mt-0.5" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
                          {account.description}
                        </div>
                        <div
                          className="font-data mt-1.5 px-2 py-0.5 rounded-[4px] inline-block"
                          style={{
                            backgroundColor: "var(--color-info-tint)",
                            color: "var(--color-primary)",
                            fontSize: "var(--text-data)",
                          }}
                        >
                          {account.email}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center mt-6" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
            Sistem ini untuk staf operasional dan kader posyandu.
            <br />
            Hubungi koordinator puskesmas jika Anda belum memiliki akun.
          </p>
        </div>
      </div>

      {/* Bottom sticky footer */}
      <footer
        className="px-4 py-4 flex flex-col sm:flex-row justify-between gap-1"
        style={{
          color: "var(--color-text-muted)",
          borderTop: "1px solid rgba(181, 224, 234, 0.5)",
          backgroundColor: "var(--color-bg)",
          fontSize: "var(--text-caption)",
        }}
      >
        <span>
          NutriKader — Dashboard Pendampingan Gizi Balita &amp; MBG ·
          <span className="ml-1">Badan Gizi Nasional (BGN)</span>
        </span>
        <span className="font-data">
          Versi 1.0.0 · Data ilustratif (mock) · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
