import { describe, it, expect } from "vitest";
import { evaluateQuoteAgainstPolicy, DEFAULT_SPENDING_POLICY } from "@/lib/policy/engine";
import { getLedgerRecords, addLedgerRecord, getSavingsSummary } from "@/lib/storage/ledger";

describe("Policy Engine & Ledger Unit Tests", () => {
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
});
