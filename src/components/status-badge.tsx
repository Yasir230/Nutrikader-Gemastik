"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel, SyncStatus, PosyanduStatus } from "@/lib/types";

// ============================================================
// Status Badge — 4 state semantik (design-system §6)
// + risk pill khusus stunting
// ============================================================

type BadgeTone = "info" | "success" | "warning" | "critical" | "neutral";

const toneStyles: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  info: { bg: "var(--color-info-tint)", fg: "var(--color-primary)", border: "rgba(181,224,234,0.7)" },
  success: { bg: "var(--color-success-tint)", fg: "#3a6b1a", border: "rgba(146,208,93,0.5)" },
  warning: { bg: "var(--color-warning-tint)", fg: "#6b4f1a", border: "rgba(209,176,108,0.5)" },
  critical: { bg: "var(--color-critical-tint)", fg: "var(--color-critical)", border: "rgba(179,58,58,0.4)" },
  neutral: { bg: "rgba(7,30,73,0.06)", fg: "var(--color-text-muted)", border: "rgba(7,30,73,0.12)" },
};

export function StatusBadge({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const s = toneStyles[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 font-medium rounded-[4px] border",
        className
      )}
      style={{ backgroundColor: s.bg, color: s.fg, borderColor: s.border, fontSize: "var(--text-caption)" }}
    >
      {dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: s.fg }}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

const riskToneMap: Record<RiskLevel, BadgeTone> = {
  rendah: "success",
  sedang: "warning",
  tinggi: "critical",
};

const riskLabel: Record<RiskLevel, string> = {
  rendah: "Risiko Rendah",
  sedang: "Risiko Sedang",
  tinggi: "Risiko Tinggi",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <StatusBadge tone={riskToneMap[level]} className={className}>
      {riskLabel[level]}
    </StatusBadge>
  );
}

const syncToneMap: Record<SyncStatus, BadgeTone> = {
  tersinkron: "success",
  tertunda: "warning",
  gagal: "critical",
};
const syncLabel: Record<SyncStatus, string> = {
  tersinkron: "Tersinkron",
  tertunda: "Tertunda",
  gagal: "Gagal Sinkron",
};
export function SyncBadge({ status }: { status: SyncStatus }) {
  return <StatusBadge tone={syncToneMap[status]}>{syncLabel[status]}</StatusBadge>;
}

const posyanduToneMap: Record<PosyanduStatus, BadgeTone> = {
  aktif: "success",
  perlu_perhatian: "warning",
  nonaktif: "neutral",
};
const posyanduLabel: Record<PosyanduStatus, string> = {
  aktif: "Aktif",
  perlu_perhatian: "Perlu Perhatian",
  nonaktif: "Nonaktif",
};
export function PosyanduStatusBadge({ status }: { status: PosyanduStatus }) {
  return <StatusBadge tone={posyanduToneMap[status]}>{posyanduLabel[status]}</StatusBadge>;
}
