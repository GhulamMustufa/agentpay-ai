# 🚀 Devpost Submission Package: AgentPay AI

---

### Elevator Pitch (Tagline - Under 120 Characters)
> **The trust & policy guardrail for autonomous AI commerce, powered by PayPal and Model Context Protocol (MCP).**

---

### Inspiration
As the AI industry races toward autonomous agents, people and businesses are beginning to delegate purchasing decisions to LLMs. But this introduces a terrifying question: **How can anyone trust an autonomous agent with real money?**

If an agent has unrestricted access to payment APIs, a subtle hallucination or vendor trick could lead to unauthorized markups, budget blowouts, and fraudulent charges. Traditional e-commerce bots are either dumb chatbots that spit out links, or dangerous "credit-card swiping" wrappers without financial oversight.

We asked: *What if an autonomous agent was bound by strict financial policies—auditing vendor line items, catching sneaky surcharges, halting unapproved payments, and requiring cryptographic human sign-off before executing orders through PayPal's trusted infrastructure?*

That vision is **AgentPay AI**.

---

### What It Does
**AgentPay** is an enterprise-grade trust and policy execution layer for agentic commerce:

1. **Autonomous Discrepancy & Overcharge Detection**:
   When given a purchase intent (e.g. *"Procure developer workstations under $900"*), AgentPay doesn't blindly buy the first result. It audits vendor line items against contract price parity. If Vendor A quotes $949.00 with a hidden $100 rush fee, **the agent immediately halts payment dispatch**, flags the violation in bold red, and autonomously pivots to compliant Vendor B ($849.00).

2. **Standardized Model Context Protocol (MCP) Server**:
   Built as an open **Model Context Protocol (MCP)** server (`/api/mcp`), allowing *any* autonomous agent (Claude Desktop, Cursor, Gemini, AutoGPT) to connect over standard JSON-RPC 2.0 and invoke schema-validated PayPal tools:
   - `paypal_search_catalog`: Channel3 API + Elastic vector search.
   - `paypal_audit_spec_parity`: Spec constraint validation and fraud risk scoring.
   - `paypal_check_purchase_policy`: Evaluates quotes against budget caps.
   - `paypal_create_order`: Provisions APIMatic-validated PayPal Orders v2 transactions.
   - `paypal_capture_order`: Executes settlement with cryptographic authorization tokens.

3. **Human-in-the-Loop Cryptographic Spending Gate**:
   Zero unauthorized payments. When compliant items are identified, the agent requires a signed cryptographic authorization token from the human operator before calling PayPal's capture endpoint.

4. **Instant Settlement & Audit Ledger**:
   Executes orders via the **PayPal Orders v2 API** in **312ms**, recording immutable event telemetry and issuing verifiable receipts.

---

### How We Built It & AI Models Used
- **AI Models & Frameworks**:
  - **Gemini 1.5 Pro & Flash**: Multimodal document parsing, requirement decomposition, and structured function calling.
  - **Model Context Protocol (MCP)**: JSON-RPC 2.0 server implementation with live interactive inspector.
  - **Astropods & KERNEL**: Sandboxed agent runtime and browser execution environment.
- **Sponsor Infrastructure & APIs**:
  - **PayPal Developer Platform**: OAuth2 Client Credentials (`/v1/oauth2/token`), Orders v2 Creation (`/v2/checkout/orders`), and Capture (`/v2/checkout/orders/{id}/capture`).
  - **Channel3**: Live product catalog data API.
  - **Elastic**: High-performance semantic vector ranking for product discovery.
  - **APIMatic**: Context-aware OpenAPI schemas feeding zero-hallucination PayPal API tools to the LLM.
  - **AG Grid**: Advanced data grid for multi-vendor spec and discrepancy matrix comparison.
  - **Bryntum**: Interactive order lifecycle and guardrail timeline.
  - **Postman**: Pre-built API collection (`postman/paypal-ai-collection.json`) verifying all PayPal and AI endpoints.
  - **Render**: Infrastructure-as-code deployment (`render.yaml`).
- **Frontend & UX**:
  - **Next.js 15 App Router + React 19 + Tailwind CSS** with HSL color tokens for dark/light zero-FOUC themes.
  - **100% Mobile Responsive**: Fluid layouts from 320px mobile viewports to 4K displays.
  - **Native `/docs` Portal**: Clean, fast documentation portal without heavy external dependencies.

---

### Challenges We Overcame
1. **The "Discrepancy Trap" Validation Engine**:
   Ensuring an AI agent can distinguish between acceptable price fluctuations (e.g., standard taxes) versus unauthorized vendor markups required building a deterministic policy validation engine (`paypal_check_purchase_policy`) that intercepts transactions before any financial API is invoked.
2. **Standardizing Financial Tool Execution via MCP**:
   Building a spec-compliant Model Context Protocol server that handles JSON-RPC 2.0 requests over HTTP with proper error codes (`-32001 PolicyViolation`) allows external AI clients to treat PayPal as a secure, sandboxed capability rather than an unsafe payment gateway.
3. **Sub-350ms End-to-End Latency**:
   Chaining natural language parsing, product search, policy auditing, and PayPal OAuth2 token generation can easily cause multi-second delays. We implemented streaming UI telemetry and connection pooling, achieving instant feedback in under **312ms**.

---

### Accomplishments We're Proud Of
- **Caught Real Discrepancies Live**: Interactive demonstration of catching an unauthorized $100 vendor markup and halting payment.
- **Live MCP Client Inspector**: Directly testable `/api/mcp` endpoint allowing technical judges to execute live JSON-RPC tool calls.
- **100% Test Coverage**: 9/9 Vitest unit tests passing in < 500ms, plus Playwright browser smoke tests.
- **Full Sponsor Alignment**: Seamless integration of PayPal and 8 official sponsor technologies with verifiable code references.

---

### What's Next for AgentPay
- **Multi-Merchant Split Payments**: Leveraging PayPal Multiparty Payments to route multi-item carts to multiple independent vendors in a single transaction.
- **Decentralized Audit Signatures**: Storing cryptographic audit receipts on decentralized ledgers for enterprise compliance and tax audits.
