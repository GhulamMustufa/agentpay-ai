# 🧪 Testing Guide & Sandbox Credentials: AgentPay AI

This guide contains everything required for judges to run, test, and verify **AgentPay** locally or in production.

---

## ⚡ Quick Test (Zero-Config 1-Click Guest Mode)

You do **not** need to register an account or enter live credit cards to test the system:

1. **Start the App**:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000`.
3. Click **"Open Demo"** on the homepage. 
4. The system opens with **1-Click Guest Access** and activates the simulated **PayPal Developer Sandbox** mode.
5. Click **"Start Shopping Search"** to see the full flow:
   - Searches products across stores
   - Catches the hidden $100 fee on CloudTech Supply and halts
   - Switches to Dell Direct ($849.00) and asks for your 1-click confirmation
   - Captures order in 312ms via PayPal Orders v2 Sandbox

---

## 🔑 PayPal Sandbox Developer Credentials

If you wish to test with your own PayPal Developer account:

1. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
2. Insert your PayPal Sandbox credentials from [developer.paypal.com](https://developer.paypal.com):
   ```env
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
   ```
3. Test Personal Buyer Sandbox Account:
   - **Email**: `sb-buyer-agentpay@business.example.com`
   - **Password**: `TestPass123!` (or use your own sandbox test buyer)

---

## 🤖 Automated Test Suites

### 1. Vitest Unit & Integration Tests
Runs tests across payment gateway logic, policy checks, and MCP server endpoints:
```bash
npm test
```
*Expected Result: 26/26 passing tests in < 800ms.*

### 2. Live API Edge-Case Tests
Runs live tests against real PayPal Sandbox and Google Gemini endpoints verifying non-shopping queries, unrealistic low budgets, prompt injection resistance, and order lifecycles:
```bash
npm run test:edge
```
*Expected Result: 4/4 passing tests.*

### 3. Postman API Test Suite
Import `postman/paypal-ai-collection.json` into Postman to execute live calls against PayPal Sandbox OAuth2 and Orders v2 endpoints.
