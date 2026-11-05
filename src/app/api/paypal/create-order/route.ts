import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentGateway } from "@/lib/payments/paypal";

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

    const gateway = new PayPalPaymentGateway({
      clientId: clientId || process.env.PAYPAL_CLIENT_ID,
      clientSecret: clientSecret || process.env.PAYPAL_CLIENT_SECRET,
      environment: environment || (process.env.PAYPAL_ENVIRONMENT as any) || "sandbox",
    });

    const isLive = gateway.isLiveConfigured();
    const order = await gateway.createOrder({
      amount,
      currency,
      description,
    });

    return NextResponse.json({
      success: true,
      isLive,
      mode: isLive ? "paypal_sandbox_live" : "paypal_sandbox_simulated",
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
