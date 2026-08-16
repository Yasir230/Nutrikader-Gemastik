import { describe, expect, it } from "vitest";
import { applySyncResults } from "@/lib/sync-engine";
import type { SyncOperation } from "@/lib/sync/types";

describe("sync engine result application", () => {
  it("applies successful operations and materializes conflicts", async () => {
    const queue: SyncOperation[] = [
      {
        id: "q1",
        entity: "balita",
        operation: "UPDATE",
        entityId: "B001",
        baseVersion: 4,
        payload: { id: "B001", nama: "Lokal" } as never,
        createdAt: new Date().toISOString(),
      },
      {
        id: "q2",
        entity: "balita",
        operation: "UPDATE",
        entityId: "B002",
        baseVersion: 7,
        payload: { id: "B002", nama: "Lokal 2" } as never,
        createdAt: new Date().toISOString(),
      },
    ];

    const state = {
      balita: new Map<string, unknown>(),
      deletedQueue: [] as string[],
      conflicts: [] as unknown[],
      async putBalita(value: unknown) { this.balita.set((value as { id: string }).id, value); },
      async deleteQueue(id: string) { this.deletedQueue.push(id); },
      async putConflict(value: unknown) { this.conflicts.push(value); },
    };

    const result = await applySyncResults(queue, [
      { id: "q1", status: "applied", data: { id: "B001", version: 5 } as never },
      { id: "q2", status: "conflict", data: { id: "B002", version: 8, nama: "Server" } as never },
    ], state as never);

    expect(result).toEqual({ applied: 1, conflicts: 1, failed: 0 });
    expect(state.balita.get("B001")).toEqual({ id: "B001", version: 5 });
    expect(state.deletedQueue).toEqual(["q1"]);
    expect(state.conflicts).toHaveLength(1);
  });
});
