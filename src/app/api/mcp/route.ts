import { NextRequest, NextResponse } from "next/server";
import { handleMCPRequest } from "@/lib/mcp/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.method) {
      return NextResponse.json(
        { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } },
        { status: 400 }
      );
    }

    const response = await handleMCPRequest(body);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32603, message: error.message || "Internal error" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "paypal-commerce-mcp-server",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "Standardized Model Context Protocol (MCP) server for PayPal Agentic Commerce",
    endpoints: {
      jsonRpc: "/api/mcp",
    },
  });
}
