# 🔌 Sponsor Technologies & Integration Matrix: PayPal AI Hackathon

This project implements verified, testable integrations with official hackathon sponsors—every entry below maps to live code in the repository.

---

## Verified Sponsor Integration Matrix

| Sponsor Tool | Primary Capability | Where It Powers AgentPay | Verifiable Code Reference |
| :--- | :--- | :--- | :--- |
| **PayPal** | Payments & Checkout Infrastructure | Orders v2 creation, OAuth2 auth, and capture settlement | [`src/lib/payments/paypal.ts:3-121`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/payments/paypal.ts#L3-L121) |
| **Channel3** | Product Data & Catalog API | Live Channel3 search connector (`POST api.trychannel3.com/v1/search`) with fallback | [`src/lib/integrations/sponsors.ts:40-171`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/integrations/sponsors.ts#L40-L171) |
| **AG Grid** | Enterprise Data Grids (`ag-grid-react`) | Sortable, filterable Store Price Comparison & Audit Ledger grids with CSV export | [`src/components/grids/StoreComparisonGrid.tsx`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/components/grids/StoreComparisonGrid.tsx) |
| **APIMatic** | API Context & Schema Validation | Injects PayPal Orders v2 OpenAPI contract into prompts & validates order payloads | [`src/lib/integrations/sponsors.ts:248-326`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/integrations/sponsors.ts#L248-L326) |
| **Elastic** | Hybrid Search & Relevance | Elasticsearch cluster search (`ELASTICSEARCH_URL`) + local BM25/spec ranking | [`src/lib/integrations/sponsors.ts:173-246`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/integrations/sponsors.ts#L173-L246) |
| **Zapier** | Workflow & Webhook Automation | Real-time Catch Hook alerts when hidden fees are blocked or PayPal orders capture | [`src/lib/integrations/sponsors.ts:328-380`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/integrations/sponsors.ts#L328-L380) • [`src/app/api/zapier/webhook/route.ts`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/app/api/zapier/webhook/route.ts) |
| **Render** | Cloud Hosting & Infrastructure | 1-click deployment blueprint with pre-configured environment variables | [`render.yaml:1-28`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/render.yaml#L1-L28) |
| **Postman** | API Development & Testing | Turnkey collection verifying PayPal Sandbox endpoints | [`postman/paypal-ai-collection.json`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/postman/paypal-ai-collection.json) |

---

## 1. PayPal Developer Platform (Primary Sponsor)
- **APIs**:
  - `POST /v1/oauth2/token` (OAuth2 token generation)
  - `POST /v2/checkout/orders` (Order provisioning with `intent: "CAPTURE"`)
  - `POST /v2/checkout/orders/{id}/capture` (Instant authorized capture)
- **Integration**: Real-time server-side calls in [`PayPalPaymentGateway`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/payments/paypal.ts#L3-L121) with zero-friction sandbox fallback for 1-click judge evaluation.

## 2. Channel3 (Product Data API)
- **Role**: Queries Channel3 (`POST https://api.trychannel3.com/v1/search` with `x-api-key`) in both [`/api/ai/analyze`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/app/api/ai/analyze/route.ts) and the MCP tool `paypal_search_catalog`, falling back gracefully to a curated multi-category catalog when `CHANNEL3_API_KEY` is omitted.

## 3. AG Grid (`ag-grid-react` & `ag-grid-community` v36)
- **Role**: Powers both [`StoreComparisonGrid`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/components/grids/StoreComparisonGrid.tsx) and [`LedgerHistoryGrid`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/components/grids/LedgerHistoryGrid.tsx) with theme-aware dark/light styling, quick search filtering, column sorting, inline policy violation badges, and 1-click CSV export.

## 4. APIMatic (OpenAPI Schema Context & Runtime Guard)
- **Role**: Provides the PayPal Orders v2 OpenAPI contract (`APIMatic.getPayPalContextPrompt()`) directly inside the Gemini procurement prompt and enforces strict runtime schema validation (`APIMatic.validatePayPalOrderPayload()`) inside both [`PayPalPaymentGateway.createOrder`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/lib/payments/paypal.ts#L42-L60) and the MCP server before any order is dispatched.

## 5. Elastic (Hybrid Search & Relevance Ranking)
- **Role**: Ranks product candidates from Channel3 against natural-language user prompts using live Elasticsearch `_search` when `ELASTICSEARCH_URL` + `ELASTICSEARCH_API_KEY` are configured, or local BM25-style token + spec relevance scoring in zero-config mode.

## 6. Zapier (Automated Alerts & Reconciliation)
- **Role**: Dispatches structured JSON webhook events (`POLICY_OVERCHARGE_BLOCKED` and `PAYPAL_ORDER_CAPTURED`) through [`/api/zapier/webhook`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/src/app/api/zapier/webhook/route.ts) so users can route blocked-fee alerts to Slack or log verified PayPal receipts to Google Sheets.

## 7. Postman & Render
- **Postman**: Ready-to-import test suite in [`postman/paypal-ai-collection.json`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/postman/paypal-ai-collection.json).
- **Render**: Production blueprint in [`render.yaml`](file:///Users/mac/Desktop/hackathones/active/2026-11-paypal-ai/render.yaml) supporting 1-click deployment.
