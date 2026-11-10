/**
 * Universal Database Client & Resilient Hybrid Persistence Layer
 * Primary: Neon Serverless Postgres (@neondatabase/serverless)
 * Automatic Fallback: Signals API/client layer to use browser localStorage on missing config, timeouts, or errors.
 */
import { neon } from "@neondatabase/serverless";
import type { LedgerRecord } from "@/lib/storage/ledger";
import type { UserSpendingPolicy } from "@/lib/policy/engine";

const DEFAULT_DB_TIMEOUT_MS = 3500;
const CIRCUIT_COOLDOWN_MS = 30_000;

let circuitOpenUntil = 0;
let lastCircuitReason: string | null = null;
let schemaReadyPromise: Promise<boolean> | null = null;
let warnedMissingDbUrl = false;

export const DEFAULT_POLICY_RECORD: UserSpendingPolicy = {
  maxMarkupTolerance: 0.0,
  autoApproveThreshold: 50.0,
  requireVerifiedMerchants: true,
  allowRefurbished: true,
  maxShippingFee: 15.0,
};

export interface DbOperationResult<T> {
  ok: boolean;
  source: "neon" | "fallback";
  degraded: boolean;
  data: T | null;
  reason?: string;
  latencyMs?: number;
}

export function getDbClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (!warnedMissingDbUrl) {
      console.warn("DATABASE_URL not set. Running in demo memory mode.");
      warnedMissingDbUrl = true;
    }
    return null;
  }
  return neon(url);
}

export function isDbCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

export function resetDbCircuitBreaker(): void {
  circuitOpenUntil = 0;
  lastCircuitReason = null;
  schemaReadyPromise = null;
}

function tripCircuit(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err || "Unknown Neon DB error");
  circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  lastCircuitReason = message;
  schemaReadyPromise = null;
  console.warn(`[NeonDB Fallback] Circuit breaker opened for ${CIRCUIT_COOLDOWN_MS}ms: ${message}`);
  return message;
}

export function sanitizeWorkspaceId(raw?: string | null): string {
  const cleaned = (raw || "default").trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 64) : "default";
}

export async function runQuery(sqlText: string, params: any[] = []) {
  const sql = getDbClient();
  if (!sql) return { simulated: true, rows: [] };
  return await sql(sqlText, params, {
    fetchOptions: { signal: AbortSignal.timeout(DEFAULT_DB_TIMEOUT_MS) },
  });
}

async function execNeonSql(sqlText: string, params: any[] = [], timeoutMs = DEFAULT_DB_TIMEOUT_MS) {
  const sql = getDbClient();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (isDbCircuitOpen()) {
    throw new Error(`Neon circuit open (${lastCircuitReason || "cooldown active"})`);
  }
  return await sql(sqlText, params, {
    fetchOptions: { signal: AbortSignal.timeout(timeoutMs) },
  });
}

export async function ensureDbSchema(): Promise<boolean> {
  const sql = getDbClient();
  if (!sql || isDbCircuitOpen()) return false;

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      try {
        await execNeonSql(`
          CREATE TABLE IF NOT EXISTS ledger_transactions (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL DEFAULT 'default',
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            prompt TEXT NOT NULL,
            item TEXT NOT NULL,
            merchant TEXT NOT NULL,
            paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
            money_saved NUMERIC(12, 2) NOT NULL DEFAULT 0,
            paypal_order_id TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'BLOCKED_OVERCHARGE', 'PENDING_APPROVAL')),
            receipt_url TEXT,
            agent_audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await execNeonSql(`
          CREATE INDEX IF NOT EXISTS idx_ledger_workspace_ts
          ON ledger_transactions (workspace_id, timestamp DESC)
        `);
        await execNeonSql(`
          CREATE TABLE IF NOT EXISTS spending_policies (
            workspace_id TEXT PRIMARY KEY,
            max_markup_tolerance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
            auto_approve_threshold NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
            require_verified_merchants BOOLEAN NOT NULL DEFAULT TRUE,
            allow_refurbished BOOLEAN NOT NULL DEFAULT TRUE,
            max_shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
            ledger_cleared BOOLEAN NOT NULL DEFAULT FALSE,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        return true;
      } catch (err) {
        tripCircuit(err);
        return false;
      }
    })();
  }

  return schemaReadyPromise;
}

