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
3. Click **"Launch Demo"** or **"Command Center"**. 
4. The system uses built-in **1-Click Guest Bypass** and activates the simulated **PayPal Developer Sandbox** mode.
5. Click **"Run Agentic Commerce Settlement"** to witness the complete autonomous flow in real-time telemetry:
   - Multimodal request parsing
   - Elastic / Channel3 product comparison
   - Budget threshold verification
   - PayPal Orders v2 Sandbox provisioning & capture

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
Runs tests across payment gateway logic, price parity calculations, and theme tokens:
```bash
npm test
```
*Expected Result: 4/4 passing suites in < 1 second.*

### 2. Playwright E2E Smoke Tests
Runs end-to-end browser tests verifying UI responsiveness, navigation, and theme toggling:
```bash
npm run test:e2e
```

### 3. Postman API Test Suite
Import `postman/paypal-ai-collection.json` into Postman to execute live calls against PayPal Sandbox OAuth2 and Orders v2 endpoints.
