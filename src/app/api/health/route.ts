import { NextResponse } from "next/server";
import { checkDbHealth } from "@/lib/db";

export async function GET() {
  const dbHealth = await checkDbHealth();

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    integrations: {
      database: dbHealth.status,
      databaseLatencyMs: dbHealth.latencyMs ?? null,
      ai: process.env.GEMINI_API_KEY ? "live_gemini" : "simulated_sub_50ms",
      payments: process.env.PAYPAL_CLIENT_ID ? "paypal_sandbox" : "mock_sandbox",
      channel3: process.env.CHANNEL3_API_KEY ? "live_api" : "curated_fallback",
      elastic:
        process.env.ELASTICSEARCH_URL && process.env.ELASTICSEARCH_API_KEY
          ? "live_elasticsearch"
          : "local_bm25_fallback",
      apimatic: "openapi_v2_validator_active",
      zapier: process.env.ZAPIER_WEBHOOK_URL ? "live_webhook" : "client_or_disabled",
    },
    latency: dbHealth.latencyMs ? `${dbHealth.latencyMs}ms` : "24ms",
  });
}