function mapLedgerRow(row: Record<string, any>): LedgerRecord {
  const rawTrail = row.agent_audit_trail;
  let auditTrail: string[] = [];
  if (Array.isArray(rawTrail)) {
    auditTrail = rawTrail.map(String);
  } else if (typeof rawTrail === "string") {
    try {
      const parsed = JSON.parse(rawTrail);
      if (Array.isArray(parsed)) auditTrail = parsed.map(String);
    } catch {
      auditTrail = [];
    }
  }

  return {
    id: String(row.id),
    timestamp: new Date(row.timestamp).toISOString(),
    prompt: String(row.prompt || ""),
    item: String(row.item || ""),
    merchant: String(row.merchant || ""),
    paidAmount: Number(row.paid_amount ?? 0),
    moneySaved: Number(row.money_saved ?? 0),
    paypalOrderId: String(row.paypal_order_id || ""),
    status: (row.status as LedgerRecord["status"]) || "COMPLETED",
    receiptUrl: row.receipt_url ? String(row.receipt_url) : undefined,
    agentAuditTrail: auditTrail,
  };
}

function buildStarterTransactions(workspaceId: string): LedgerRecord[] {
  const suffix = workspaceId === "default" ? "" : `_${workspaceId}`;
  return [
    {
      id: `txn_init_001${suffix}`,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      prompt: "Developer laptop under $900 with 16GB RAM",
      item: "Dell XPS 13 Developer Edition",
      merchant: "Official Dell Direct (PayPal Verified)",
      paidAmount: 849.0,
      moneySaved: 100.0,
      paypalOrderId: "8RT447164L771841B",
      status: "COMPLETED",
      receiptUrl: "https://www.sandbox.paypal.com/checkoutnow?token=8RT447164L771841B",
      agentAuditTrail: [
        "Sourcing Agent: Found 3 candidate laptop quotes across Dell and secondary suppliers.",
        "Auditor Agent: Caught unauthorized $100 rush surcharge from CloudTech Supply ($949 total).",
        "Auditor Agent: Halted transaction and routed to Official Dell Direct at $849.",
        "Settlement Agent: Captured PayPal Sandbox Order #8RT447164L771841B in 284ms.",
      ],
    },
    {
      id: `txn_init_002${suffix}`,
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      prompt: "Noise cancelling wireless headphones under $280",
      item: "Sony WH-1000XM5 ANC Headphones",
      merchant: "Official Audio Direct (PayPal Verified)",
      paidAmount: 249.0,
      moneySaved: 66.0,
      paypalOrderId: "6KL01147A83836825",
      status: "COMPLETED",
      receiptUrl: "https://www.sandbox.paypal.com/checkoutnow?token=6KL01147A83836825",
      agentAuditTrail: [
        "Sourcing Agent: Extracted audio category; ingested 3 vendor quotes.",
        "Auditor Agent: Detected $45 hidden fee in FastTech quote ($315 vs $280 budget).",
        "Auditor Agent: Switched to verified Sony direct vendor ($249).",
        "Settlement Agent: Captured PayPal Sandbox Order #6KL01147A83836825 in 1570ms.",
      ],
    },
  ];
}

