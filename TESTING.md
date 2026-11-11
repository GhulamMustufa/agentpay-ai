# 🧪 Testing Guide & Sandbox Credentials: AgentPay AI

This guide contains everything required for judges to run, test, and verify **AgentPay** locally or in production.

---

## ⚡ Quick Test (Zero-Config 1-Click Guest Mode)

You do **not** need to register an account or enter live credit cards to test the system:

1. **Open the Live Render Deployment** (no local setup needed):
   - App: [https://agentpay-ai.onrender.com](https://agentpay-ai.onrender.com)
   - Health Check: [https://agentpay-ai.onrender.com/api/health](https://agentpay-ai.onrender.com/api/health)
   - Interactive Deck: [https://agentpay-ai.onrender.com/slides.html](https://agentpay-ai.onrender.com/slides.html)
2. Or run locally with `npm run dev` and navigate to `http://localhost:3000`.
3. Click **"Try the Live Demo (No Sign-Up Needed)"** (or **"Open Demo"**) on the homepage.
4. The system opens with **1-Click Guest Access** and activates the **PayPal Developer Sandbox** demo mode.
5. Click **"Find Best Deals Safely"** to see the full flow:
   - Searches products across Channel3 + Elastic hybrid ranking
   - Catches the hidden $100 fee on CloudTech Supply and halts
   - Switches to Official Dell Direct ($849.00) and asks for your 1-click confirmation
   - Captures the order via PayPal Orders v2 Sandbox (`312ms` simulated latency) and triggers Zapier event telemetry

---

## 🔑 PayPal Sandbox Developer Credentials

If you wish to test with your own PayPal Developer account:

1. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
2. Insert your PayPal Sandbox credentials from [developer.paypal.com](https://developer.paypal.com):
   ```env
   PAYPAL_ENVIRONMENT=sandbox
   PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
   # Optional Sponsor APIs:
   # CHANNEL3_API_KEY=your_channel3_key
   # ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
   # ELASTICSEARCH_URL=https://...
   # ELASTICSEARCH_API_KEY=your_elastic_api_key
   ```
3. Test Personal Buyer Sandbox Account:
   - **Email**: `sb-buyer-agentpay@business.example.com`
   - **Password**: `TestPass123!` (or use your own sandbox test buyer)

---

## 🤖 Automated Test Suites

### 1. Vitest Unit & Integration Tests
Runs tests across payment gateway logic, policy checks, sponsor integrations, Neon DB failover, and MCP server endpoints:
```bash
npm test
```
*Expected Result: 43/43 passing tests across 8 suites in ~1s.*

### 2. Live API Edge-Case Tests
Runs live tests against real PayPal Sandbox, Google Gemini 3 Flash, Channel3 Catalog, Elasticsearch Serverless, and Neon Postgres endpoints verifying non-shopping queries, unrealistic low budgets, prompt injection resistance, live catalog indexing, DB schema queries, and order lifecycles:
```bash
npm run test:edge
```
*Expected Result: 7/7 passing live tests (100%).*

### 3. Real-Browser Playwright E2E Suite
Verifies landing responsiveness & icons, dark/light theme switching, 1-click guest bypass, full AI -> PayPal Sandbox -> Neon Postgres persistence across page reload, edge-case UI blocking, `/api/edge-tests`, MCP JSON-RPC, `/docs`, and `/slides.html`:
```bash
npm run test:e2e
```
*Expected Result: 6/6 Chrome E2E scenarios passing.*

### 4. Postman API Test Suite
Import `postman/paypal-ai-collection.json` into Postman to execute live calls against PayPal Sandbox OAuth2, Orders v2, `/api/health`, `/api/ledger`, and `/api/edge-tests` endpoints.
