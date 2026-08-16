import type { AuthUser } from "@/lib/auth-types";
import type { BalitaRecord } from "@/lib/balita-types";
import type { SyncConflict, SyncOperation } from "@/lib/sync/types";

const DB_NAME = "nutrikader";
const DB_VERSION = 1;

export type OfflineAuth = {
  id: "current";
  user: AuthUser;
  verifier: string;
  salt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("balita")) db.createObjectStore("balita", { keyPath: "id" });
      if (!db.objectStoreNames.contains("sync_queue")) db.createObjectStore("sync_queue", { keyPath: "id" });
      if (!db.objectStoreNames.contains("sync_conflicts")) db.createObjectStore("sync_conflicts", { keyPath: "id" });
      if (!db.objectStoreNames.contains("auth")) db.createObjectStore("auth", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB unavailable"));
  });
}

async function tx<T>(store: string, mode: IDBTransactionMode, work: (objectStore: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const request = work(transaction.objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}

async function getAll<T>(store: string): Promise<T[]> {
  return tx<T[]>(store, "readonly", (s) => s.getAll());
}

export const offlineDb = {
  listBalita: () => getAll<BalitaRecord>("balita"),
  getBalita: (id: string) => tx<BalitaRecord | undefined>("balita", "readonly", (s) => s.get(id)),
  putBalita: (value: BalitaRecord) => tx("balita", "readwrite", (s) => s.put(value)),
  deleteBalita: (id: string) => tx("balita", "readwrite", (s) => s.delete(id)),
  putQueue: (value: SyncOperation) => tx("sync_queue", "readwrite", (s) => s.put(value)),
  listQueue: () => getAll<SyncOperation>("sync_queue"),
  deleteQueue: (id: string) => tx("sync_queue", "readwrite", (s) => s.delete(id)),
  putConflict: (value: SyncConflict) => tx("sync_conflicts", "readwrite", (s) => s.put(value)),
  listConflicts: () => getAll<SyncConflict>("sync_conflicts"),
  deleteConflict: (id: string) => tx("sync_conflicts", "readwrite", (s) => s.delete(id)),
  putAuth: (value: OfflineAuth) => tx("auth", "readwrite", (s) => s.put(value)),
  getAuth: () => tx<OfflineAuth | undefined>("auth", "readonly", (s) => s.get("current")),
  clearAuth: () => tx("auth", "readwrite", (s) => s.delete("current")),
};

export async function passwordVerifier(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
