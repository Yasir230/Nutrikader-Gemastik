import { describe, expect, it } from "vitest";
import { mergeSyncOperation } from "@/lib/sync/queue";
import type { SyncOperation } from "@/lib/sync/types";

const base = (operation: SyncOperation["operation"]): SyncOperation => ({
  id: "q1",
  entity: "balita",
  operation,
  entityId: "B001",
  baseVersion: 3,
  createdAt: "2026-01-01T00:00:00.000Z",
  payload: undefined,
});

describe("offline sync queue", () => {
  it("coalesces create + update into one create", () => {
    const merged = mergeSyncOperation(
      { ...base("CREATE"), payload: { id: "B001" } as never },
      { ...base("UPDATE"), payload: { id: "B001", nama: "Baru" } as never },
    );
    expect(merged?.operation).toBe("CREATE");
    expect(merged?.payload).toEqual({ id: "B001", nama: "Baru" });
  });

  it("cancels create + delete before the first sync", () => {
    const merged = mergeSyncOperation(
      { ...base("CREATE"), payload: { id: "B001" } as never },
      { ...base("DELETE") },
    );
    expect(merged).toBeNull();
  });

  it("keeps the original base version when multiple offline updates are merged", () => {
    const merged = mergeSyncOperation(
      { ...base("UPDATE"), payload: { id: "B001", nama: "v1" } as never },
      { ...base("UPDATE"), payload: { id: "B001", nama: "v2" } as never, baseVersion: 3 },
    );
    expect(merged?.baseVersion).toBe(3);
    expect(merged?.payload).toEqual({ id: "B001", nama: "v2" });
  });
});
