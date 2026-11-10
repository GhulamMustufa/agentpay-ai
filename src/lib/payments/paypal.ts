import { PaymentGateway, PaymentOrderRequest, PaymentOrderResponse } from "./types";
import { APIMatic } from "../integrations/sponsors";

export class PayPalPaymentGateway implements PaymentGateway {
  name = "PayPal Developer Platform (Sandbox & Live)";

  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private baseUrl: string;

  constructor(creds?: { clientId?: string; clientSecret?: string; environment?: "sandbox" | "live" }) {
    this.clientId = creds?.clientId || process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = creds?.clientSecret || process.env.PAYPAL_CLIENT_SECRET;
    const env = creds?.environment || process.env.PAYPAL_ENVIRONMENT || process.env.PAYPAL_MODE || "sandbox";
    this.baseUrl = env === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  isLiveConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

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
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: (req.currency || "USD").toUpperCase(),
            value: req.amount.toFixed(2),
          },
          description: (req.description || "AgentPay Order").slice(0, 127),
        },
      ],
    };

    const validation = APIMatic.validatePayPalOrderPayload(orderPayload);
    if (!validation.valid) {
      throw new Error(`APIMatic Schema Validation Failed: ${validation.errors.join("; ")}`);
    }

    if (!this.clientId) {
      // Graceful fallback to sandbox mock
      return {
        id: `paypal-sim-${Date.now()}`,
        status: "created",
        amount: req.amount,
        currency: orderPayload.purchase_units[0].amount.currency_code,
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
      body: JSON.stringify(orderPayload),
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
