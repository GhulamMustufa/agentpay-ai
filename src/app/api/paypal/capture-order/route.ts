import { NextRequest, NextResponse } from "next/server";
import { PayPalPaymentGateway } from "@/lib/payments/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, clientId, clientSecret, environment } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid orderId" },
        { status: 400 }
      );
    }

    const gateway = new PayPalPaymentGateway({
      clientId: clientId || process.env.PAYPAL_CLIENT_ID,
      clientSecret: clientSecret || process.env.PAYPAL_CLIENT_SECRET,
      environment: environment || (process.env.PAYPAL_ENVIRONMENT as any) || "sandbox",
    });

    const isLive = gateway.isLiveConfigured();
    const capture = await gateway.captureOrder(orderId);

    return NextResponse.json({
      success: true,
      isLive,
      mode: isLive ? "paypal_sandbox_live" : "paypal_sandbox_simulated",
      capture,
    });
  } catch (err: any) {
    console.error("PayPal Capture Order Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to capture PayPal order",
      },
      { status: 500 }
    );
  }
}
