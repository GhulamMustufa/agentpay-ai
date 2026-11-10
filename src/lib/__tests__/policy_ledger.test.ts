import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { evaluateQuoteAgainstPolicy, DEFAULT_SPENDING_POLICY } from "@/lib/policy/engine";
import { PolicyAuditorAgent } from "@/lib/agents/auditor-agent";
import {
  getLedgerRecords,
  getSavingsSummary,
  saveLedgerRecordWithSync,
  hydrateLedgerWithNeonFallback,
  clearLedgerWithSync,
} from "@/lib/storage/ledger";

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  };
}

describe("Policy Engine & Ledger Unit Tests", () => {
  const origWindow = (globalThis as any).window;
  const origLocalStorage = (globalThis as any).localStorage;
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    const mem = createMemoryStorage();
    (globalThis as any).window = {};
    (globalThis as any).localStorage = mem;
  });

  afterEach(() => {
    (globalThis as any).window = origWindow;
    (globalThis as any).localStorage = origLocalStorage;
    globalThis.fetch = origFetch;
  });

  it("evaluates compliant quotes under budget", () => {
    const quote = {
      vendor: "Official Store (PayPal Verified)",
      item: "Test Laptop",
      price: 849.0,
      markup: 0,
      isCompliant: true,
    };
    const res = evaluateQuoteAgainstPolicy(quote, 900, DEFAULT_SPENDING_POLICY);
    expect(res.isCompliant).toBe(true);
    expect(res.violations).toHaveLength(0);
    expect(res.requiresHumanApproval).toBe(true); // price > 50 auto-approve threshold
  });

  it("halts quote when markup exceeds policy tolerance", () => {
    const quote = {
      vendor: "Sneaky Vendor",
      item: "Test Laptop",
      price: 949.0,
      markup: 100.0,
      markupReason: "Unauthorized Rush Fee",
    };
    const res = evaluateQuoteAgainstPolicy(quote, 900, {
      ...DEFAULT_SPENDING_POLICY,
      maxMarkupTolerance: 0,
    });
    expect(res.isCompliant).toBe(false);
    expect(res.violations.length).toBeGreaterThanOrEqual(1);
  });

  it("calculates ledger savings summary correctly", () => {
    const summary = getSavingsSummary();
    expect(summary.totalSaved).toBeGreaterThanOrEqual(0);
    expect(summary.transactionCount).toBeGreaterThanOrEqual(1);
  });

  it("falls back to localStorage queue on Neon failure and auto-syncs on recovery", async () => {
    // Step 1: Simulate Neon unavailable during checkout
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Neon network offline")) as any;

    const savedOffline = await saveLedgerRecordWithSync({
      prompt: "Developer monitor under $400",
      item: "Dell UltraSharp 27",
      merchant: "Official Dell Direct",
      paidAmount: 349,
      moneySaved: 50,
      paypalOrderId: "PAYPAL-OFFLINE-1",
      status: "COMPLETED",
      agentAuditTrail: ["Saved locally while offline"],
    });

    expect(savedOffline.storageMode).toBe("localstorage_fallback");
    expect(getLedgerRecords().some((r) => r.id === savedOffline.ledgerRecord.id)).toBe(true);

    // Step 2: Simulate Neon Postgres recovery
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.startsWith("/api/ledger") && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        return {
          ok: true,
          json: async () => ({
            success: true,
            source: "neon",
            syncedIds: body.records.map((r: any) => r.id),
          }),
        } as any;
      }
      return {
        ok: true,
        json: async () => ({
          success: true,
          source: "neon",
          records: [savedOffline.ledgerRecord],
        }),
      } as any;
    }) as any;

    const hydrated = await hydrateLedgerWithNeonFallback();
    expect(hydrated.storageMode).toBe("neon");
    expect(hydrated.syncedPendingCount).toBe(1);
    expect(hydrated.records.some((r) => r.id === savedOffline.ledgerRecord.id)).toBe(true);
  });

  it("queues ledger clear locally when Neon is unreachable and replays delete on reconnect", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline")) as any;
    const offlineClear = await clearLedgerWithSync();
    expect(offlineClear.storageMode).toBe("localstorage_fallback");
    expect(getLedgerRecords()).toHaveLength(0);

    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push(`${init?.method || "GET"} ${url}`);
      return {
        ok: true,
        json: async () => ({
          success: true,
          source: "neon",
          records: [],
        }),
      } as any;
    }) as any;

    const recovered = await hydrateLedgerWithNeonFallback();
    expect(recovered.storageMode).toBe("neon");
    expect(recovered.records).toHaveLength(0);
    expect(calls.some((c) => c.startsWith("DELETE /api/ledger"))).toBe(true);
  });

  it("fails closed when all merchant quotes violate spending policy", () => {
    const auditor = new PolicyAuditorAgent();
    const res = auditor.auditQuotes(
      [
        {
          vendor: "Expensive Store",
          item: "Laptop",
          specs: "16GB",
          price: 950,
          markup: 50,
          markupReason: "Rush fee",
          isCompliant: false,
          warranty: "1-Yr",
          matchScore: 0.8,
        },
        {
          vendor: "Refurb Outlet",
          item: "Refurb Laptop",
          specs: "16GB",
          price: 750,
          markup: 0,
          isCompliant: true,
          warranty: "90-Day",
          matchScore: 0.85,
        },
      ],
      700, // tighter than all quotes
      DEFAULT_SPENDING_POLICY
    );
    expect(res.approvedQuote).toBeNull();
    expect(res.requiresHumanApproval).toBe(true);
    expect(res.auditLogs.some((l) => l.includes("Financial Firewall Triggered"))).toBe(true);
  });

  it("flags excessive shipping fees and unverified merchant names", () => {
    const res = evaluateQuoteAgainstPolicy(
      {
        vendor: "Unverified Reseller Outlet",
        item: "Studio Monitor",
        price: 340,
        markup: 0,
        shippingFee: 29.99,
        isCompliant: true,
      },
      400,
      DEFAULT_SPENDING_POLICY
    );
    expect(res.isCompliant).toBe(false);
    expect(res.violations.some((v) => v.includes("shipping exceeds"))).toBe(true);
    expect(res.violations).toContain("Not PayPal-verified");
  });
});
