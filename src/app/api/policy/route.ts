import { NextRequest, NextResponse } from "next/server";
import {
  getPolicyFromDb,
  upsertPolicyToDb,
  DEFAULT_POLICY_RECORD,
  sanitizeWorkspaceId,
} from "@/lib/db";
import type { UserSpendingPolicy } from "@/lib/policy/engine";

export async function GET(req: NextRequest) {
  const workspaceId = sanitizeWorkspaceId(req.nextUrl.searchParams.get("workspaceId"));
  const result = await getPolicyFromDb(workspaceId);

  return NextResponse.json({
    success: true,
    workspaceId,
    source: result.source,
    degraded: result.degraded,
    policy: result.data,
    latencyMs: result.latencyMs,
    ...(result.reason ? { reason: result.reason } : {}),
  });
}

async function handleSavePolicy(req: NextRequest) {
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
  const rawPolicy = body?.policy ?? body ?? {};

  const normalized: UserSpendingPolicy = {
    maxMarkupTolerance: Math.max(
      0,
      Number.isFinite(Number(rawPolicy.maxMarkupTolerance))
        ? Number(rawPolicy.maxMarkupTolerance)
        : DEFAULT_POLICY_RECORD.maxMarkupTolerance
    ),
    autoApproveThreshold: Math.max(
      0,
      Number.isFinite(Number(rawPolicy.autoApproveThreshold))
        ? Number(rawPolicy.autoApproveThreshold)
        : DEFAULT_POLICY_RECORD.autoApproveThreshold
    ),
    requireVerifiedMerchants:
      typeof rawPolicy.requireVerifiedMerchants === "boolean"
        ? rawPolicy.requireVerifiedMerchants
        : DEFAULT_POLICY_RECORD.requireVerifiedMerchants,
    allowRefurbished:
      typeof rawPolicy.allowRefurbished === "boolean"
        ? rawPolicy.allowRefurbished
        : DEFAULT_POLICY_RECORD.allowRefurbished,
    maxShippingFee: Math.max(
      0,
      Number.isFinite(Number(rawPolicy.maxShippingFee))
        ? Number(rawPolicy.maxShippingFee)
        : DEFAULT_POLICY_RECORD.maxShippingFee
    ),
  };

  const result = await upsertPolicyToDb(workspaceId, normalized);

  return NextResponse.json({
    success: true,
    workspaceId,
    source: result.source,
    degraded: result.degraded,
    policy: normalized,
    latencyMs: result.latencyMs,
    ...(result.reason ? { reason: result.reason } : {}),
  });
}

export async function PUT(req: NextRequest) {
  return handleSavePolicy(req);
}

export async function POST(req: NextRequest) {
  return handleSavePolicy(req);
}

