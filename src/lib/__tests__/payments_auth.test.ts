import { describe, it, expect, afterEach, vi } from "vitest";
import { getPaymentGateway } from "../payments";
import { PayPalPaymentGateway } from "../payments/paypal";
import { getCurrentSession } from "../auth";

describe("Payments & Auth Layer Tests", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("should return mock payment gateway when no live keys exist", async () => {
    delete process.env.PAYPAL_CLIENT_ID;
    const gateway = getPaymentGateway();
    expect(gateway.name).toContain("Mock");

    const order = await gateway.createOrder({
      amount: 49.99,
      currency: "USD",
      description: "Test Hackathon Order",
    });
    expect(order.id).toBeDefined();
    expect(order.status).toBe("created");
  });

  it("verifies Sandbox Order on 422 ORDER_NOT_APPROVED instead of returning undefined id", async () => {
    const gw = new PayPalPaymentGateway({ clientId: "cid", clientSecret: "csec", environment: "sandbox" });
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
      const target = String(url);
      if (target.includes("/v1/oauth2/token")) {
        return { ok: true, status: 200, json: async () => ({ access_token: "tok_123" }) } as any;
      }
      if (target.endsWith("/capture")) {
        return {
          ok: false,
          status: 422,
          json: async () => ({
            name: "UNPROCESSABLE_ENTITY",
            details: [{ issue: "ORDER_NOT_APPROVED", description: "Payer has not yet approved the Order" }],
          }),
        } as any;
      }
      if (target.includes("/v2/checkout/orders/REAL-ORD-1")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: "REAL-ORD-1",
            status: "CREATED",
            purchase_units: [{ amount: { value: "849.00", currency_code: "USD" } }],
            links: [{ rel: "approve", href: "https://www.sandbox.paypal.com/checkoutnow?token=REAL-ORD-1" }],
          }),
        } as any;
      }
      return { ok: false, status: 404, json: async () => ({ message: "Not Found" }) } as any;
    }) as any;

    const result = await gw.captureOrder("REAL-ORD-1");
    expect(result.id).toBe("REAL-ORD-1");
    expect(result.status).toBe("approved");
    expect(result.amount).toBe(849);
    expect(result.approvalUrl).toContain("token=REAL-ORD-1");
  });

  it("attaches PayPal-Request-Id idempotency header on live createOrder calls", async () => {
    const gw = new PayPalPaymentGateway({ clientId: "cid", clientSecret: "csec", environment: "sandbox" });
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.includes("/v1/oauth2/token")) {
        return { ok: true, status: 200, json: async () => ({ access_token: "tok_123" }) } as any;
      }
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return {
        ok: true,
        status: 201,
        json: async () => ({
          id: "ORD-IDEM-1",
          status: "CREATED",
          links: [{ rel: "approve", href: "https://www.sandbox.paypal.com/checkoutnow?token=ORD-IDEM-1" }],
        }),
      } as any;
    }) as any;

    const order = await gw.createOrder({
      amount: 199,
      currency: "USD",
      description: "Idempotent Test",
      requestId: "req-idem-001",
    });
    expect(order.id).toBe("ORD-IDEM-1");
    expect(capturedHeaders["PayPal-Request-Id"]).toBe("req-idem-001");
  });

  it("should return pre-authenticated guest session for judges without signup wall", async () => {
    const session = await getCurrentSession();
    expect(session.isAuthenticated).toBe(true);
    expect(session.isGuestDemo).toBe(true);
    expect(session.user.role).toBe("judge");
  });
});
