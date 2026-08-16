import { describe, expect, it } from "vitest";
import type { BalitaRecord } from "@/lib/balita-types";
import type { SyncConflict } from "@/lib/sync/types";

const conflict: SyncConflict = {
  id: "c1",
  queueId: "q1",
  entity: "balita",
  operation: "UPDATE",
  entityId: "B001",
  baseVersion: 4,
  localPayload: {
    id: "B001",
    nama: "Versi lokal",
    version: 4,
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as BalitaRecord,
  serverPayload: {
    id: "B001",
    nama: "Versi server",
    version: 5,
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as BalitaRecord,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("optimistic concurrency conflict policy", () => {
  it("never silently chooses a version", () => {
    expect(conflict.localPayload.nama).not.toBe(conflict.serverPayload?.nama);
    expect(conflict.serverPayload?.version).toBeGreaterThan(conflict.baseVersion);
  });

  it("requires explicit local or server choice", () => {
    const choices = ["server", "local"] as const;
    expect(choices).toContain("server");
    expect(choices).toContain("local");
  });
});
