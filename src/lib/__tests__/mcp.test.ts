import { describe, it, expect } from "vitest";
import { handleMCPRequest, MCP_TOOLS } from "../mcp/server";

describe("PayPal Commerce MCP Server", () => {
  it("should expose all 4 standardized commerce tools", async () => {
    const res = await handleMCPRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    });

    expect(res.result.tools).toHaveLength(4);
    const toolNames = res.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain("paypal_search_catalog");
    expect(toolNames).toContain("paypal_audit_spec_parity");
    expect(toolNames).toContain("paypal_create_order");
    expect(toolNames).toContain("paypal_capture_order");
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
    expect(res.result.content[0].type).toBe("text");
    const parsed = JSON.parse(res.result.content[0].text);
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
        arguments: { productId: "c3-prod-101", amount: 849.00 },
      },
    });

    const createData = JSON.parse(createRes.result.content[0].text);
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

    const captureData = JSON.parse(captureRes.result.content[0].text);
    expect(captureData.status.toLowerCase()).toBe("completed");
  });
});
