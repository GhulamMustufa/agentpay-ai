import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentGateway } from "@/lib/payments/paypal";
import { APIMatic } from "@/lib/integrations/sponsors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "USD", description = "AgentPay Purchase", clientId, clientSecret, environment } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    const schemaCheck = APIMatic.validatePayPalOrderPayload({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: String(currency).toUpperCase(),
            value: amount.toFixed(2),
          },
          description: String(description).slice(0, 127),
        },
      ],
    });

    if (!schemaCheck.valid) {
      return NextResponse.json(
        { error: `APIMatic Schema Error: ${schemaCheck.errors.join("; ")}` },
        { status: 400 }
      );
    }

    const gateway = new PayPalPaymentGateway({
      clientId: clientId || process.env.PAYPAL_CLIENT_ID,
      clientSecret: clientSecret || process.env.PAYPAL_CLIENT_SECRET,
      environment: environment || (process.env.PAYPAL_ENVIRONMENT as any) || (process.env.PAYPAL_MODE as any) || "sandbox",
    });

    const isLive = gateway.isLiveConfigured();
    const order = await gateway.createOrder({
      amount,
      currency: String(currency).toUpperCase(),
      description: String(description).slice(0, 127),
    });

    return NextResponse.json({
      success: true,
      isLive,
      mode: isLive ? "paypal_sandbox_live" : "paypal_sandbox_simulated",
      schemaVerified: schemaCheck.valid,
      schemaContract: schemaCheck.contract,
      order,
    });
  } catch (err: any) {
    console.error("PayPal Create Order Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
