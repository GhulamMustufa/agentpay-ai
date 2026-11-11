# 🎬 2-Minute Video Script & Smart Recording Guide: AgentPay AI

Follow this timestamped guide while recording your screen. Total target time: **~2 minutes** (comfortably under Devpost's 3-minute maximum).

---

## 🛠️ Smart Recording Prep (Mac Checklist)

1. **Use a clean Chrome window:** Open **`https://agentpay-ai.onrender.com`** by itself (close unrelated tabs so personal emails/messages don't appear).
2. **Hide bookmarks bar:** Press **`Cmd + Shift + B`** on Mac.
3. **Zoom for readability:** Press **`Cmd + +`** once (`110%` zoom) so text, prices, and alerts look sharp on YouTube.
4. **Warm up once first:** Click **`Try the Live Demo`**, run **`Find Best Deals Safely`** once so Render, Gemini, Channel3, Elastic, and Neon DB are warm, then click **`Home`** before pressing Record.
5. **Record cleanly:** Press **`Cmd + Shift + 5`** → **Record Selected Window** (Chrome) → select your headset/mic under **Options**. Pause 1–2 seconds between scenes so you can trim any loading wait in QuickTime (`Cmd + T`), iMovie, or CapCut.
6. **YouTube settings:** Upload as **Unlisted** or **Public** (never *Private*).

---

## 🎙️ Easy-Words Spoken Script (~2:05)

### [ 0:00 – 0:20 ] The Problem (Start on `/`)
* **Show:** Stay on `https://agentpay-ai.onrender.com/`, hover over *"Shop with AI. Never get overcharged."*
* **Say:**
  > *"Hi everyone! Today AI can search the web and shop for us—but honestly, would you give an AI your credit card? What if it falls for a hidden fee or spends over your budget? That's why we built **AgentPay AI**. It's a smart safety layer between AI shopping and your PayPal account."*

---

### [ 0:20 – 0:55 ] Catching a Sneaky Fee Live (`/dashboard`)
* **Show:**
  1. Click **`Try the Live Demo (No Sign-Up Needed)`** → lands on `/dashboard` with the laptop prompt and `$900` limit pre-filled.
  2. Click **`Find Best Deals Safely`**.
  3. Point your cursor at the **red blocked store card** (`$949.00` with `$100` hidden fee), then at the **green recommended card** (**Official Dell Direct — `$849.00`**).
* **Say:**
  > *"Judges can try this in one click with zero sign-up. Here I ask for a developer laptop with a strict $900 budget limit. When I click Find Best Deals, our AI searches real product catalogs with Channel3 and Elastic, and checks every store quote line by line. Look—Store A quoted $949 with a sneaky $100 rush fee. AgentPay immediately blocks it in red, saves me $100, and picks Official Dell Direct at $849."*

---

### [ 0:55 – 1:25 ] Your 1-Click Approval & Live PayPal Settlement
* **Show:**
  1. Click **`1-Click Approve via PayPal`**.
  2. Wait 1–2 seconds for the green success toast, then point to **`Total Saved`** updating.
  3. Click **`Past Purchases & Savings`** tab at the bottom to show the receipt saved in **Neon Postgres**.
* **Say:**
  > *"Notice the AI can never pay by itself—it always waits for my confirmation. Before creating any order, APIMatic checks the PayPal payment schema so nothing breaks. Now I click 1-Click Approve, PayPal Sandbox completes the payment right away, and the receipt is saved to our Neon Postgres database and local backup."*

---

### [ 1:25 – 1:50 ] Interactive AG Grid & Open AI Safety Tools (MCP)
* **Show:**
  1. Scroll to **`Store Price Comparison`** → type `"Dell"` in the filter box (or open a column filter / click **`Export CSV`**).
  2. Click **`PayPal AI Tools`** tab at the bottom → click **`Test Hidden-Fee Detector`** → show `Status 200` with `action: "HALT_PAYMENT"`.
* **Say:**
  > *"All store quotes and receipts run in interactive AG Grid tables so users can filter, sort, or export CSV in one click. We also built an open MCP server so external AI assistants like Claude or Cursor can use these same PayPal safety rules—and if an AI tries to overspend, our server blocks it automatically."*

---

### [ 1:50 – 2:05 ] Developer Tools & Closing
* **Show:** Briefly click **`Developer Tools`** in the top navbar for 3 seconds to show all sponsor integrations (PayPal, Channel3, Elastic, APIMatic, AG Grid, Zapier, Neon, Render, Postman), then return cleanly to `/`.
* **Say:**
  > *"We deployed live on Render with 43 unit tests, 6 browser E2E tests, a Postman suite, and full Zapier alerts. You can test the live demo right from our Devpost link—thanks for watching!"*
