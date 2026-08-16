"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Pita Capaian — signature component (design-system §6)
// Pita horizontal bersegmen, garis tepi atas Emas Padi 1px,
// fill sesuai state, label % IBM Plex Mono di ujung kanan.
// ============================================================

type PitaState = "on-track" | "attention" | "critical" | "info";

const stateFill: Record<PitaState, string> = {
  "on-track": "var(--color-success)",
  attention: "var(--color-warning)",
  critical: "var(--color-critical)",
  info: "var(--color-info)",
};

interface PitaCapaianProps {
  /** 0-100 */
  value: number;
  state?: PitaState;
  /** jumlah segmen (default 10) */
  segments?: number;
  showLabel?: boolean;
  height?: number;
  className?: string;
  label?: string;
}

export function PitaCapaian({
  value,
  state,
  segments = 10,
  showLabel = true,
  height = 8,
  className,
  label,
}: PitaCapaianProps) {
  const clamped = Math.max(0, Math.min(100, value));
  // Auto-state jika tidak diberikan
  const effectiveState: PitaState =
    state ?? (clamped >= 80 ? "on-track" : clamped >= 50 ? "attention" : "critical");

  const filledSegments = Math.round((clamped / 100) * segments);

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      {/* Pita + list emas */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          height,
          borderRadius: 4,
          backgroundColor: "rgba(7, 30, 73, 0.06)",
          boxShadow: "inset 0 0 0 1px rgba(7,30,73,0.04)",
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* List emas — garis tepi atas 1px Emas Padi (identitas BGN) */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: 1, backgroundColor: "var(--color-warning)" }}
        />
        {/* Segmen */}
        <div className="flex h-full">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="flex-1 transition-[background-color] duration-150"
              style={{
                backgroundColor: i < filledSegments ? stateFill[effectiveState] : "transparent",
                marginRight: i < segments - 1 ? 1 : 0,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>
      {/* Label % — IBM Plex Mono di ujung kanan */}
      {showLabel && (
        <span
          className="font-data tabular-nums whitespace-nowrap"
          style={{ color: "var(--color-text)", fontSize: "var(--text-caption)" }}
        >
          {label ?? `${clamped}%`}
        </span>
      )}
    </div>
  );
}
