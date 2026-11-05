import { describe, it, expect } from "vitest";
import { POST as createOrderRoute } from "@/app/api/paypal/create-order/route";
import { POST as captureOrderRoute } from "@/app/api/paypal/capture-order/route";
import { POST as analyzeAiRoute } from "@/app/api/ai/analyze/route";
import { NextRequest } from "next/server";

function createMockRequest(url: string, body: any): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
});
