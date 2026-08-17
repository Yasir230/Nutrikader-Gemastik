"use client";

import { useState } from "react";
import { useNav, type SectionId } from "@/lib/nav-store";
import { useAuth, type UserRole } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { HeartPulse, LogOut, MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type NavItem, groups, roleLabels, sidebarTitles } from "@/lib/nav-data";

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function Sidebar() {
  const { section, setSection } = useNav();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role as UserRole;
  const filteredGroups = groups.map((g) => ({
    ...g,
    items: g.items.filter((it) => it.roles.includes(role)),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      className="hidden md:flex flex-col w-[240px] shrink-0 fixed inset-y-0 left-0 z-40"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-sidebar-foreground)",
        borderRight: "1px solid var(--color-sidebar-border)",
      }}
      aria-label="Navigasi utama"
    >
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3 border-b" style={{ borderColor: "var(--color-sidebar-border)" }}>
        <div
          className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-success)" }}
          aria-hidden
        >
          <HeartPulse className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-white" style={{ fontWeight: 500, fontSize: "var(--text-heading)" }}>
            NutriKader
          </div>
          <div className="tracking-wide uppercase" style={{ color: "var(--color-info)", fontSize: "var(--text-eyebrow)" }}>
            {sidebarTitles[role]}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-4">
        {filteredGroups.map((g) => (
          <div key={g.eyebrow} className="mb-5">
            <div
              className="px-2 mb-2 font-semibold tracking-[0.12em]"
              style={{ color: "var(--color-info)", fontSize: "var(--text-eyebrow)" }}
            >
              {g.eyebrow}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                const active = section === it.id;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => setSection(it.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[6px] transition-colors duration-150 text-left min-h-[var(--touch-min)]",
                        active ? "text-white" : "hover:text-white"
                      )}
                      style={{
                        backgroundColor: active ? "rgba(181, 224, 234, 0.14)" : "transparent",
                        color: active ? "#FFFFFF" : "var(--color-info)",
                        fontSize: "var(--text-label)",
                      }}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="shrink-0" style={{ width: "var(--icon-nav)", height: "var(--icon-nav)" }} />
                      <span className="truncate">{it.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--color-sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
            style={{ backgroundColor: role === "admin" ? "var(--color-warning)" : "var(--color-success)", color: "var(--color-primary)", fontSize: "var(--text-caption)" }}
            aria-hidden
          >
            {getInitials(user.name)}
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-white truncate" style={{ fontSize: "var(--text-caption)" }}>{user.name}</div>
            <div className="truncate" style={{ color: "var(--color-info)", fontSize: "var(--text-eyebrow)" }}>
              {roleLabels[role]}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-[4px] hover:bg-[rgba(181,224,234,0.14)] transition-colors flex items-center justify-center"
            style={{ color: "var(--color-info)", minWidth: "var(--touch-min)", minHeight: "var(--touch-min)" }}
            aria-label="Keluar dari akun"
            title="Keluar"
          >
            <LogOut className="shrink-0" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Mobile bottom-nav variant (compact) — only icons, 5 primary sections
export function MobileNav() {
  const { section, setSection } = useNav();
  const { user } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!user) return null;

  const role = user.role as UserRole;

  const getIcon = (id: SectionId) => {
    for (const group of groups) {
      const item = group.items.find(it => it.id === id);
      if (item) return item.icon;
    }
    return HeartPulse;
  };

  const primaryAdmin: NavItem[] = [
    { id: "dashboard", label: "Beranda", icon: getIcon("dashboard"), roles: ["admin", "warga"] },
    { id: "data-balita", label: "Balita", icon: getIcon("data-balita"), roles: ["admin"] },
    { id: "jadwal", label: "Jadwal", icon: getIcon("jadwal"), roles: ["admin", "warga"] },
    { id: "mbg", label: "MBG", icon: getIcon("mbg"), roles: ["admin", "warga"] },
  ];

  const primaryWarga: NavItem[] = [
    { id: "dashboard", label: "Beranda", icon: getIcon("dashboard"), roles: ["warga"] },
    { id: "kisb", label: "KISB", icon: getIcon("kisb"), roles: ["warga"] },
    { id: "jadwal", label: "Jadwal", icon: getIcon("jadwal"), roles: ["warga"] },
    { id: "edukasi", label: "Edukasi", icon: getIcon("edukasi"), roles: ["warga"] },
  ];

  const primary = role === "admin" ? primaryAdmin : primaryWarga;

  const filteredGroups = groups.map((g) => ({
    ...g,
    items: g.items.filter((it) => it.roles.includes(role)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          backgroundColor: "var(--color-primary)",
          borderTop: "1px solid var(--color-sidebar-border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        aria-label="Navigasi mobile"
      >
        {primary.map((it) => {
          const Icon = it.icon;
          const active = section === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setSection(it.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 min-h-[var(--touch-min)]"
              style={{ color: active ? "#FFFFFF" : "var(--color-info)" }}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="shrink-0" style={{ width: "var(--icon-nav-mobile)", height: "var(--icon-nav-mobile)" }} />
              <span style={{ fontSize: "var(--text-nav-label)" }}>{it.label}</span>
            </button>
          );
        })}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex-1 flex flex-col items-center gap-1 py-3 min-h-[var(--touch-min)]"
              style={{ color: "var(--color-info)" }}
            >
              <MoreHorizontal className="shrink-0" style={{ width: "var(--icon-nav-mobile)", height: "var(--icon-nav-mobile)" }} />
              <span style={{ fontSize: "var(--text-nav-label)" }}>Lainnya</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 border-t" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-sidebar-foreground)", borderColor: "var(--color-sidebar-border)" }}>
            <SheetHeader className="p-4 border-b text-left" style={{ borderColor: "var(--color-sidebar-border)" }}>
              <SheetTitle className="text-white" style={{ fontSize: "var(--text-heading)" }}>Menu Lainnya</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto scroll-thin p-4 space-y-6 mb-[80px]">
              {filteredGroups.map((g) => (
                <div key={g.eyebrow}>
                  <div
                    className="px-2 mb-2 font-semibold tracking-[0.12em]"
                    style={{ color: "var(--color-info)", fontSize: "var(--text-eyebrow)" }}
                  >
                    {g.eyebrow}
                  </div>
                  <ul className="space-y-0.5">
                    {g.items.map((it) => {
                      const Icon = it.icon;
                      const active = section === it.id;
                      return (
                        <li key={it.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSection(it.id);
                              setSheetOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[6px] transition-colors duration-150 text-left min-h-[var(--touch-min)]",
                              active ? "text-white" : "hover:text-white"
                            )}
                            style={{
                              backgroundColor: active ? "rgba(181, 224, 234, 0.14)" : "transparent",
                              color: active ? "#FFFFFF" : "var(--color-info)",
                              fontSize: "var(--text-label)",
                            }}
                          >
                            <Icon className="shrink-0" style={{ width: "var(--icon-nav)", height: "var(--icon-nav)" }} />
                            <span className="truncate">{it.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
