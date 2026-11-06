/**
 * Agent 3: PayPal Settlement Agent
 * Manages PayPal Orders v2 sandbox checkout, capture execution,
 * and records completed transactions into the persistent ledger.
 */

import { addLedgerRecord, LedgerRecord } from "@/lib/storage/ledger";

export interface SettlementResult {
  success: boolean;
  orderId: string;
  status: string;
  isLive: boolean;
  paidAmount: number;
  approvalUrl?: string;
  latencyMs: number;
  ledgerRecord: LedgerRecord;
}

export class PayPalSettlementAgent {
  name = "PayPal Settlement Agent";
  role = "Payment Orchestration & Orders v2 Execution";

  async executeSettlement(params: {
    item: string;
    vendor: string;
    amount: number;
    userPrompt: string;
    moneySaved: number;
    auditLogs: string[];
    clientId?: string;
    clientSecret?: string;
  }): Promise<SettlementResult> {
    const t0 = performance.now();

    // 1. Create PayPal Order
    const createRes = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: params.amount,
        currency: "USD",
        description: `AgentPay Purchase: ${params.item} from ${params.vendor}`,
        clientId: params.clientId || undefined,
        clientSecret: params.clientSecret || undefined,
      }),
    });

    const createData = await createRes.json();
    if (!createData.success || !createData.order) {
      throw new Error(createData.error || "PayPal Settlement Agent failed to create order.");
    }

    const orderId = createData.order.id;
    const isLive = Boolean(createData.isLive);
    const approvalUrl = createData.order.approvalUrl;

    // 2. Capture PayPal Order
    const captureRes = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        clientId: params.clientId || undefined,
        clientSecret: params.clientSecret || undefined,
      }),
    });

    const captureData = await captureRes.json();
    const latencyMs = Math.round(performance.now() - t0);

    if (!captureData.success) {
      throw new Error(captureData.error || "PayPal Settlement Agent failed to capture order.");
    }

    const captureStatus = captureData.capture?.status?.toUpperCase() || "COMPLETED";

    // 3. Persist transaction into Ledger
    const ledgerRecord = addLedgerRecord({
      prompt: params.userPrompt,
      item: params.item,
      merchant: params.vendor,
      paidAmount: params.amount,
      moneySaved: params.moneySaved,
      paypalOrderId: orderId,
      status: "COMPLETED",
      receiptUrl: approvalUrl,
      agentAuditTrail: [
        ...params.auditLogs,
        `💳 Safe Checkout: Created PayPal Order #${orderId} on ${isLive ? "api-m.sandbox.paypal.com" : "PayPal Sandbox"}.`,
        `💳 Safe Checkout: Payment confirmed successfully via PayPal in ${latencyMs}ms. Status: ${captureStatus}.`,
      ],
    });

    return {
      success: true,
      orderId,
      status: captureStatus,
      isLive,
      paidAmount: params.amount,
      approvalUrl,
      latencyMs,
      ledgerRecord,
    };
  }
}

export const settlementAgent = new PayPalSettlementAgent();
