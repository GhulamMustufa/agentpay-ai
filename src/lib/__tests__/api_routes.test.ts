import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST as createOrderRoute } from "@/app/api/paypal/create-order/route";
import { POST as captureOrderRoute } from "@/app/api/paypal/capture-order/route";
import { POST as analyzeAiRoute } from "@/app/api/ai/analyze/route";
import { GET as ledgerGetRoute, POST as ledgerPostRoute, DELETE as ledgerDeleteRoute } from "@/app/api/ledger/route";
import { GET as policyGetRoute, PUT as policyPutRoute } from "@/app/api/policy/route";
import { GET as healthGetRoute } from "@/app/api/health/route";
import { resetDbCircuitBreaker } from "@/lib/db";
import { NextRequest } from "next/server";

function createMockRequest(url: string, body: any, method = "POST"): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("API Route Integration Tests", () => {
  it("POST /api/paypal/create-order generates an order in simulated sandbox mode when no keys provided", async () => {
    const req = createMockRequest("http://localhost:3000/api/paypal/create-order", {
      amount: 499.0,
      currency: "USD",
      description: "Test Laptop Order",
    });

    const res = await createOrderRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.order).toBeDefined();
    expect(data.order.id).toBeDefined();
    expect(data.order.amount).toBe(499.0);
  });

  it("POST /api/paypal/capture-order captures an order", async () => {
    const req = createMockRequest("http://localhost:3000/api/paypal/capture-order", {
      orderId: "ORDER-TEST-12345",
    });

    const res = await captureOrderRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.capture).toBeDefined();
    expect(data.capture.id).toBe("ORDER-TEST-12345");
  });

  it("POST /api/ai/analyze evaluates shopping query dynamically", async () => {
    const req = createMockRequest("http://localhost:3000/api/ai/analyze", {
      prompt: "I need ergonomic noise cancelling headphones under $250",
      budgetCap: 250,
    });

    const res = await analyzeAiRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.isShopping).toBe(true);
    expect(data.analysis.quotes.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/ai/analyze halts non-shopping requests safely", async () => {
    const req = createMockRequest("http://localhost:3000/api/ai/analyze", {
      prompt: "Tell me a joke about coding",
      budgetCap: 500,
    });

    const res = await analyzeAiRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.analysis.isShopping).toBe(false);
  });

  describe("Hybrid Ledger, Policy & Health API Routes", () => {
    const originalDbUrl = process.env.DATABASE_URL;

    beforeEach(() => {
      delete process.env.DATABASE_URL;
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

    it("/api/ledger GET, POST, and DELETE degrade cleanly to fallback when DATABASE_URL is absent", async () => {
      const getRes = await ledgerGetRoute(createMockRequest("http://localhost:3000/api/ledger?workspaceId=ws_test", undefined, "GET"));
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.success).toBe(true);
      expect(getJson.source).toBe("fallback");

      const postRes = await ledgerPostRoute(
        createMockRequest("http://localhost:3000/api/ledger", {
          workspaceId: "ws_test",
          record: {
            id: "txn_local_1",
            timestamp: new Date().toISOString(),
            prompt: "Laptop under 900",
            item: "Dell XPS 13",
            merchant: "Official Dell Direct",
            paidAmount: 849,
            moneySaved: 100,
            paypalOrderId: "ORDER-1",
            status: "COMPLETED",
            agentAuditTrail: ["Verified"],
          },
        })
      );
      expect(postRes.status).toBe(200);
      const postJson = await postRes.json();
      expect(postJson.success).toBe(true);
      expect(postJson.source).toBe("fallback");

      const delRes = await ledgerDeleteRoute(createMockRequest("http://localhost:3000/api/ledger?workspaceId=ws_test", undefined, "DELETE"));
      expect(delRes.status).toBe(200);
      const delJson = await delRes.json();
      expect(delJson.success).toBe(true);
      expect(delJson.source).toBe("fallback");
    });

    it("/api/policy GET and PUT normalize values cleanly and fall back when Neon is unavailable", async () => {
      const putRes = await policyPutRoute(
        createMockRequest(
          "http://localhost:3000/api/policy",
          {
            workspaceId: "ws_test",
            policy: {
              maxMarkupTolerance: -5,
              autoApproveThreshold: 120,
              requireVerifiedMerchants: true,
              allowRefurbished: false,
              maxShippingFee: 10,
            },
          },
          "PUT"
        )
      );
      expect(putRes.status).toBe(200);
      const putJson = await putRes.json();
      expect(putJson.success).toBe(true);
      expect(putJson.policy.maxMarkupTolerance).toBe(0);
      expect(putJson.policy.autoApproveThreshold).toBe(120);
      expect(putJson.source).toBe("fallback");

      const getRes = await policyGetRoute(createMockRequest("http://localhost:3000/api/policy?workspaceId=ws_test", undefined, "GET"));
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.success).toBe(true);
      expect(getJson.source).toBe("fallback");
    });

    it("GET /api/health reports database fallback and sponsor integration statuses", async () => {
      const res = await healthGetRoute();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("healthy");
      expect(data.integrations.database).toBe("fallback_localstorage");
      expect(data.integrations.apimatic).toBe("openapi_v2_validator_active");
    });
  });
});
