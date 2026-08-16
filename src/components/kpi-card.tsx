"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// ============================================================
// KPI Card — angka display-lg (Fraunces), label caption,
// indikator delta (hijau tunas / merah siaga).
// Count-up 400ms ease-out sekali saat data pertama load (§8).
// ============================================================

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  delta?: { value: number; positive?: boolean; label?: string };
  hint?: string;
  icon?: React.ReactNode;
  accent?: "primary" | "success" | "warning" | "critical" | "info";
  format?: (n: number) => string;
}

const accentBar: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  critical: "var(--color-critical)",
  info: "var(--color-info)",
};

function useCountUp(target: number, duration = 400) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [val, setVal] = useState(prefersReduced ? target : 0);
  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, prefersReduced]);
  return val;
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  hint,
  icon,
  accent = "primary",
  format,
}: KpiCardProps) {
  const animated = useCountUp(value);
  const display = format ? format(animated) : animated.toLocaleString("id-ID");

  return (
    <div
      className="relative rounded-[8px] p-4 border overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "rgba(7, 30, 73, 0.08)",
      }}
    >
      {/* Accent strip kiri */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: accentBar[accent] }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-medium tracking-wide uppercase"
          style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: accentBar[accent] }} aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className="font-display tabular-nums"
          style={{ fontSize: "var(--text-display-lg)", fontWeight: 500, color: "var(--color-primary)", lineHeight: 1.1 }}
        >
          {display}
        </span>
        {unit && (
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
            {unit}
          </span>
        )}
      </div>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold"
              )}
              style={{
                color: delta.positive ? "#3a6b1a" : "var(--color-critical)",
                fontSize: "var(--text-caption)",
              }}
            >
              {delta.positive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(delta.value)}%
            </span>
          )}
          {delta?.label && (
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
              {delta.label}
            </span>
          )}
          {hint && !delta && (
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
