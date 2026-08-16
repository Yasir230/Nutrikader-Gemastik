import type { SyncOperation } from "./types";

export function mergeSyncOperation(
  existing: SyncOperation | undefined,
  incoming: SyncOperation,
): SyncOperation | null {
  if (!existing) return incoming;

  if (existing.entityId !== incoming.entityId || existing.entity !== incoming.entity) {
    return incoming;
  }

  if (existing.operation === "CREATE" && incoming.operation === "UPDATE") {
    return { ...existing, payload: incoming.payload, createdAt: incoming.createdAt };
  }

  if (existing.operation === "CREATE" && incoming.operation === "DELETE") {
    return null;
  }

  if (existing.operation === "UPDATE" && incoming.operation === "UPDATE") {
    return { ...existing, payload: incoming.payload, createdAt: incoming.createdAt };
  }

  if (incoming.operation === "DELETE") {
    return incoming;
  }

  return incoming;
}
