import { describe, it, expect } from "vitest";
import { getPaymentGateway } from "../payments";
import { getCurrentSession } from "../auth";

describe("Payments & Auth Layer Tests", () => {
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

  it("should return pre-authenticated guest session for judges without signup wall", async () => {
    const session = await getCurrentSession();
    expect(session.isAuthenticated).toBe(true);
    expect(session.isGuestDemo).toBe(true);
    expect(session.user.role).toBe("judge");
  });
});