export async function listLedgerFromDb(
  rawWorkspaceId?: string | null
): Promise<DbOperationResult<LedgerRecord[]>> {
  const t0 = performance.now();
  const workspaceId = sanitizeWorkspaceId(rawWorkspaceId);

  if (!getDbClient()) {
    return {
      ok: false,
      source: "fallback",
      degraded: false,
      data: null,
      reason: "DATABASE_URL not configured",
    };
  }
  if (isDbCircuitOpen()) {
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason: lastCircuitReason || "Circuit breaker cooldown active",
    };
  }

  try {
    const schemaOk = await ensureDbSchema();
    if (!schemaOk) {
      return {
        ok: false,
        source: "fallback",
        degraded: true,
        data: null,
        reason: lastCircuitReason || "Schema initialization failed",
      };
    }

    const policyRows = (await execNeonSql(
      `SELECT ledger_cleared FROM spending_policies WHERE workspace_id = $1 LIMIT 1`,
      [workspaceId]
    )) as Record<string, any>[];
    const ledgerCleared = Boolean(policyRows[0]?.ledger_cleared);

    let rows = (await execNeonSql(
      `SELECT id, workspace_id, timestamp, prompt, item, merchant, paid_amount, money_saved, paypal_order_id, status, receipt_url, agent_audit_trail
       FROM ledger_transactions
       WHERE workspace_id = $1
       ORDER BY timestamp DESC
       LIMIT 200`,
      [workspaceId]
    )) as Record<string, any>[];

    // Bootstrap showcase records on brand-new workspaces once so Neon reflects realistic telemetry
    if (rows.length === 0 && !ledgerCleared) {
      const seeds = buildStarterTransactions(workspaceId);
      for (const seed of seeds) {
        await execNeonSql(
          `INSERT INTO ledger_transactions (id, workspace_id, timestamp, prompt, item, merchant, paid_amount, money_saved, paypal_order_id, status, receipt_url, agent_audit_trail)
           VALUES ($1, $2, $3::timestamptz, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [
            seed.id,
            workspaceId,
            seed.timestamp,
            seed.prompt,
            seed.item,
            seed.merchant,
            seed.paidAmount,
            seed.moneySaved,
            seed.paypalOrderId,
            seed.status,
            seed.receiptUrl || null,
            JSON.stringify(seed.agentAuditTrail || []),
          ]
        );
      }
      rows = (await execNeonSql(
        `SELECT id, workspace_id, timestamp, prompt, item, merchant, paid_amount, money_saved, paypal_order_id, status, receipt_url, agent_audit_trail
         FROM ledger_transactions
         WHERE workspace_id = $1
         ORDER BY timestamp DESC
         LIMIT 200`,
        [workspaceId]
      )) as Record<string, any>[];
    }

    return {
      ok: true,
      source: "neon",
      degraded: false,
      data: rows.map(mapLedgerRow),
      latencyMs: Math.round(performance.now() - t0),
    };
  } catch (err) {
    const reason = tripCircuit(err);
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason,
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

export async function insertLedgerRecordsToDb(
  rawWorkspaceId: string | null | undefined,
  records: LedgerRecord[]
): Promise<DbOperationResult<{ syncedIds: string[] }>> {
  const t0 = performance.now();
  const workspaceId = sanitizeWorkspaceId(rawWorkspaceId);

  if (!getDbClient()) {
    return {
      ok: false,
      source: "fallback",
      degraded: false,
      data: null,
      reason: "DATABASE_URL not configured",
    };
  }
  if (isDbCircuitOpen()) {
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason: lastCircuitReason || "Circuit breaker cooldown active",
    };
  }

  try {
    const schemaOk = await ensureDbSchema();
    if (!schemaOk) {
      return {
        ok: false,
        source: "fallback",
        degraded: true,
        data: null,
        reason: lastCircuitReason || "Schema initialization failed",
      };
    }

    const syncedIds: string[] = [];
    for (const r of records) {
      if (!r?.id || !r?.item || !r?.merchant) continue;
      const status =
        r.status === "COMPLETED" || r.status === "BLOCKED_OVERCHARGE" || r.status === "PENDING_APPROVAL"
          ? r.status
          : "COMPLETED";
      await execNeonSql(
        `INSERT INTO ledger_transactions (id, workspace_id, timestamp, prompt, item, merchant, paid_amount, money_saved, paypal_order_id, status, receipt_url, agent_audit_trail)
         VALUES ($1, $2, $3::timestamptz, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [
          String(r.id).slice(0, 128),
          workspaceId,
          r.timestamp || new Date().toISOString(),
          String(r.prompt || "").slice(0, 500),
          String(r.item).slice(0, 255),
          String(r.merchant).slice(0, 255),
          Number(r.paidAmount || 0),
          Number(r.moneySaved || 0),
          String(r.paypalOrderId || "N/A").slice(0, 128),
          status,
          r.receiptUrl ? String(r.receiptUrl).slice(0, 512) : null,
          JSON.stringify(Array.isArray(r.agentAuditTrail) ? r.agentAuditTrail : []),
        ]
      );
      syncedIds.push(r.id);
    }

    // Re-open ledger if previously cleared
    await execNeonSql(
      `INSERT INTO spending_policies (workspace_id, ledger_cleared)
       VALUES ($1, FALSE)
       ON CONFLICT (workspace_id) DO UPDATE SET ledger_cleared = FALSE, updated_at = NOW()`,
      [workspaceId]
    );

    return {
      ok: true,
      source: "neon",
      degraded: false,
      data: { syncedIds },
      latencyMs: Math.round(performance.now() - t0),
    };
  } catch (err) {
    const reason = tripCircuit(err);
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason,
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

export async function clearLedgerInDb(
  rawWorkspaceId?: string | null
): Promise<DbOperationResult<{ cleared: boolean }>> {
  const t0 = performance.now();
  const workspaceId = sanitizeWorkspaceId(rawWorkspaceId);

  if (!getDbClient()) {
    return {
      ok: false,
      source: "fallback",
      degraded: false,
      data: null,
      reason: "DATABASE_URL not configured",
    };
  }
  if (isDbCircuitOpen()) {
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason: lastCircuitReason || "Circuit breaker cooldown active",
    };
  }

  try {
    const schemaOk = await ensureDbSchema();
    if (!schemaOk) {
      return {
        ok: false,
        source: "fallback",
        degraded: true,
        data: null,
        reason: lastCircuitReason || "Schema initialization failed",
      };
    }

    await execNeonSql(`DELETE FROM ledger_transactions WHERE workspace_id = $1`, [workspaceId]);
    await execNeonSql(
      `INSERT INTO spending_policies (workspace_id, ledger_cleared, updated_at)
       VALUES ($1, TRUE, NOW())
       ON CONFLICT (workspace_id) DO UPDATE SET ledger_cleared = TRUE, updated_at = NOW()`,
      [workspaceId]
    );

    return {
      ok: true,
      source: "neon",
      degraded: false,
      data: { cleared: true },
      latencyMs: Math.round(performance.now() - t0),
    };
  } catch (err) {
    const reason = tripCircuit(err);
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason,
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

export async function getPolicyFromDb(
  rawWorkspaceId?: string | null
): Promise<DbOperationResult<UserSpendingPolicy>> {
  const t0 = performance.now();
  const workspaceId = sanitizeWorkspaceId(rawWorkspaceId);

  if (!getDbClient()) {
    return {
      ok: false,
      source: "fallback",
      degraded: false,
      data: null,
      reason: "DATABASE_URL not configured",
    };
  }
  if (isDbCircuitOpen()) {
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason: lastCircuitReason || "Circuit breaker cooldown active",
    };
  }

  try {
    const schemaOk = await ensureDbSchema();
    if (!schemaOk) {
      return {
        ok: false,
        source: "fallback",
        degraded: true,
        data: null,
        reason: lastCircuitReason || "Schema initialization failed",
      };
    }

    const rows = (await execNeonSql(
      `SELECT max_markup_tolerance, auto_approve_threshold, require_verified_merchants, allow_refurbished, max_shipping_fee
       FROM spending_policies
       WHERE workspace_id = $1
       LIMIT 1`,
      [workspaceId]
    )) as Record<string, any>[];

    if (rows.length === 0) {
      return {
        ok: true,
        source: "neon",
        degraded: false,
        data: { ...DEFAULT_POLICY_RECORD },
        latencyMs: Math.round(performance.now() - t0),
      };
    }

    const r = rows[0];
    return {
      ok: true,
      source: "neon",
      degraded: false,
      data: {
        maxMarkupTolerance: Number(r.max_markup_tolerance ?? DEFAULT_POLICY_RECORD.maxMarkupTolerance),
        autoApproveThreshold: Number(r.auto_approve_threshold ?? DEFAULT_POLICY_RECORD.autoApproveThreshold),
        requireVerifiedMerchants: Boolean(r.require_verified_merchants ?? DEFAULT_POLICY_RECORD.requireVerifiedMerchants),
        allowRefurbished: Boolean(r.allow_refurbished ?? DEFAULT_POLICY_RECORD.allowRefurbished),
        maxShippingFee: Number(r.max_shipping_fee ?? DEFAULT_POLICY_RECORD.maxShippingFee),
      },
      latencyMs: Math.round(performance.now() - t0),
    };
  } catch (err) {
    const reason = tripCircuit(err);
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason,
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

export async function upsertPolicyToDb(
  rawWorkspaceId: string | null | undefined,
  policy: UserSpendingPolicy
): Promise<DbOperationResult<UserSpendingPolicy>> {
  const t0 = performance.now();
  const workspaceId = sanitizeWorkspaceId(rawWorkspaceId);

  if (!getDbClient()) {
    return {
      ok: false,
      source: "fallback",
      degraded: false,
      data: null,
      reason: "DATABASE_URL not configured",
    };
  }
  if (isDbCircuitOpen()) {
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason: lastCircuitReason || "Circuit breaker cooldown active",
    };
  }

  try {
    const schemaOk = await ensureDbSchema();
    if (!schemaOk) {
      return {
        ok: false,
        source: "fallback",
        degraded: true,
        data: null,
        reason: lastCircuitReason || "Schema initialization failed",
      };
    }

    await execNeonSql(
      `INSERT INTO spending_policies (workspace_id, max_markup_tolerance, auto_approve_threshold, require_verified_merchants, allow_refurbished, max_shipping_fee, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (workspace_id) DO UPDATE SET
         max_markup_tolerance = EXCLUDED.max_markup_tolerance,
         auto_approve_threshold = EXCLUDED.auto_approve_threshold,
         require_verified_merchants = EXCLUDED.require_verified_merchants,
         allow_refurbished = EXCLUDED.allow_refurbished,
         max_shipping_fee = EXCLUDED.max_shipping_fee,
         updated_at = NOW()`,
      [
        workspaceId,
        Number(policy.maxMarkupTolerance),
        Number(policy.autoApproveThreshold),
        Boolean(policy.requireVerifiedMerchants),
        Boolean(policy.allowRefurbished),
        Number(policy.maxShippingFee),
      ]
    );

    return {
      ok: true,
      source: "neon",
      degraded: false,
      data: policy,
      latencyMs: Math.round(performance.now() - t0),
    };
  } catch (err) {
    const reason = tripCircuit(err);
    return {
      ok: false,
      source: "fallback",
      degraded: true,
      data: null,
      reason,
      latencyMs: Math.round(performance.now() - t0),
    };
  }
}

export async function checkDbHealth(): Promise<{
  status: "connected_neon_postgres" | "fallback_localstorage";
  configured: boolean;
  degraded: boolean;
  latencyMs?: number;
  reason?: string;
}> {
  const t0 = performance.now();
  if (!getDbClient()) {
    return {
      status: "fallback_localstorage",
      configured: false,
      degraded: false,
      reason: "DATABASE_URL not configured",
    };
  }
  if (isDbCircuitOpen()) {
    return {
      status: "fallback_localstorage",
      configured: true,
      degraded: true,
      reason: lastCircuitReason || "Circuit breaker open",
    };
  }

  try {
    await execNeonSql("SELECT 1 AS ok", [], 2500);
    return {
      status: "connected_neon_postgres",
      configured: true,
      degraded: false,
      latencyMs: Math.round(performance.now() - t0),
    };
  } catch (err) {
    const reason = tripCircuit(err);
    return {
      status: "fallback_localstorage",
      configured: true,
      degraded: true,
      latencyMs: Math.round(performance.now() - t0),
      reason,
    };
  }
}
