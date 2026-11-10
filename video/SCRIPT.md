# 🎬 150-Second Video Script: AgentPay AI

Follow this timestamped guide while recording your screen. Keep your voice conversational, confident, and natural. Total time: **2 minutes 30 seconds** (well under Devpost's 3-minute limit).

---

### [ 0:00 - 0:25 ] The Hook: The Real Problem
> **What you say**:  
> *"Would you give an AI assistant your credit card? Probably not. People want to use AI to find products and deals, but nobody trusts an AI with their bank account. What if it gets tricked by a hidden fee or overspends your budget? That is why we built **AgentPay AI**: the financial firewall for AI shopping powered by PayPal. It searches catalogs via Channel3 and Elastic, catches hidden fees in real time, and requires your 1-click approval before paying."*
>  
> **What you show**:  
> Start on the homepage (`/`): headline reading *"Shop with AI. Never get overcharged."* Show the clean design and click the theme toggle once to demonstrate dark and light themes.

---

### [ 0:25 - 0:55 ] The Magic Moment: Catching the Sneaky Fee Live
> **What you say**:  
> *"Let's see it in action. Judges can test this immediately with zero sign-up. I click 'Try the Live Demo', which opens our dashboard with a $900 spending limit. When I click 'Find Best Deals Safely', our 3-agent pipeline searches verified stores via Channel3 and ranks specs with Elastic. Store A, CloudTech Supply, quotes $949.00 with a hidden $100 rush fee. Instantly, our Fee Inspector **stops the purchase**, logs a Zapier alert, and switches to Official Dell Direct at $849.00."*
>  
> **What you show**:  
> 1. Click **"Try the Live Demo (No Sign-Up Needed)"** $\to$ lands on `/dashboard`.  
> 2. Click **"Find Best Deals Safely"**.  
> 3. Point cursor to the **red alert banner**:  
>    `Overpriced Store Blocked: CloudTech Supply $949.00 ($49 over your budget • $100 hidden fee)`  
> 4. Point to the emerald **Best Fair Price Found** card for **Official Dell Direct ($849.00)**.

---

### [ 0:55 - 1:20 ] Your 1-Click Approval & APIMatic + PayPal Settlement
> **What you say**:  
> *"Notice that the AI can never spend money on its own. Before creating an order, APIMatic validates the PayPal Orders v2 schema so the AI never hallucinates invalid fields. When I click '1-Click Approve via PayPal', the order is created and captured via PayPal Sandbox in milliseconds, updating our savings ledger and firing a Zapier webhook."*
>  
> **What you show**:  
> 1. Click **"1-Click Approve via PayPal"** on the approval card.  
> 2. Show the green success toast: *"Payment Successful! Paid $849.00 via PayPal..."*  
> 3. Show **Total Saved** and the **Live Activity Log** updating with the PayPal Order ID and Zapier event.

---

### [ 1:20 - 1:50 ] AG Grid Comparison & Open MCP Server
> **What you say**:  
> *"Down below, our Store Price Comparison and Past Purchases ledger are powered by AG Grid—giving users sortable columns, live filtering, and 1-click CSV export. We also expose an open Model Context Protocol server at `/api/mcp`. Clicking 'PayPal AI Tools' and 'Test Hidden-Fee Detector' shows a live JSON-RPC safety check that external AI assistants like Claude or Cursor can call directly."*
>  
> **What you show**:  
> 1. Type in the **AG Grid** filter box (`Filter stores, specs, or fees...`) and show **Export CSV**.  
> 2. In the bottom console, click **"PayPal AI Tools"** $\to$ click **"Test Hidden-Fee Detector"**.  
> 3. Show the live green response: `✓ Response from PayPal Server (Status 200)` with `action: "HALT_PAYMENT"`.

---

### [ 1:50 - 2:15 ] Developer Tools & Architecture
> **What you say**:  
> *"Technical judges can click 'Developer Tools' in the header to verify exact file references for PayPal Orders v2, Channel3, AG Grid, APIMatic, Elastic, Zapier, our Postman collection, and our Render cloud blueprint."*
>  
> **What you show**:  
> 1. Click **"Developer Tools"** in the top navbar to display the sponsor integration cards.  
> 2. Click **"API Keys"** briefly to show optional live Gemini, PayPal Sandbox, and Zapier Catch Hook inputs.

---

### [ 2:15 - 2:30 ] Wrap-Up & Closing
> **What you say**:  
> *"AgentPay AI makes autonomous commerce safe, transparent, and trustworthy—backed by 43 automated unit tests, 7 live sponsor checks, 6 Playwright E2E scenarios, and zero-setup sandbox access. Try the live demo on Devpost today. Thank you!"*
>  
> **What you show**:  
> Return to the homepage showing the live demo link and GitHub repository.
