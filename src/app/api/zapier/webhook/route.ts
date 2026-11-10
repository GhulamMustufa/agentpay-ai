import { NextRequest, NextResponse } from "next/server";
import { Zapier, isSafeWebhookTarget } from "@/lib/integrations/sponsors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, webhookUrl, payload } = body;

    if (event !== "POLICY_OVERCHARGE_BLOCKED" && event !== "PAYPAL_ORDER_CAPTURED") {
      return NextResponse.json(
        { success: false, error: "Unsupported Zapier event type." },
        { status: 400 }
      );
    }

    const reqHost = (req.headers.get("host") || "").toLowerCase();
    const isLocalRequest =
      reqHost.startsWith("localhost") || reqHost.startsWith("127.0.0.1") || reqHost.startsWith("[::1]");

    if (webhookUrl && !isSafeWebhookTarget(String(webhookUrl).trim(), isLocalRequest)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhookUrl: client webhook overrides must use https://hooks.zapier.com/",
        },
        { status: 400 }
      );
    }

    const result = await Zapier.dispatchEvent({
      event,
      webhookUrl,
      allowLocalLoopback: isLocalRequest,
      payload: payload && typeof payload === "object" ? payload : {},
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to dispatch Zapier event" },
      { status: 500 }
    );
  }
}

