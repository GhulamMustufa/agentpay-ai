/**
 * User Spending Policy Engine & Guardrail Evaluator
 * Enforces customizable rules: markup tolerance, merchant verification,
 * auto-approve thresholds, and condition restrictions.
 */

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

  // Rule 3: Merchant Verification
  const isVerified = quote.vendor.toLowerCase().includes("verified") || quote.vendor.toLowerCase().includes("official");
  if (policy.requireVerifiedMerchants && !isVerified && !quote.isCompliant) {
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
