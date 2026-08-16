"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Section header — judul + eyebrow + aksi kanan
// ============================================================

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div
            className="font-semibold tracking-[0.12em] uppercase mb-1"
            style={{ color: "var(--color-warning)", fontSize: "var(--text-eyebrow)" }}
          >
            {eyebrow}
          </div>
        )}
        <h2 className="font-display leading-tight" style={{ color: "var(--color-primary)", fontWeight: 500, fontSize: "var(--text-section-title)" }}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-body)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// Card dasar — hairline border, radius 8px, no shadow (§5)
export function FlatCard({
  children,
  className,
  pad = "p-4",
}: {
  children: React.ReactNode;
  className?: string;
  pad?: string;
}) {
  return (
    <div
      className={cn("rounded-[8px] border", pad, className)}
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "rgba(7, 30, 73, 0.08)",
      }}
    >
      {children}
    </div>
  );
}
