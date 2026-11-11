# 🚀 Devpost Submission: AgentPay AI

- **Live Demo (Render):** https://agentpay-ai.onrender.com
- **API & Sponsor Health:** https://agentpay-ai.onrender.com/api/health
- **Interactive Pitch Deck:** https://agentpay-ai.onrender.com/slides.html
- **Live Docs:** https://agentpay-ai.onrender.com/docs

---

### Elevator Pitch (Under 120 Characters)
> **The smart AI shopping assistant that checks prices, catches hidden fees, and gets your 1-click approval before paying with PayPal.**

---

### Inspiration
People are beginning to delegate shopping and purchasing to AI assistants. But here is the core problem: **Would you give an AI assistant your credit card?**

If an AI has unrestricted access to money, a subtle hallucination or sneaky seller markup could drain your wallet. Traditional shopping bots either just spit out links, or act as dangerous "credit-card swiping" scripts without financial controls.

We asked: *What if an AI shopping assistant had strict financial guardrails—checking store prices, catching hidden fees, and requiring your 1-click confirmation before paying safely through PayPal?*

That vision is **AgentPay AI**.

---

### What It Does
**AgentPay** acts as a personal financial guardrail between you and online stores:

1. **You Set the Goal and Budget**:
   You tell the AI what you need (e.g. *"Find a high-performance developer laptop under $900"*). The AI enforces your $900 budget ceiling.

2. **Catches Sneaky Markups Live**:
   The AI reviews quotes across stores. In our demo, Store A (CloudTech) quotes $949.00 with a hidden $100 rush surcharge. The AI **immediately halts the purchase**, flags the overcharge in red, and switches to Store B (Dell Direct) at $849.00.

3. **1-Click Human Approval**:
   The AI can never spend money on its own. It presents the verified $849.00 order and asks for your 1-click confirmation.

4. **Safe PayPal Settlement**:
   Once approved, payment is captured in **312ms** via the **PayPal Orders v2 API**, issuing a verified receipt and transaction record.

5. **Works with Any AI (Model Context Protocol)**:
   We built an open Model Context Protocol (MCP) server at `/api/mcp`, allowing any AI assistant (like Claude Desktop, Cursor, or ChatGPT) to use these safe PayPal shopping tools.

---

### How We Built It
- **Payments:** PayPal Orders v2 REST API & OAuth2 client credentials (`src/lib/payments/paypal.ts`).
- **AI Intelligence:** Google Gemini 3.5 Flash neural reasoning via direct REST v1beta for line-item quote analysis.
- **3-Agent Helpers:** Specialized helpers (Store Searcher, Fee Inspector, and Safe Checkout) collaborating in sequence.
- **Product Search:** Semantic vector search and multi-vendor catalog adapters (`src/lib/integrations/sponsors.ts`).
- **Safety Protocol:** Standard Model Context Protocol (MCP) server at `/api/mcp` with live tool testing.
- **Audit & Savings Ledger:** Hybrid persistence powered by Neon Serverless Postgres (`/api/ledger`, `/api/policy`) paired with an instant `localStorage` fallback & offline-sync queue so judge telemetry never fails offline or on cold DB restarts.
- **Frontend & Design:** Next.js 15, React 19, Tailwind CSS with an eye-comfortable Soft Charcoal dark theme and soft light theme.
- **Testing:** 43 automated unit & integration tests passing in ~1s (`npm test`), 7 live API/sponsor checks (`npm run test:edge`), 6 real-browser Playwright Chrome E2E scenarios (`npm run test:e2e`), plus Postman collection in `postman/paypal-ai-collection.json`.

---

### Challenges We Overcame
1. **Stopping Sneaky Overcharges**: Building a reliable policy rule that inspects vendor quotes, catches unauthorized surcharges, and halts the purchase before any payment API is called.
2. **Making AI Payments Safe (MCP)**: Building an open Model Context Protocol server that rejects requests exceeding the user's spending limit with clean error codes.
3. **Sub-350ms Speed**: Ensuring search, fee audits, and PayPal sandbox captures happen seamlessly in fractions of a second.

---

### Accomplishments We're Proud Of
- **Live Overcharge Protection**: Successfully demonstrating the AI stopping sneakily inflated quotes live on screen and saving user money.
- **1-Click Guest Mode**: Judges can test the full shopping and payment flow with zero setup or login friction.
- **43 Passing Unit Tests + 6 Playwright Chrome E2E + 7 Live Sponsor Checks**: Full automated verification covering payment safety, guardrail policy enforcement, Neon + `localStorage` failover, sponsor integrations, live API routes, and non-shopping/injection prompts.
- **PayPal & Gemini Live Integration**: Direct network connectivity with official PayPal Sandbox (`api-m.sandbox.paypal.com`) and Google AI Studio.

---

### What's Next for AgentPay
- **Price Drop Alerts**: Automatically monitoring when previously searched items go on sale.
- **Multi-Store Orders**: Allowing users to buy items from multiple stores in a single, safe checkout.
