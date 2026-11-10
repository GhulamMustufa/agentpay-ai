import { describe, it, expect } from "vitest";
import { handleMCPRequest } from "../mcp/server";

describe("PayPal Commerce MCP Server", () => {
  it("should expose all 5 standardized commerce tools", async () => {
    const res = await handleMCPRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    });

    expect(res.result).toBeDefined();
    expect(res.result!.tools).toHaveLength(5);
    const toolNames = res.result!.tools!.map((t: any) => t.name);
    expect(toolNames).toContain("paypal_search_catalog");
    expect(toolNames).toContain("paypal_audit_spec_parity");
    expect(toolNames).toContain("paypal_check_purchase_policy");
    expect(toolNames).toContain("paypal_create_order");
    expect(toolNames).toContain("paypal_capture_order");
  });

  it("should detect budget violations via paypal_check_purchase_policy", async () => {
    const res = await handleMCPRequest({
      jsonrpc: "2.0",
      id: "test_policy_1",
      method: "tools/call",
      params: {
        name: "paypal_check_purchase_policy",
        arguments: {
          vendorName: "CloudTech Distro",
          quotedAmount: 949.0,
          budgetCap: 900.0,
          unapprovedMarkup: 100.0,
        },
      },
    });

    expect(res.result?.content?.[0]?.text).toBeDefined();
    const parsed = JSON.parse(res.result!.content![0].text);
    expect(parsed.compliant).toBe(false);
    expect(parsed.action).toBe("HALT_PAYMENT");
    expect(parsed.violationDetails.overageAmount).toBe(49.0);
  });

  it("should reject order creation if exceeding budget cap without override token", async () => {
    const res = await handleMCPRequest({
      jsonrpc: "2.0",
      id: "test_policy_2",
      method: "tools/call",
      params: {
        name: "paypal_create_order",
        arguments: {
          productId: "c3-prod-overpriced",
          amount: 949.0,
          budgetCap: 900.0,
        },
      },
    });

    expect(res.error).toBeDefined();
    expect(res.error!.code).toBe(-32001);
    expect(res.error!.message).toContain("PolicyViolation");
  });

  it("should execute paypal_search_catalog tool call via Channel3 and Elastic", async () => {
    const res = await handleMCPRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "paypal_search_catalog",
        arguments: { query: "programming laptop", maxPrice: 900 },
      },
    });

    expect(res.error).toBeUndefined();
    expect(res.result?.content?.[0]?.type).toBe("text");
    const parsed = JSON.parse(res.result!.content![0].text);
    expect(parsed.totalFound).toBeGreaterThan(0);
    expect(parsed.topCandidate.name).toBe("Dell XPS 13 Developer Edition");
  });

  it("should create and capture an order via MCP tool calls", async () => {
    const createRes = await handleMCPRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "paypal_create_order",
        arguments: { productId: "c3-prod-101", amount: 849.0 },
      },
    });

    const createData = JSON.parse(createRes.result!.content![0].text);
    expect(createData.orderId).toBeDefined();

    const captureRes = await handleMCPRequest({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "paypal_capture_order",
        arguments: { orderId: createData.orderId, approvalToken: "token_verified_123" },
      },
    });

    const captureData = JSON.parse(captureRes.result!.content![0].text);
    expect(captureData.status.toLowerCase()).toBe("completed");
  });
});
