import type { Balita } from "@/lib/types";
import type { BalitaRecord } from "@/lib/balita-types";

export type SyncOperationType = "CREATE" | "UPDATE" | "DELETE";

export interface SyncOperation {
  id: string;
  entity: "balita";
  operation: SyncOperationType;
  entityId: string;
  baseVersion: number;
  payload?: BalitaRecord;
  createdAt: string;
}

export interface SyncConflict {
  id: string;
  queueId: string;
  entity: "balita";
  operation: SyncOperationType;
  entityId: string;
  baseVersion: number;
  localPayload: BalitaRecord;
  serverPayload: BalitaRecord | null;
  createdAt: string;
}

export type SyncResultItem =
  | { id: string; status: "applied"; data: BalitaRecord }
  | { id: string; status: "conflict"; data: BalitaRecord | null }
  | { id: string; status: "rejected"; error: string };

export interface SyncResponse {
  results: SyncResultItem[];
}

export interface SyncResolution {
  conflictId: string;
  entityId: string;
  decision: "USE_SERVER" | "USE_LOCAL";
  localPayload?: BalitaRecord;
  serverVersion?: number;
}

// Keep Balita available to consumers that used the previous module shape.
export type { Balita };
