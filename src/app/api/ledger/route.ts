import { NextRequest, NextResponse } from "next/server";
import {
  listLedgerFromDb,
  insertLedgerRecordsToDb,
  clearLedgerInDb,
  sanitizeWorkspaceId,
} from "@/lib/db";
import type { LedgerRecord } from "@/lib/storage/ledger";

export async function GET(req: NextRequest) {
  const workspaceId = sanitizeWorkspaceId(req.nextUrl.searchParams.get("workspaceId"));
  const result = await listLedgerFromDb(workspaceId);

  return NextResponse.json({
    success: true,
    workspaceId,
    source: result.source,
    degraded: result.degraded,
    records: result.data ?? [],
    latencyMs: result.latencyMs,
    ...(result.reason ? { reason: result.reason } : {}),
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const workspaceId = sanitizeWorkspaceId(body?.workspaceId);
  const incomingList: LedgerRecord[] = Array.isArray(body?.records)
    ? body.records
    : body?.record
      ? [body.record]
      : body?.id && body?.item
        ? [body]
        : [];

  if (incomingList.length === 0) {
    return NextResponse.json(
      { success: false, error: "Missing ledger record(s) to sync" },
      { status: 400 }
    );
  }

  const result = await insertLedgerRecordsToDb(workspaceId, incomingList);

  return NextResponse.json({
    success: true,
    workspaceId,
    source: result.source,
    degraded: result.degraded,
    syncedIds: result.ok && result.data ? result.data.syncedIds : [],
    latencyMs: result.latencyMs,
    ...(result.reason ? { reason: result.reason } : {}),
  });
}

export async function DELETE(req: NextRequest) {
  const workspaceId = sanitizeWorkspaceId(req.nextUrl.searchParams.get("workspaceId"));
  const result = await clearLedgerInDb(workspaceId);

  return NextResponse.json({
    success: true,
    workspaceId,
    source: result.source,
    degraded: result.degraded,
    latencyMs: result.latencyMs,
    ...(result.reason ? { reason: result.reason } : {}),
  });
}

