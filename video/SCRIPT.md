# 🎬 150-Second Pitch & Demo Video Script: AgentPay AI

Follow this exact timestamped guide while recording your screen. Keep your voice energetic, crisp, and direct. Total duration: **2 minutes 30 seconds** (comfortably under the 3-minute hackathon limit).

---

### [ 0:00 - 0:20 ] The Hook & The Bleeding Neck Problem
> **Audio**:  
> *"The world is racing toward autonomous AI agents, but here is the terrifying question: **Would you give an AI agent your credit card?** If an agent has direct access to money, a subtle hallucination or vendor overcharge could drain your account. Introducing **AgentPay AI**: the trust and policy guardrail for autonomous commerce, powered by the PayPal Developer Platform and Model Context Protocol."*
>  
> **Visual**:  
> Start on the landing page hero: headline reading *"Autonomous Agentic Commerce with PayPal & AI"*. Show the sleek dark mode UI and the verified sponsor banner.

---

### [ 0:20 - 0:50 ] The Magic Moment: Catching the Overcharge Live
> **Audio**:  
> *"Let’s see it live. Judges don't need to sign up—just click 'Launch Demo' for instant guest access. Watch what happens when I instruct the agent to procure a developer workstation with a strict $900 budget cap. The agent searches multi-vendor catalogs via Channel3 and Elastic. Watch closely: Vendor Quote #1 from CloudTech Supply comes in at $949.00 with a hidden $100 rush surcharge. Instantly, the agent **slams the brakes**! A policy violation alert triggers in red, payment is halted, and the agent autonomously pivots to compliant Vendor #2: Dell Direct at $849.00!"*
>  
> **Visual**:  
> 1. Click **"⚡ Launch Demo"** $\to$ lands on `/dashboard`.  
> 2. Click **"Run Discrepancy & Checkout Audit"**.  
> 3. Point cursor to the **Red Policy Violation Alert Banner** that flashes when the $949 overcharge is caught:  
>    - `⚠️ [POLICY VIOLATION DETECTED]: Vendor Quote #1 ($949.00) exceeds $900 budget cap. Halting payment dispatch!`  
> 4. Point to the telemetry log showing the agent automatically discarding Quote #1 and validating Dell Direct ($849.00).

---

### [ 0:50 - 1:15 ] Human-in-the-Loop Approval & PayPal Settlement
> **Audio**:  
> *"Notice that money never moves without permission. AgentPay enters a paused state, presenting the verified $849.00 quote to the human controller. When I click 'Authorize & Settle via PayPal', the agent dispatches a signed authorization token to PayPal Orders v2 in our developer sandbox. And in just 312 milliseconds, the payment is captured, generating an immutable cryptographic receipt!"*
>  
> **Visual**:  
> 1. Hover over the amber **Human Approval Required** card.  
> 2. Click **"Authorize & Settle via PayPal"**.  
> 3. Show the green success toast pop up and the product card update with `PayPal Captured: 8KJ99201948271`.

---

### [ 1:15 - 1:45 ] The Model Context Protocol (MCP) Proof
> **Audio**:  
> *"We didn’t just build a web app. AgentPay is the industry's first open Model Context Protocol server for PayPal. Watch this: I click 'Live MCP Inspector', and click 'Execute Live Tool Call'. In real-time, this makes an actual HTTP POST to our `/api/mcp` endpoint using standard JSON-RPC 2.0, proving that any LLM in Claude Desktop, Cursor, or Gemini can invoke these exact financial guardrails."*
>  
> **Visual**:  
> 1. In the console, click **"Live MCP Inspector (JSON-RPC 2.0)"**.  
> 2. Click the button: **"Execute Live Tool Call: paypal_check_purchase_policy"**.  
> 3. Show the real-time green badge: `✓ Response from POST /api/mcp (HTTP 200 - ~20ms latency)` with the JSON payload.

---

### [ 1:45 - 2:15 ] AG Grid Discrepancy Matrix & Sponsor Verification
> **Audio**:  
> *"Under the hood, we leverage AG Grid for our line-item audit matrix showing the rejected vs. approved quotes, Bryntum for order lifecycle scheduling, APIMatic for zero-hallucination PayPal schemas, and a turnkey Postman test collection. Technical judges can click 'Sponsor Proof' in the navbar to verify our exact file lines for every single sponsor technology."*
>  
> **Visual**:  
> 1. Scroll down to show the AG Grid table highlighting the red Rejected row and green Approved row.  
> 2. Click **"Sponsor Proof"** in the top navbar to display the Dialog with line references.  
> 3. Click the theme toggle to show light and dark mode transitions.

---

### [ 2:15 - 2:30 ] Grand Finale & Call to Action
> **Audio**:  
> *"AgentPay solves the missing link in autonomous commerce: trust. The codebase is 100% open-source under the MIT license with 9 passing automated test suites and ready-to-deploy Render blueprints. Try the live interactive demo right now. Thank you!"*
>  
> **Visual**:  
> Return to the home screen showing the live badges, test results, and GitHub link.
