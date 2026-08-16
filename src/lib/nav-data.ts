import type { UserRole } from "@/lib/auth-store";
import type { SectionId } from "@/lib/nav-store";
import {
  LayoutDashboard, Users, IdCard, CalendarDays, BookOpen,
  GraduationCap, UtensilsCrossed, FileText, MapPin, Settings
} from "lucide-react";

export interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  roles: UserRole[]; // which roles can see this item
}

export interface NavGroup {
  eyebrow: string;
  items: NavItem[];
}

export const groups: NavGroup[] = [
  {
    eyebrow: "OPERASIONAL",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "warga"] },
      { id: "data-balita", label: "Data Balita", icon: Users, roles: ["admin"] },
      { id: "kisb", label: "KISB Digital", icon: IdCard, roles: ["admin", "warga"] },
      { id: "jadwal", label: "Jadwal Posyandu", icon: CalendarDays, roles: ["admin", "warga"] },
    ],
  },
  {
    eyebrow: "EDUKASI & SEMINAR",
    items: [
      { id: "edukasi", label: "Edukasi Gizi", icon: BookOpen, roles: ["admin", "warga"] },
      { id: "seminar", label: "Seminar Gizi", icon: GraduationCap, roles: ["admin", "warga"] },
    ],
  },
  {
    eyebrow: "MBG & LAPORAN",
    items: [
      { id: "mbg", label: "Integrasi MBG", icon: UtensilsCrossed, roles: ["admin", "warga"] },
      { id: "laporan", label: "Laporan Bulanan", icon: FileText, roles: ["admin"] },
      { id: "peta-risiko", label: "Peta Sebaran Risiko", icon: MapPin, roles: ["admin"] },
    ],
  },
  {
    eyebrow: "SISTEM",
    items: [
      { id: "pengaturan", label: "Pengaturan", icon: Settings, roles: ["admin"] },
    ],
  },
];

export const roleLabels: Record<UserRole, string> = {
  admin: "Koordinator Puskesmas",
  warga: "Warga / Kader Posyandu",
};

export const sidebarTitles: Record<UserRole, string> = {
  admin: "Dashboard Admin",
  warga: "Dashboard Warga",
};
