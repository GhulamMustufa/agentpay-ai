import { PaymentGateway, PaymentOrderRequest, PaymentOrderResponse } from "./types";

export class MockPaymentGateway implements PaymentGateway {
  name = "Mock / Sandbox Simulation Gateway";

  async createOrder(req: PaymentOrderRequest): Promise<PaymentOrderResponse> {
    const id = `mock-ord-${Math.random().toString(36).substring(2, 9)}`;
    return {
      id,
      status: "created",
      amount: req.amount,
      currency: req.currency,
      approvalUrl: `https://demo-checkout.sandbox.local/checkout?order=${id}`,
    };
  }

  async captureOrder(orderId: string): Promise<PaymentOrderResponse> {
    return {
      id: orderId,
      status: "completed",
      amount: 100.0,
      currency: "USD",
      rawResponse: {
        simulation: true,
        message: "Payment captured successfully with sub-second confirmation.",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
