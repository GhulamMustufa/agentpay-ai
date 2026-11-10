import { describe, it, expect, afterEach, vi } from "vitest";
import { APIMatic, Channel3, Elastic, Zapier } from "../integrations/sponsors";
import { POST as zapierWebhookRoute } from "@/app/api/zapier/webhook/route";
import { NextRequest } from "next/server";

describe("Official Sponsor Integrations Unit Tests", () => {
  const origFetch = globalThis.fetch;
  const origChannel3Key = process.env.CHANNEL3_API_KEY;

  afterEach(() => {
    globalThis.fetch = origFetch;
    if (origChannel3Key) {
      process.env.CHANNEL3_API_KEY = origChannel3Key;
    } else {
      delete process.env.CHANNEL3_API_KEY;
    }
  });

  it("Channel3 parses nested offers[].price.price schema and excludes invalid in_stock filter", async () => {
    process.env.CHANNEL3_API_KEY = "c3_test_key";
    let sentBody: any = null;
    globalThis.fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      sentBody = JSON.parse(String(init?.body || "{}"));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          products: [
            {
              id: "C3LIVE1",
              title: "Lenovo ThinkPad T16 16GB RAM",
              category: { slug: "laptops", title: "Laptops" },
              brands: [{ id: "len", name: "Lenovo" }],
              key_features: ["Intel Core i7", "16GB DDR4", "512GB NVMe SSD"],
              offers: [
                {
                  domain: "newegg.com",
                  url: "https://buy.trychannel3.com/example",
                  price: { price: 699, currency: "USD" },
                  availability: "InStock",
                },
              ],
            },
          ],
        }),
      } as any;
    }) as any;

    const results = await Channel3.searchProducts("developer laptop", 900);
    expect(sentBody.filters?.in_stock).toBeUndefined();
    expect(sentBody.filters?.price?.max_price).toBe(900);
    expect(results).toHaveLength(1);
    expect(results[0].price).toBe(699);
    expect(results[0].merchant).toBe("newegg.com");
    expect(results[0].category).toBe("Laptops");
  });

  it("Channel3 returns curated products filtered by maxPrice when no live key is set", async () => {
    delete process.env.CHANNEL3_API_KEY;
    const results = await Channel3.searchProducts("developer laptop", 860);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every((p) => p.price <= 860)).toBe(true);
  });

  it("Elastic hybrid scorer ranks query-matching items highest", async () => {
    const items = await Channel3.searchProducts("laptop", 1000);
    const ranked = await Elastic.semanticRank("Dell XPS developer", items);
    expect(ranked[0].name).toContain("Dell XPS");
  });

  it("APIMatic validates valid PayPal Orders v2 payloads and rejects malformed ones", () => {
    const valid = APIMatic.validatePayPalOrderPayload({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: "849.00" },
          description: "Dell XPS 13 Developer Edition",
        },
      ],
    });
    expect(valid.valid).toBe(true);
    expect(valid.errors).toHaveLength(0);

    const invalid = APIMatic.validatePayPalOrderPayload({
      intent: "INVALID_INTENT",
      purchase_units: [
        {
          amount: { currency_code: "usd", value: "849" },
        },
      ],
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("Zapier safely simulates event dispatch when no webhook URL is configured", async () => {
    delete process.env.ZAPIER_WEBHOOK_URL;
    const res = await Zapier.dispatchEvent({
      event: "POLICY_OVERCHARGE_BLOCKED",
      payload: { vendor: "CloudTech Supply", blockedMarkup: 100 },
    });
    expect(res.simulated).toBe(true);
    expect(res.dispatched).toBe(false);
    expect(res.event).toBe("POLICY_OVERCHARGE_BLOCKED");
  });

  it("POST /api/zapier/webhook handles valid events and rejects unknown ones", async () => {
    const okReq = new NextRequest(new URL("http://localhost:3000/api/zapier/webhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "PAYPAL_ORDER_CAPTURED",
        payload: { orderId: "TEST-123", amount: 849 },
      }),
    });
    const okRes = await zapierWebhookRoute(okReq);
    expect(okRes.status).toBe(200);
    const okData = await okRes.json();
    expect(okData.success).toBe(true);

    const badReq = new NextRequest(new URL("http://localhost:3000/api/zapier/webhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "UNKNOWN_EVENT" }),
    });
    const badRes = await zapierWebhookRoute(badReq);
    expect(badRes.status).toBe(400);

    const ssrfReq = new NextRequest(new URL("https://agentpay-ai.onrender.com/api/zapier/webhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json", host: "agentpay-ai.onrender.com" },
      body: JSON.stringify({
        event: "PAYPAL_ORDER_CAPTURED",
        webhookUrl: "http://169.254.169.254/latest/meta-data/",
        payload: {},
      }),
    });
    const ssrfRes = await zapierWebhookRoute(ssrfReq);
    expect(ssrfRes.status).toBe(400);
  });
});

