"use client";

import type { Balita } from "@/lib/types";
import type { BalitaRecord } from "@/lib/balita-types";
import type { SyncConflict, SyncOperation } from "@/lib/sync/types";
import { mergeSyncOperation } from "@/lib/sync/queue";
import { offlineDb } from "./offline-db";

export type { BalitaRecord };

const newId = () => `B-${crypto.randomUUID()}`;

function now() {
  return new Date().toISOString();
}

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`) as Error & { status?: number; current?: BalitaRecord };
    error.status = response.status;
    error.current = data.current;
    throw error;
  }
  return data;
}

function asPending(data: BalitaRecord): BalitaRecord {
  return { ...data, sinkronisasi: "tertunda" };
}

async function enqueue(operation: SyncOperation) {
  const queue = await offlineDb.listQueue();
  const existing = queue.find((item) => item.entity === "balita" && item.entityId === operation.entityId);
  const merged = mergeSyncOperation(existing, operation);
  if (merged) await offlineDb.putQueue(merged);
  else if (existing) await offlineDb.deleteQueue(existing.id);
}

export async function listBalita(): Promise<BalitaRecord[]> {
  if (navigator.onLine) {
    try {
      const response = await api<{ data: BalitaRecord[] }>("/api/balita");
      await Promise.all(response.data.map((item) => offlineDb.putBalita(item)));
      return response.data;
    } catch {
      // Fall through to the local DB.
    }
  }
  return offlineDb.listBalita();
}

export async function getBalita(id: string) {
  if (navigator.onLine) {
    try {
      const response = await api<{ data: BalitaRecord }>(`/api/balita/${encodeURIComponent(id)}`);
      await offlineDb.putBalita(response.data);
      return response.data;
    } catch {
      // Fall through to the local DB.
    }
  }
  return offlineDb.getBalita(id);
}

export async function createBalita(input: Balita) {
  const draft: BalitaRecord = {
    ...input,
    id: input.id || newId(),
    version: 0,
    updatedAt: now(),
    sinkronisasi: "tertunda",
  };

  if (navigator.onLine) {
    try {
      const response = await api<{ data: BalitaRecord }>("/api/balita", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      await offlineDb.putBalita(response.data);
      return { data: response.data, queued: false };
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status && status < 500) throw error;
      // Network/server outage: queue below.
    }
  }

  await offlineDb.putBalita(draft);
  await enqueue({
    id: crypto.randomUUID(),
    entity: "balita",
    operation: "CREATE",
    entityId: draft.id,
    baseVersion: 0,
    payload: draft,
    createdAt: now(),
  });
  return { data: draft, queued: true };
}

export async function updateBalita(input: BalitaRecord) {
  const local = asPending({ ...input, updatedAt: now() });
  if (navigator.onLine) {
    try {
      const response = await api<{ data: BalitaRecord }>(`/api/balita/${encodeURIComponent(input.id)}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
      await offlineDb.putBalita(response.data);
      return { data: response.data, queued: false };
    } catch (error) {
      if ((error as { status?: number }).status === 409) {
        const conflict: SyncConflict = {
          id: crypto.randomUUID(),
          queueId: "",
          entity: "balita",
          operation: "UPDATE",
          entityId: input.id,
          baseVersion: input.version,
          localPayload: local,
          serverPayload: (error as { current?: BalitaRecord }).current ?? null,
          createdAt: now(),
        };
        await offlineDb.putConflict(conflict);
        return { conflict, queued: false };
      }
    }
  }

  await offlineDb.putBalita(local);
  await enqueue({
    id: crypto.randomUUID(),
    entity: "balita",
    operation: "UPDATE",
    entityId: input.id,
    baseVersion: input.version,
    payload: local,
    createdAt: now(),
  });
  return { data: local, queued: true };
}

export async function deleteBalita(input: BalitaRecord) {
  if (navigator.onLine) {
    try {
      const response = await api<{ data: BalitaRecord }>(
        `/api/balita/${encodeURIComponent(input.id)}?version=${input.version}`,
        { method: "DELETE" },
      );
      await offlineDb.deleteBalita(input.id);
      return { data: response.data, queued: false };
    } catch (error) {
      if ((error as { status?: number }).status === 409) {
        const conflict: SyncConflict = {
          id: crypto.randomUUID(),
          queueId: "",
          entity: "balita",
          operation: "DELETE",
          entityId: input.id,
          baseVersion: input.version,
          localPayload: input,
          serverPayload: (error as { current?: BalitaRecord }).current ?? null,
          createdAt: now(),
        };
        await offlineDb.putConflict(conflict);
        return { conflict, queued: false };
      }
    }
  }

  await offlineDb.deleteBalita(input.id);
  await enqueue({
    id: crypto.randomUUID(),
    entity: "balita",
    operation: "DELETE",
    entityId: input.id,
    baseVersion: input.version,
    payload: input,
    createdAt: now(),
  });
  return { data: input, queued: true };
}

export async function listConflicts() {
  return offlineDb.listConflicts();
}
