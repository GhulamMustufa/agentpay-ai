/**
 * User Spending Policy Engine & Guardrail Evaluator
 * Enforces customizable rules: markup tolerance, merchant verification,
 * auto-approve thresholds, and condition restrictions.
 *
 * Hybrid Persistence Strategy:
 *   1. Instant synchronous read/write via localStorage
 *   2. Read-through / write-through sync with Neon Serverless Postgres (/api/policy)
 *   3. Queues offline policy edits cleanly for auto-sync when Neon recovers
 */

import { getOrCreateWorkspaceId, type PersistenceMode } from "@/lib/storage/ledger";

export interface UserSpendingPolicy {
  maxMarkupTolerance: number;      // e.g. 0.00 (Zero unapproved markup tolerance)
  autoApproveThreshold: number;    // e.g. 50.00 (Orders <= $50 auto-approve, > $50 require 1-click confirmation)
  requireVerifiedMerchants: boolean; // e.g. true (Seller must be PayPal Verified)
  allowRefurbished: boolean;       // e.g. true (Allow certified refurb for cost savings)
  maxShippingFee: number;          // e.g. 15.00 (Flag shipping surcharges above this)
}

export const DEFAULT_SPENDING_POLICY: UserSpendingPolicy = {
  maxMarkupTolerance: 0.0,
  autoApproveThreshold: 50.0,
  requireVerifiedMerchants: true,
  allowRefurbished: true,
  maxShippingFee: 15.0,
};

export interface PolicyEvaluationResult {
  isCompliant: boolean;
  violations: string[];
  requiresHumanApproval: boolean;
  reason: string;
}

/**
 * Evaluates any vendor quote against the active user spending policy and budget cap.
 */
export function evaluateQuoteAgainstPolicy(
  quote: {
    vendor: string;
    item: string;
    price: number;
    markup: number;
    markupReason?: string;
    shippingFee?: number;
    isCompliant?: boolean;
  },
  budgetCap: number,
  policy: UserSpendingPolicy = DEFAULT_SPENDING_POLICY
): PolicyEvaluationResult {
  const violations: string[] = [];

  // Rule 1: Strict Budget Cap
  if (quote.price > budgetCap) {
    violations.push(
      `$${(quote.price - budgetCap).toFixed(0)} over your budget`
    );
  }

  // Rule 2: Unapproved Markup Tolerance
  if (quote.markup > policy.maxMarkupTolerance) {
    violations.push(
      `$${quote.markup.toFixed(0)} hidden fee (${quote.markupReason || "markup"})`
    );
  }

  // Rule 2b: Explicit Shipping Cap Enforcement
  if (typeof quote.shippingFee === "number" && Number.isFinite(quote.shippingFee) && quote.shippingFee > policy.maxShippingFee) {
    violations.push(
      `$${quote.shippingFee.toFixed(2)} shipping exceeds $${policy.maxShippingFee.toFixed(2)} cap`
    );
  }

  // Rule 3: Merchant Verification
  const lowerVendor = quote.vendor.toLowerCase();
  const isVerified =
    lowerVendor.includes("verified") ||
    lowerVendor.includes("official") ||
    lowerVendor.includes("authorized") ||
    lowerVendor.includes("certified");
  const isSuspiciousMerchant =
    lowerVendor.includes("unverified") || lowerVendor.includes("unknown") || lowerVendor.includes("sketchy");
  if (policy.requireVerifiedMerchants && (isSuspiciousMerchant || (!isVerified && !quote.isCompliant))) {
    violations.push("Not PayPal-verified");
  }

  // Rule 4: Refurbished Policy
  const isRefurb = quote.item.toLowerCase().includes("refurb") || quote.vendor.toLowerCase().includes("refurb");
  if (!policy.allowRefurbished && isRefurb) {
    violations.push("Refurbished item (blocked by rule)");
  }

  const isCompliant = violations.length === 0;

  // Rule 5: Auto-Approve Threshold check
  // Even if compliant, transactions over autoApproveThreshold require 1-click confirmation
  const requiresHumanApproval = !isCompliant || quote.price > policy.autoApproveThreshold;

  return {
    isCompliant,
    violations,
    requiresHumanApproval,
    reason: isCompliant
      ? quote.price <= policy.autoApproveThreshold
        ? "Within budget and safe to auto-approve."
        : `Within budget ($${(budgetCap - quote.price).toFixed(2)} under limit). Awaiting 1-click approval.`
      : violations.join(", "),
  };
}

/**
 * Storage helpers for browser persistence
 */
const POLICY_STORAGE_KEY = "agentpay_spending_policy";
const PENDING_POLICY_SYNC_KEY = "agentpay_pending_policy_sync";

export function loadUserPolicy(): UserSpendingPolicy {
  if (typeof window === "undefined") return DEFAULT_SPENDING_POLICY;
  try {
    const raw = localStorage.getItem(POLICY_STORAGE_KEY);
    if (!raw) return DEFAULT_SPENDING_POLICY;
    return { ...DEFAULT_SPENDING_POLICY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SPENDING_POLICY;
  }
}

export function saveUserPolicy(policy: UserSpendingPolicy): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(policy));
  } catch {
    // Storage quota or private browsing
  }
}

export function resetUserPolicy(): UserSpendingPolicy {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(POLICY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return DEFAULT_SPENDING_POLICY;
}

export async function savePolicyWithSync(policy: UserSpendingPolicy): Promise<{
  policy: UserSpendingPolicy;
  storageMode: PersistenceMode;
}> {
  saveUserPolicy(policy);
  if (typeof window === "undefined") {
    return { policy, storageMode: "localstorage_fallback" };
  }

  try {
    localStorage.setItem(PENDING_POLICY_SYNC_KEY, "true");
    const workspaceId = getOrCreateWorkspaceId();
    const res = await fetch("/api/policy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, policy }),
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (res.ok && data?.source === "neon") {
      localStorage.removeItem(PENDING_POLICY_SYNC_KEY);
      return { policy: data.policy || policy, storageMode: "neon" };
    }
    return { policy, storageMode: "localstorage_fallback" };
  } catch {
    return { policy, storageMode: "localstorage_fallback" };
  }
}

export async function resetPolicyWithSync(): Promise<{
  policy: UserSpendingPolicy;
  storageMode: PersistenceMode;
}> {
  const defaults = resetUserPolicy();
  return savePolicyWithSync(defaults);
}

export async function hydratePolicyWithNeonFallback(): Promise<{
  policy: UserSpendingPolicy;
  storageMode: PersistenceMode;
}> {
  const localPolicy = loadUserPolicy();
  if (typeof window === "undefined") {
    return { policy: localPolicy, storageMode: "localstorage_fallback" };
  }

  const workspaceId = getOrCreateWorkspaceId();

  // Push any offline pending policy change to Neon first so local changes win
  try {
    if (localStorage.getItem(PENDING_POLICY_SYNC_KEY) === "true") {
      return await savePolicyWithSync(localPolicy);
    }
  } catch {
    return { policy: localPolicy, storageMode: "localstorage_fallback" };
  }

  try {
    const res = await fetch(`/api/policy?workspaceId=${encodeURIComponent(workspaceId)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (res.ok && data?.source === "neon" && data?.policy) {
      const merged = { ...DEFAULT_SPENDING_POLICY, ...data.policy };
      saveUserPolicy(merged);
      return { policy: merged, storageMode: "neon" };
    }
    return { policy: localPolicy, storageMode: "localstorage_fallback" };
  } catch {
    return { policy: localPolicy, storageMode: "localstorage_fallback" };
  }
}
