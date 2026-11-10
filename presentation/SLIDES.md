# 📊 Presentation Pitch Deck: AgentPay AI

> Interactive web deck also available at [`public/slides.html`](../public/slides.html) (navigate with `←` / `→` keys).

---

## Slide 1: Cover & Hook
- **Title**: **AgentPay AI**
- **Tagline**: *AI Agents are spending money. We keep them on a tight leash.*
- **Summary**: The Safe Payment Layer & Financial Firewall for the Agent Economy.
- **Contest**: PayPal AI Hackathon 2026 (Devpost)

---

## Slide 2: The Problem (The Trust Crisis)
- **The Issue**: Consumers and businesses want AI assistants to handle sourcing and purchasing, **but nobody trusts an LLM with raw credit-card credentials.**
- **The Risk**: One prompt injection, hallucinated parameter, or sneaky seller rush fee can drain a user's budget before they notice.

---

## Slide 3: The Solution (AgentPay AI)
- **Personal Financial Firewall**: Separates probabilistic AI discovery from deterministic policy enforcement and human-in-the-loop PayPal checkout.
- **Key Breakthrough**: Automatically flags hidden markups in red, halts overpriced vendors, switches to a verified fair-price seller, and captures payment via **PayPal Orders v2** only after **1-click confirmation**.

---

## Slide 4: How It Works in 3 Steps
1. **Search (Channel3 + Elastic + Gemini Flash)**: Finds matching products across verified stores within your spending limit.
2. **Audit (Deterministic Policy Engine + AG Grid)**: Compares line items side-by-side, blocks unauthorized surcharges (e.g., \$100 hidden fee on CloudTech Supply), and fires Zapier alerts.
3. **1-Click PayPal Settlement (APIMatic + PayPal Orders v2)**: Validates schema payloads via APIMatic and captures authorized orders via PayPal Sandbox.

---

## Slide 5: Open MCP Server & Automated Verification
- **Model Context Protocol (`/api/mcp`)**: Exposes 5 safe commerce tools (`paypal_search_catalog`, `paypal_audit_spec_parity`, `paypal_check_purchase_policy`, `paypal_create_order`, `paypal_capture_order`) to Claude, Cursor, and any external agent.
- **Battle-Tested**: Passing Vitest unit & integration suite, live API edge tests (`npm run test:edge`), Playwright E2E smoke tests, and Postman collection.

---

## Slide 6: Business Value — Why PayPal Wins
- **Trust Unlocks Conversion**: PayPal becomes the **verified trust rail** for autonomous AI commerce.
- **Zero-Friction Evaluation**: 1-Click Guest Sandbox Mode lets any user or judge experience the complete flow in under 60 seconds.

---

## Slide 7: Live Demo & Next Steps
- **Interactive Deck**: `public/slides.html`
- **Cloud Blueprint**: 1-click deployment via `render.yaml`
- **Roadmap**: Multi-store split checkouts, automated price-drop monitoring, and enterprise approval workflows via Zapier.
