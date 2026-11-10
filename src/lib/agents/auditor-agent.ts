/**
 * Agent 2: Policy & Compliance Auditor Agent
 * Cross-checks every candidate quote against user-defined spending rules.
 * Detects stealth fees, unapproved markups, and calculates money saved.
 */

import { ShoppingQuote } from "@/lib/ai/shopping-agent";
import { UserSpendingPolicy, evaluateQuoteAgainstPolicy, PolicyEvaluationResult } from "@/lib/policy/engine";

export interface AuditResult {
  hasDiscrepancy: boolean;
  violatingQuote: (ShoppingQuote & { policyDetails?: PolicyEvaluationResult }) | null;
  approvedQuote: (ShoppingQuote & { policyDetails?: PolicyEvaluationResult }) | null;
  moneySaved: number;
  auditLogs: string[];
  requiresHumanApproval: boolean;
}

export class PolicyAuditorAgent {
  name = "Policy & Compliance Auditor";
  role = "Financial Guardrails & Hidden-Fee Enforcement";

  auditQuotes(
    quotes: ShoppingQuote[],
    budgetCap: number,
    policy: UserSpendingPolicy
  ): AuditResult {
    const auditLogs: string[] = [];

    let violatingQuote: (ShoppingQuote & { policyDetails?: PolicyEvaluationResult }) | null = null;
    let approvedQuote: (ShoppingQuote & { policyDetails?: PolicyEvaluationResult }) | null = null;

    auditLogs.push(`🛡️ Fee Inspector: Checking store quotes against your rules (Max fee allowed: $${policy.maxMarkupTolerance.toFixed(2)}, Budget: $${budgetCap.toFixed(2)})...`);

    for (const q of quotes) {
      const evaluation = evaluateQuoteAgainstPolicy(q, budgetCap, policy);

      if (!evaluation.isCompliant && !violatingQuote) {
        violatingQuote = { ...q, policyDetails: evaluation };
        auditLogs.push(
          `⚠️ Sneaky Fee Caught from "${q.vendor}": ${evaluation.reason}`
        );
      } else if (evaluation.isCompliant && !approvedQuote) {
        approvedQuote = { ...q, policyDetails: evaluation };
        auditLogs.push(
          `✓ Fair Price Verified from "${q.vendor}": $${q.price.toFixed(2)} (meets all your safety rules).`
        );
      }
    }

    // Fail-closed security invariant: never approve a quote unless it passes user policy
    const moneySaved = violatingQuote && approvedQuote
      ? Math.max(0, violatingQuote.price - approvedQuote.price)
      : 0;

    const requiresHumanApproval = approvedQuote
      ? approvedQuote.price > policy.autoApproveThreshold
      : true;

    if (violatingQuote) {
      auditLogs.push(
        `🛡️ Stopped Overcharge: Rejected ${violatingQuote.vendor} ($${violatingQuote.price.toFixed(2)}). ${approvedQuote ? `Saved you $${moneySaved.toFixed(2)}!` : "Awaiting compliant vendor quote."}`
      );
    }

    if (approvedQuote) {
      if (requiresHumanApproval) {
        auditLogs.push(
          `✋ Ready for Approval: ${approvedQuote.vendor} ($${approvedQuote.price.toFixed(2)}) is over your $${policy.autoApproveThreshold.toFixed(2)} rule. Waiting for your 1-click confirmation.`
        );
      } else {
        auditLogs.push(
          `⚡ Safe to Auto-Pay: ${approvedQuote.vendor} ($${approvedQuote.price.toFixed(2)}) is under your $${policy.autoApproveThreshold.toFixed(2)} rule.`
        );
      }
    } else if (quotes.length > 0) {
      auditLogs.push(
        `🚫 Financial Firewall Triggered: No vendor quotes satisfied all active rules (Budget: $${budgetCap.toFixed(2)}, Max fee: $${policy.maxMarkupTolerance.toFixed(2)}). Checkout blocked.`
      );
    }

    return {
      hasDiscrepancy: Boolean(violatingQuote),
      violatingQuote,
      approvedQuote,
      moneySaved,
      auditLogs,
      requiresHumanApproval,
    };
  }
}

export const policyAuditorAgent = new PolicyAuditorAgent();
