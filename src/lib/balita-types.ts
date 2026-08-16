import type { Balita } from "@/lib/types";
export type BalitaRecord = Balita & { version: number; updatedAt: string; deletedAt?: string | null };
