import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  runQuery,
  getDbClient,
  listLedgerFromDb,
  getPolicyFromDb,
  upsertPolicyToDb,
  isDbCircuitOpen,
  resetDbCircuitBreaker,
  sanitizeWorkspaceId,
  DEFAULT_POLICY_RECORD,
} from "../db";

describe("Database Client Unit Tests", () => {
  const originalDbUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    resetDbCircuitBreaker();
  });

  afterEach(() => {
    if (originalDbUrl) {
      process.env.DATABASE_URL = originalDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
    resetDbCircuitBreaker();
  });

  it("should return simulated fallback when DATABASE_URL is not set", async () => {
    delete process.env.DATABASE_URL;
    const client = getDbClient();
    expect(client).toBeNull();

    const queryResult = (await runQuery("SELECT * FROM users")) as {
      simulated: boolean;
      rows: unknown[];
    };
    expect(queryResult.simulated).toBe(true);
    expect(queryResult.rows).toEqual([]);
  });

  it("returns clean fallback signal when DATABASE_URL is unset for ledger and policy", async () => {
    delete process.env.DATABASE_URL;
    const ledgerRes = await listLedgerFromDb("ws_test_1");
    expect(ledgerRes.ok).toBe(false);
    expect(ledgerRes.source).toBe("fallback");
    expect(ledgerRes.degraded).toBe(false);

    const policyRes = await getPolicyFromDb("ws_test_1");
    expect(policyRes.ok).toBe(false);
    expect(policyRes.source).toBe("fallback");
  });

  it("trips circuit breaker and fails fast on unreachable Neon endpoint", async () => {
    process.env.DATABASE_URL = "postgresql://invalid:invalid@127.0.0.1:1/neondb";
    const firstAttempt = await upsertPolicyToDb("ws_fail", DEFAULT_POLICY_RECORD);
    expect(firstAttempt.ok).toBe(false);
    expect(firstAttempt.source).toBe("fallback");
    expect(firstAttempt.degraded).toBe(true);
    expect(isDbCircuitOpen()).toBe(true);

    // Second call must short-circuit immediately without network stall
    const t0 = performance.now();
    const secondAttempt = await listLedgerFromDb("ws_fail");
    const elapsed = performance.now() - t0;
    expect(secondAttempt.ok).toBe(false);
    expect(secondAttempt.degraded).toBe(true);
    expect(elapsed).toBeLessThan(50);
  });

  it("sanitizes workspace identifiers safely", () => {
    expect(sanitizeWorkspaceId("ws_Judge-123")).toBe("ws_Judge-123");
    expect(sanitizeWorkspaceId("'; DROP TABLE ledger_transactions;--")).toBe("DROPTABLEledger_transactions--");
    expect(sanitizeWorkspaceId("")).toBe("default");
  });
});
