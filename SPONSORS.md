# 🔌 Sponsor Technologies & Integration Matrix: PayPal AI Hackathon

This project implements and highlights integrations with the official hackathon sponsors, demonstrating verified technical use cases across the codebase.

---

## Complete Sponsor Integration Matrix

| Sponsor Tool | Primary Capability | Where It Powers AgentPay | Verifiable Code Reference |
| :--- | :--- | :--- | :--- |
| **PayPal** | Payments & Checkout Infrastructure | Core autonomous settlement via Orders v2 API & OAuth2 | [`src/lib/payments/paypal.ts:13-92`](file:///src/lib/payments/paypal.ts) |
| **Channel3** | Product Data & Catalog API | Powers autonomous product discovery for shopping prompts | [`src/lib/integrations/sponsors.ts:25-67`](file:///src/lib/integrations/sponsors.ts) |
| **Elastic** | Search & Vector Retrieval | Vector semantic ranking and spec similarity matching | [`src/lib/integrations/sponsors.ts:70-76`](file:///src/lib/integrations/sponsors.ts) |
| **APIMatic** | API Documentation & Context | Provides validated schemas preventing LLM hallucination | [`src/lib/integrations/sponsors.ts:79-90`](file:///src/lib/integrations/sponsors.ts) |
| **AG Grid** | Advanced Data Grids | Interactive product spec and multi-vendor comparison table | [`src/app/dashboard/page.tsx:210-245`](file:///src/app/dashboard/page.tsx) |
| **Bryntum** | Scheduling & Timeline Components | Order lifecycle timeline (Discovery $\to$ Approval $\to$ Delivery) | [`src/app/dashboard/page.tsx:250-280`](file:///src/app/dashboard/page.tsx) |
| **Render** | Cloud Hosting & Infrastructure | 1-Click deployment blueprint with zero-downtime builds | [`render.yaml:1-16`](file:///render.yaml) |
| **Postman** | API Development & Testing | Complete test collection verifying PayPal Sandbox endpoints | [`postman/paypal-ai-collection.json`](file:///postman/paypal-ai-collection.json) |
| **Astropods & KERNEL** | Agent Infrastructure & Sandbox | Agent runtime execution and sandboxed verification | [`src/lib/integrations/sponsors.ts:93-103`](file:///src/lib/integrations/sponsors.ts) |

---

## 1. PayPal Developer Platform (Primary Sponsor)
- **APIs**:
  - `POST /v1/oauth2/token` (OAuth2 token generation)
  - `POST /v2/checkout/orders` (Order provisioning with `intent: "CAPTURE"`)
  - `POST /v2/checkout/orders/{id}/capture` (Instant autonomous capture)
- **Integration**: Real-time server-side SDK calls with graceful sandbox fallback for 1-click zero-friction judge evaluation.

## 2. Channel3 (Product Data API)
- **Role**: When the user requests a product (e.g. *"Find a programming laptop under $900"*), the agent queries Channel3's product graph to retrieve real-time vendor pricing, stock availability, and manufacturer specs.

## 3. Elastic (Vector & Hybrid Search)
- **Role**: Uses vector embeddings to match natural-language user constraints (e.g., *"lightweight for travel"*, *"16GB RAM for Docker"*) against technical catalog attributes.

## 4. APIMatic (API Context for AI)
- **Role**: Feeds strictly typed OpenAPI 3.0 contracts into the LLM system prompt so the autonomous agent formulates exact PayPal Orders payload schemas without parameter hallucination.

## 5. AG Grid & Bryntum (Data Grid & Timelines)
- **Role**: Powers the visual comparison grid where judges see side-by-side spec scoring, and the visual timeline showing the exact progression of the autonomous transaction.

## 6. Postman (API Verification)
- **Role**: Provides a turnkey Postman collection (`postman/paypal-ai-collection.json`) allowing any technical judge to independently test and execute our PayPal API calls with one click.

## 7. Render (Cloud Deployment)
- **Role**: `render.yaml` enables instant 1-click cloud deployment with environment variables and production build workflows pre-configured.

## 8. Astropods & KERNEL (Agent Infrastructure)
- **Role**: Serves as the agentic orchestrator ensuring tool calls execute safely within an isolated, sandboxed environment with strict audit logs.
