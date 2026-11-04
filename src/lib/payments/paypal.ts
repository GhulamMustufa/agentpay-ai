import { PaymentGateway, PaymentOrderRequest, PaymentOrderResponse } from "./types";

export class PayPalPaymentGateway implements PaymentGateway {
  name = "PayPal Developer Platform (Sandbox & Live)";

  private clientId = process.env.PAYPAL_CLIENT_ID;
  private clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  private baseUrl = process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("PayPal credentials not set in environment.");
    }
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token;
  }

  async createOrder(req: PaymentOrderRequest): Promise<PaymentOrderResponse> {
    if (!this.clientId) {
      // Graceful fallback to sandbox mock
      return {
        id: `paypal-sim-${Date.now()}`,
        status: "created",
        amount: req.amount,
        currency: req.currency,
        approvalUrl: "https://www.sandbox.paypal.com/checkoutnow",
      };
    }

    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: req.currency,
              value: req.amount.toFixed(2),
            },
            description: req.description,
          },
        ],
      }),
    });
    const data = await res.json();
    const approveLink = data.links?.find((l: any) => l.rel === "approve")?.href;

    return {
      id: data.id,
      status: "created",
      amount: req.amount,
      currency: req.currency,
      approvalUrl: approveLink,
      rawResponse: data,
    };
  }

  async captureOrder(orderId: string): Promise<PaymentOrderResponse> {
    if (!this.clientId) {
      return {
        id: orderId,
        status: "completed",
        amount: 100,
        currency: "USD",
      };
    }

    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    return {
      id: data.id,
      status: data.status === "COMPLETED" ? "completed" : "approved",
      amount: parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"),
      currency: data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code || "USD",
      rawResponse: data,
    };
  }
}
