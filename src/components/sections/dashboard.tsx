"use client";

import { KpiCard } from "@/components/kpi-card";
import { PitaCapaian } from "@/components/pita-capaian";
import { SectionHeader, FlatCard } from "@/components/section";
import { RiskBadge, StatusBadge } from "@/components/status-badge";
import { useNav } from "@/lib/nav-store";
import { useAuth } from "@/lib/auth-store";
import {
  kpiAgregat, balitaData, posyanduData, wilayahData, sebaranRisiko, formatTanggal,
} from "@/lib/mock-data";
import {
  Users, AlertTriangle, UtensilsCrossed, CalendarClock,
  Activity, ArrowRight, HeartPulse,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";

const BULAN = ["Ags", "Sep", "Okt", "Nov", "Des", "Jan"];

export function DashboardSection() {
  const { setSection, openBalita } = useNav();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const trenStunting = kpiAgregat.trenStunting6Bulan.map((v, i) => ({
    bulan: BULAN[i],
    prevalensi: v,
    target: 14.2,
  }));

  const distribusiRisiko = [
    { name: "Rendah", value: kpiAgregat.balitaRendah, fill: "var(--color-success)" },
    { name: "Sedang", value: kpiAgregat.balitaBerisikoSedang, fill: "var(--color-warning)" },
    { name: "Tinggi", value: kpiAgregat.balitaBerisikoTinggi, fill: "var(--color-critical)" },
  ];

  const balitaBerisikoTinggi = balitaData
    .filter((b) => b.risiko === "tinggi")
    .slice(0, 5);

  const posyanduPerluPerhatian = posyanduData
    .filter((p) => p.status === "perlu_perhatian" || p.capaianPencatatan < 80)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome strip */}
      <div className="bg-gradient-to-r from-[#03132e] via-[#071e49] to-[#041533] rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 text-white opacity-5 pointer-events-none">
          <Activity className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
              SELAMAT DATANG, {user?.name?.toUpperCase() || "PENGGUNA"}
            </span>
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-bold text-white leading-tight mt-3 max-w-xl">
            {isAdmin ? "Ringkasan Operasional Wilayah Jatinegara" : "Ringkasan Data Anak & Posyandu Anda"}
          </h2>
          
          <div className="w-12 h-1 bg-emerald-500 rounded-full my-3.5"></div>
          
          <p className="text-white/80 text-sm max-w-lg leading-relaxed">
            {isAdmin
              ? `Pemantauan ${kpiAgregat.totalBalita} balita aktif di ${kpiAgregat.posyanduAktif} posyandu. ${kpiAgregat.balitaBerisikoTinggi} balita berisiko tinggi memerlukan tindak lanjut segera.`
              : "Pantau tumbuh kembang anak dan jadwal posyandu terdekat dengan mudah dan akurat."
            }
          </p>
        </div>

        <div className="relative z-10 w-full lg:w-[380px] shrink-0 flex flex-col gap-3.5 mt-6 lg:mt-0">
          {isAdmin ? (
            <>
              <div 
                role="button"
                tabIndex={0}
                onClick={(e) => { e.preventDefault(); setSection("data-balita"); }}
                className="bg-gradient-to-r from-[#8cd33a] to-[#76b82a] text-[#071E49] p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-left w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#588d1d] shadow-sm shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[16px] text-[#071E49] leading-snug">Lihat Data Balita</div>
                  <div className="text-xs text-[#071E49]/80 mt-0.5 leading-snug">Lihat riwayat dan perkembangan balita Anda</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#071E49] shadow-sm shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              
              <div 
                onClick={() => setSection("mbg")}
                className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-left w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#1d4ed8] shadow-sm shrink-0">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[16px] text-white leading-snug">Monitor Program MBG</div>
                  <div className="text-xs text-white/80 mt-0.5 leading-snug">Pantau pelaksanaan program MBG di wilayah Anda</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shadow-sm shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div 
                onClick={() => setSection("kisb")}
                className="bg-gradient-to-r from-[#8cd33a] to-[#76b82a] text-[#071E49] p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-left w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#588d1d] shadow-sm shrink-0">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[16px] text-[#071E49] leading-snug">Lihat KISB Digital</div>
                  <div className="text-xs text-[#071E49]/80 mt-0.5 leading-snug">Akses kartu identitas &amp; status gizi anak Anda</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#071E49] shadow-sm shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div 
                onClick={() => setSection("jadwal")}
                className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-left w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#1d4ed8] shadow-sm shrink-0">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[16px] text-white leading-snug">Jadwal Posyandu Terdekat</div>
                  <div className="text-xs text-white/80 mt-0.5 leading-snug">Pantau jadwal posyandu Anda</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shadow-sm shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Balita Aktif" value={kpiAgregat.totalBalita} unit="balita" delta={{ value: 2.4, positive: true, label: "vs bulan lalu" }} accent="primary" icon={<Users className="w-4 h-4" />} />
        <KpiCard label="Balita Risiko Tinggi" value={kpiAgregat.balitaBerisikoTinggi} unit="balita" delta={{ value: 8.1, positive: false, label: "perlu rujukan" }} accent="critical" icon={<AlertTriangle className="w-4 h-4" />} />
        <KpiCard label="Cakupan MBG Bulan Ini" value={kpiAgregat.cakupanMBGBulanan} unit="%" delta={{ value: 4.2, positive: true, label: "sasaran terverifikasi" }} accent="success" icon={<UtensilsCrossed className="w-4 h-4" />} />
        <KpiCard label="Pencatatan Bulan Ini" value={kpiAgregat.pencatatanBulanIni} unit={`/ ${kpiAgregat.totalBalita}`} hint="Kelengkapan 82.6%" accent="warning" icon={<Activity className="w-4 h-4" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FlatCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
                Tren Prevalensi Risiko Stunting (6 Bulan)
              </h3>
              <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                Turun dari 24,2% → 21,4% · Target RPJMN 14,2%
              </p>
            </div>
            <StatusBadge tone="success" dot={false}>▼ 2,8 poin</StatusBadge>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={trenStunting} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradStunting" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#071E49" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#071E49" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(181,224,234,0.4)" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#5B6B7A" }} axisLine={false} tickLine={false} />
                <YAxis domain={[12, 26]} tick={{ fontSize: 11, fill: "#5B6B7A" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(7,30,73,0.12)", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(7,30,73,0.12)" }}
                  formatter={(v: number, n: string) => [`${v}%`, n === "prevalensi" ? "Prevalensi" : "Target RPJMN"]}
                />
                <Area type="monotone" dataKey="prevalensi" stroke="#071E49" strokeWidth={2} fill="url(#gradStunting)" />
                <Area type="monotone" dataKey="target" stroke="#92D05D" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FlatCard>

        <FlatCard>
          <h3 className="text-[15px] font-semibold mb-1" style={{ color: "var(--color-primary)" }}>
            Distribusi Risiko Balita
          </h3>
          <p className="text-[12px] mb-3" style={{ color: "var(--color-text-muted)" }}>
            Berdasarkan {kpiAgregat.totalBalita} balita aktif
          </p>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={distribusiRisiko} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(181,224,234,0.4)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#5B6B7A" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#1C2733" }} axisLine={false} tickLine={false} width={56} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(7,30,73,0.12)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v} balita`, "Jumlah"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                  {distribusiRisiko.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(181,224,234,0.4)" }}>
            <div className="flex items-center justify-between text-[12px]">
              <span style={{ color: "var(--color-text-muted)" }}>Rasio rujukan</span>
              <span className="font-data" style={{ color: "var(--color-primary)" }}>{kpiAgregat.rujukanBulanIni} balita</span>
            </div>
          </div>
        </FlatCard>
      </div>

      {/* Pita Capaian per posyandu + Daftar balita berisiko */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <FlatCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>Capaian Pencatatan per Posyandu</h3>
              <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>Kelengkapan data bulan ini (Pita Capaian)</p>
            </div>
          </div>
          <ul className="space-y-3 max-h-[280px] overflow-y-auto scroll-thin pr-1">
            {posyanduData.map((p) => {
              const state = p.capaianPencatatan >= 85 ? "on-track" : p.capaianPencatatan >= 65 ? "attention" : "critical";
              return (
                <li key={p.id}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>{p.nama}</div>
                      <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{p.kelurahan} · {p.balitaAktif} balita</div>
                    </div>
                    {p.status === "perlu_perhatian" && <StatusBadge tone="warning">Perlu Perhatian</StatusBadge>}
                  </div>
                  <PitaCapaian value={p.capaianPencatatan} state={state} segments={10} />
                </li>
              );
            })}
          </ul>
        </FlatCard>

        <FlatCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>Balita Risiko Tinggi — Perlu Tindak Lanjut</h3>
              <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>{balitaBerisikoTinggi.length} dari {kpiAgregat.balitaBerisikoTinggi} balita di seluruh wilayah</p>
            </div>
            <button type="button" onClick={() => setSection("data-balita")} className="text-[12px] inline-flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left" style={{ color: "var(--color-text-muted)" }}>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2 pr-3">Nama Balita</th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2 pr-3 hidden sm:table-cell">Posyandu</th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2 pr-3 text-right whitespace-nowrap">Usia</th>
                  <th className="font-medium text-[11px] uppercase tracking-wide py-2 pr-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {balitaBerisikoTinggi.map((b) => (
                  <tr key={b.id} onClick={() => openBalita(b.id)} className="cursor-pointer border-t hover:bg-[var(--color-info-tint)] transition-colors" style={{ borderColor: "rgba(181,224,234,0.3)" }}>
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold" style={{ color: "var(--color-text)" }}>{b.nama}</div>
                      <div className="font-data text-[11px]" style={{ color: "var(--color-text-muted)" }}>NIK {b.nik}</div>
                    </td>
                    <td className="py-2.5 pr-3 hidden sm:table-cell">
                      <div style={{ color: "var(--color-text)" }}>{b.posyanduNama}</div>
                      <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{b.kelurahan}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-data" style={{ color: "var(--color-text)" }}><span className="whitespace-nowrap">{b.usiaBulan} bln</span></td>
                    <td className="py-2.5 pr-3"><div className="whitespace-nowrap shrink-0"><RiskBadge level={b.risiko} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FlatCard>
      </div>

      {/* Wilayah & posyandu perlu perhatian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FlatCard>
          <h3 className="text-[15px] font-semibold mb-1" style={{ color: "var(--color-primary)" }}>Sebaran Risiko per Kelurahan</h3>
          <p className="text-[12px] mb-3" style={{ color: "var(--color-text-muted)" }}>Klik untuk detail peta sebaran</p>
          <ul className="space-y-2">
            {sebaranRisiko.map((w) => (
              <li key={w.wilayah}>
                <button type="button" onClick={() => setSection("peta-risiko")} className="w-full text-left p-2.5 rounded-[6px] border hover:bg-[var(--color-info-tint)] transition-colors" style={{ borderColor: "rgba(7,30,73,0.08)" }}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>{w.wilayah}</span>
                    <span className="font-data text-[13px] font-semibold" style={{ color: w.level === "tinggi" ? "var(--color-critical)" : w.level === "sedang" ? "#6b4f1a" : "#3a6b1a" }}>{w.prevalensi}%</span>
                  </div>
                  <PitaCapaian value={w.prevalensi} state={w.level === "tinggi" ? "critical" : w.level === "sedang" ? "attention" : "on-track"} segments={12} showLabel={false} height={6} />
                </button>
              </li>
            ))}
          </ul>
        </FlatCard>

        <FlatCard>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>Posyandu Perlu Perhatian</h3>
              <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>Capaian pencatatan &lt; 80% atau status nonaktif</p>
            </div>
            <CalendarClock className="w-4 h-4" style={{ color: "var(--color-warning)" }} />
          </div>
          <ul className="space-y-3">
            {posyanduPerluPerhatian.map((p) => (
              <li key={p.id} className="p-3 rounded-[6px] border" style={{ borderColor: "rgba(7,30,73,0.08)", backgroundColor: "var(--color-bg)" }}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1 truncate">
                    <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text)" }}>{p.nama}</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--color-text-muted)" }}>{p.kelurahan} · Jadwal berikut: {formatTanggal(p.jadwalBerikutnya)}</div>
                  </div>
                  <div className="shrink-0 whitespace-nowrap">
                    <StatusBadge tone={p.status === "perlu_perhatian" ? "warning" : "critical"}>{p.status === "perlu_perhatian" ? "Perlu Perhatian" : "Kritis"}</StatusBadge>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  <span className="font-data">Capaian: {p.capaianPencatatan}%</span>
                  <span>·</span>
                  <span className="font-data">{p.balitaBerisiko} balita berisiko</span>
                  <span>·</span>
                  <span className="font-data">{p.kaderAktif} kader</span>
                </div>
              </li>
            ))}
          </ul>
        </FlatCard>
      </div>
    </div>
  );
}
