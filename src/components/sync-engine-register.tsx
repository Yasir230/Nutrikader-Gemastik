"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { startSyncEngine } from "@/lib/sync-engine";

export function SyncEngineRegister() {
  const user = useAuth((state) => state.user);

  useEffect(() => {
    if (!user || user.role !== "admin") return undefined;
    return startSyncEngine();
  }, [user]);

  return null;
}
