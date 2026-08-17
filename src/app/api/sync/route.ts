import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createBalita,
  deleteBalita,
  getBalitaAny,
  restoreBalita,
  updateBalita,
} from "@/lib/server/balita-repository";
import { requireRole } from "@/lib/server/session";
import type {
  SyncOperation,
  SyncResolution,
  SyncResultItem,
} from "@/lib/sync/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 5242880) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const syncRequestSchema = z.object({
      operations: z.array(
        z.object({
          id: z.string(),
          entity: z.string(),
          entityId: z.string(),
          operation: z.enum(["CREATE", "UPDATE", "DELETE"]),
          payload: z.any().optional(),
          baseVersion: z.number().optional(),
        }).passthrough()
      ).optional(),
      resolutions: z.array(
        z.object({
          conflictId: z.string(),
          entityId: z.string(),
          decision: z.enum(["USE_SERVER", "USE_LOCAL"]),
          localPayload: z.any().optional(),
          serverVersion: z.number().optional(),
        }).passthrough()
      ).optional(),
      resolution: z.enum(["server", "local"]).optional(),
      conflict: z.object({
        entityId: z.string(),
        operation: z.enum(["CREATE", "UPDATE", "DELETE"]),
        serverVersion: z.number().optional(),
        localPayload: z.any().optional(),
      }).passthrough().optional(),
    });

    const rawBody = await request.json();
    const parseResult = syncRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const body = parseResult.data;

    const results: SyncResultItem[] = [];

    // Backward-compatible single conflict-resolution shape.
    if (body.resolution && body.conflict) {
      if (body.resolution === "server") {
        const current = await getBalitaAny(body.conflict.entityId);
        if (!current) {
          return NextResponse.json(
            { error: "Balita tidak ditemukan." },
            { status: 404 },
          );
        }
        return NextResponse.json({ resolved: true, action: "server", data: current });
      }

      const local = body.conflict.localPayload;
      const entityId = body.conflict.entityId;
      const serverVersion = body.conflict.serverVersion;

      if (!local || !entityId || typeof serverVersion !== "number" || !Number.isInteger(serverVersion)) {
        return NextResponse.json(
          { error: "Data resolusi lokal tidak lengkap." },
          { status: 400 },
        );
      }

      if (body.conflict.operation === "DELETE") {
        const result = await deleteBalita(entityId, auth.user.id, serverVersion);
        if (result.conflict) {
          return NextResponse.json(
            { error: "CONFLICT", current: result.current },
            { status: 409 },
          );
        }
        return NextResponse.json({ resolved: true, data: result.data });
      }

      const result = await updateBalita(
        { ...local, id: entityId },
        auth.user.id,
        serverVersion,
      );
      if (result.conflict) {
        return NextResponse.json(
          { error: "CONFLICT", current: result.current },
          { status: 409 },
        );
      }
      return NextResponse.json({ resolved: true, data: result.data });
    }

    // Preferred batch conflict-resolution shape.
    for (const resolution of body.resolutions ?? []) {
      if (resolution.decision === "USE_SERVER") {
        const current = await getBalitaAny(resolution.entityId as string);
        if (current) {
          results.push({ id: resolution.conflictId as string, status: "applied", data: current });
        } else {
          results.push({
            id: resolution.conflictId as string,
            status: "rejected",
            error: "Balita tidak ditemukan.",
          });
        }
        continue;
      }

      const local = resolution.localPayload;
      const serverVersion = resolution.serverVersion;
      if (!local || typeof serverVersion !== "number" || !Number.isInteger(serverVersion)) {
        results.push({
          id: resolution.conflictId as string,
          status: "rejected",
          error: "Data resolusi lokal tidak lengkap.",
        });
        continue;
      }

      const result = local.deletedAt
        ? await restoreBalita({ ...local, id: resolution.entityId as string }, auth.user.id, serverVersion)
        : await updateBalita({ ...local, id: resolution.entityId as string }, auth.user.id, serverVersion);

      if (result.conflict) {
        results.push({
          id: resolution.conflictId as string,
          status: "conflict",
          data: result.current,
        });
      } else if (result.data) {
        results.push({
          id: resolution.conflictId as string,
          status: "applied",
          data: result.data,
        });
      } else {
        results.push({
          id: resolution.conflictId as string,
          status: "rejected",
          error: "Resolusi tidak menghasilkan data.",
        });
      }
    }

    const operations = body.operations ?? [];
    if (!Array.isArray(operations) || operations.length > 50) {
      return NextResponse.json({ error: "Batch sync tidak valid." }, { status: 400 });
    }

    for (const op of operations) {
      if (op.entity !== "balita" || !op.id || !op.entityId) {
        results.push({
          id: op.id as string,
          status: "rejected",
          error: "Operasi tidak valid.",
        });
        continue;
      }

      if (op.operation === "CREATE" && op.payload) {
        try {
          const data = await createBalita(
            { ...op.payload, id: op.entityId as string },
            auth.user.id,
          );
          results.push({ id: op.id as string, status: "applied", data });
        } catch {
          results.push({
            id: op.id as string,
            status: "conflict",
            data: await getBalitaAny(op.entityId as string),
          });
        }
        continue;
      }

      if (op.operation === "UPDATE" && op.payload) {
        const result = await updateBalita(
          op.payload,
          auth.user.id,
          op.baseVersion as number,
        );
        if (result.conflict) {
          results.push({
            id: op.id as string,
            status: "conflict",
            data: result.current,
          });
        } else if (result.data) {
          results.push({
            id: op.id as string,
            status: "applied",
            data: result.data,
          });
        } else {
          results.push({
            id: op.id as string,
            status: "rejected",
            error: "Update tidak menghasilkan data.",
          });
        }
        continue;
      }

      if (op.operation === "DELETE") {
        const result = await deleteBalita(
          op.entityId as string,
          auth.user.id,
          op.baseVersion as number,
        );
        results.push(
          result.conflict
            ? { id: op.id as string, status: "conflict", data: result.current }
            : { id: op.id as string, status: "applied", data: result.data },
        );
        continue;
      }

      results.push({
        id: op.id as string,
        status: "rejected",
        error: "Payload operasi tidak lengkap.",
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("POST /api/sync failed", error);
    return NextResponse.json(
      { error: "Sinkronisasi gagal." },
      { status: 503 },
    );
  }
}
