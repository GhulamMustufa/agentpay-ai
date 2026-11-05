import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

// Parse .env manually
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
}

console.log("==========================================");
console.log("   AGENTPAY LIVE KEYS VERIFICATION TEST   ");
console.log("==========================================");

async function testPayPal() {
  console.log("\n[1/2] Testing PayPal Sandbox API...");
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env");
    return;
  }

  console.log(`Using Client ID: ${clientId.substring(0, 10)}... (length: ${clientId.length})`);
  console.log(`Using Secret:    ${clientSecret.substring(0, 10)}... (length: ${clientSecret.length})`);

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("❌ PayPal OAuth Failed:", tokenRes.status, tokenData);
      return;
    }

    console.log("✓ PayPal OAuth2 Token Acquired Successfully!");
    console.log(`  Token type: ${tokenData.token_type}, Expires in: ${tokenData.expires_in}s, Scope: ${tokenData.scope}`);

    const accessToken = tokenData.access_token;

    // Create a live sandbox order
    console.log("\nTesting Real PayPal Orders v2 Order Creation...");
    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: "VERIFY-TEST-ORDER-1",
            amount: {
              currency_code: "USD",
              value: "849.00",
            },
            description: "AgentPay Verification: Dell XPS 13 Developer Edition",
          },
        ],
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("❌ PayPal Order Creation Failed:", orderRes.status, orderData);
      return;
    }

    console.log("✓ Live PayPal Order Created Successfully!");
    console.log(`  Order ID:    ${orderData.id}`);
    console.log(`  Status:      ${orderData.status}`);
    const approveLink = orderData.links?.find((l) => l.rel === "approve")?.href;
    console.log(`  Approve URL: ${approveLink || "N/A"}`);
  } catch (err) {
    console.error("❌ PayPal Error:", err.message);
  }
}

async function testGemini() {
  console.log("\n[2/2] Testing Google Gemini API...");
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in .env");
    return;
  }

  console.log(`Using Gemini Key: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Respond with the single word 'CONFIRMED' if you receive this shopping procurement check.",
              },
            ],
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Gemini Call Failed:", res.status, data);
      return;
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("✓ Google Gemini Response Received!");
    console.log(`  Model reply: "${reply}"`);
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
  }
}

async function run() {
  await testPayPal();
  await testGemini();
  console.log("\n==========================================");
  console.log("            TEST RUN COMPLETE             ");
  console.log("==========================================");
}

run();
