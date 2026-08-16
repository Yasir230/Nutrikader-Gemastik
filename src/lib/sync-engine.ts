"use client";

import { offlineDb } from "@/lib/offline-db";
import type { SyncConflict, SyncOperation } from "@/lib/sync/types";

export async function listConflicts(): Promise<SyncConflict[]> {
  return offlineDb.listConflicts();
}

import type { BalitaRecord } from "@/lib/balita-types";

type SyncResult = {
  applied: number;
  conflicts: number;
  failed: number;
};

export async function applySyncResults(
  queue: SyncOperation[],
  results: Array<{
    id: string;
    status: "applied" | "conflict" | "rejected";
    data?: BalitaRecord | null;
  }>,
  db = offlineDb,
): Promise<SyncResult> {
  let applied = 0;
  let conflicts = 0;
  let failed = 0;

  for (const result of results) {
    const operation = queue.find((item) => item.id === result.id);
    if (!operation) continue;

    if (result.status === "applied" && result.data) {
      await db.putBalita(result.data);
      await db.deleteQueue(operation.id);
      applied += 1;
      continue;
    }

    if (result.status === "conflict") {
      const conflict: SyncConflict = {
        id: crypto.randomUUID(),
        queueId: operation.id,
        entity: "balita",
        operation: operation.operation,
        entityId: operation.entityId,
        baseVersion: operation.baseVersion,
        localPayload: operation.payload as BalitaRecord,
        serverPayload: result.data ?? null,
        createdAt: new Date().toISOString(),
      };
      await db.putConflict(conflict);
      conflicts += 1;
      continue;
    }

    failed += 1;
  }

  return { applied, conflicts, failed };
}

export async function syncPendingBalita(): Promise<SyncResult> {
  if (!navigator.onLine) return { applied: 0, conflicts: 0, failed: 0 };

  const queue = await offlineDb.listQueue();
  if (!queue.length) return { applied: 0, conflicts: 0, failed: 0 };

  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operations: queue.slice(0, 50) }),
  });

  if (!response.ok) return { applied: 0, conflicts: 0, failed: queue.length };

  const body = await response.json() as {
    results: Array<{
      id: string;
      status: "applied" | "conflict" | "rejected";
      data?: BalitaRecord | null;
      error?: string;
    }>;
  };

  return applySyncResults(queue, body.results);
}

export async function resolveBalitaConflict(
  conflict: SyncConflict,
  choice: "server" | "local",
) {
  if (choice === "server") {
    if (conflict.serverPayload?.deletedAt) {
      await offlineDb.deleteBalita(conflict.entityId);
    } else if (conflict.serverPayload) {
      await offlineDb.putBalita(conflict.serverPayload);
    }
    if (conflict.queueId) await offlineDb.deleteQueue(conflict.queueId);
    await offlineDb.deleteConflict(conflict.id);
    return;
  }

  if (!navigator.onLine || !conflict.serverPayload) {
    throw new Error("Resolusi lokal membutuhkan koneksi dan versi server terbaru.");
  }

  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resolution: "local",
      conflict: {
        entityId: conflict.entityId,
        operation: conflict.operation,
        serverVersion: conflict.serverPayload.version,
        localPayload: conflict.localPayload,
      },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Resolusi konflik gagal.");

  if (body.data) await offlineDb.putBalita(body.data);
  if (conflict.queueId) await offlineDb.deleteQueue(conflict.queueId);
  await offlineDb.deleteConflict(conflict.id);
}

export function startSyncEngine(): () => void {
  if (typeof window === "undefined") return () => undefined;

  const sync = () => syncPendingBalita().catch(() => undefined);
  window.addEventListener("online", sync);
  void sync();

  const interval = window.setInterval(sync, 30_000);
  return () => {
    window.removeEventListener("online", sync);
    window.clearInterval(interval);
  };
}
