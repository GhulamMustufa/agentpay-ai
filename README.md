# ⚡ AgentPay AI

> **The smart AI shopping assistant that checks prices, catches hidden fees, and asks for your 1-click approval before paying with PayPal.**

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-blue)](http://localhost:3000)
[![PayPal Integration](https://img.shields.io/badge/PayPal-Orders%20v2-emerald)](./SPONSORS.md)
[![Tests](https://img.shields.io/badge/Tests-9%20Passing-purple)](./tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🎯 The Idea in 30 Seconds

People are starting to use AI assistants to find products. But **how can you trust an AI with your money?** What if the AI buys the wrong item, falls for an unapproved fee, or overspends your budget?

**AgentPay acts as a personal financial guardrail:**
1. **You set the goal & budget:** *"Find me a developer laptop under $900."*
2. **AI checks prices & fees:** The AI compares sellers. If a seller adds a hidden $100 fee, the AI **halts the purchase** and switches to a fair seller.
3. **You click Approve:** The AI never moves money on its own. You give 1-click confirmation, and it pays safely through PayPal.

```
[ What You Want to Buy + Spending Limit ]
                   │
                   ▼
       [ AI Compares Store Quotes ]
                   │
                   ▼
     [ Catches Hidden Fees & Markups ]  ──► (Halts overcharges automatically)
                   │
                   ▼
        [ Your 1-Click Approval ]
                   │
                   ▼
[ Safe Payment Captured via PayPal Sandbox in 312ms ]
```

---

## 🚀 Quickstart: Run in 60 Seconds

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser:
# http://localhost:3000
```

*Note: You do not need live credit cards or paid API keys. The app runs out-of-the-box in safe sandbox simulation mode.*

---

## 🧪 Automated Tests

```bash
# Run unit tests (All 9 tests pass in < 500ms)
npm test

# Run browser smoke tests
npm run test:e2e
```

---

## 🛠️ How It's Built

- **Frontend:** Next.js 15, React 19, Tailwind CSS (Comfortable Soft Charcoal Dark & Soft Light themes).
- **Payment Engine:** PayPal Developer Platform (Orders v2 API & OAuth2).
- **Product Search:** Elastic vector search & Channel3 catalog adapter.
- **Safety Protocol:** Model Context Protocol (MCP) server running at `/api/mcp`.
- **API Tests:** Ready-to-import Postman test collection in `postman/paypal-ai-collection.json`.

---

## 📄 License

Open-source under the [MIT License](./LICENSE). Built for the PayPal AI Hackathon 2026.
