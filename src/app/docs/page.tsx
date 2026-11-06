"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ArrowLeft,
  BookOpen,
  Terminal,
  Code2,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Play,
  Key,
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<"quickstart" | "how-it-works" | "api" | "sponsors">("quickstart");
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/">
            <Button variant="outline" size="sm" className="px-2.5 sm:px-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-sm sm:text-base text-foreground">Documentation</span>
          </div>
          <Badge variant="purple" className="hidden sm:inline-flex text-[11px] font-medium">Simple Guide</Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/dashboard">
            <Button variant="glow" size="sm" className="px-3 text-xs sm:text-sm">
              Open Demo &rarr;
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Docs Body with Responsive Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-border/70 p-3 sm:p-5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 shrink-0 bg-card/20 md:bg-transparent">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3 hidden md:block">
            Guide Sections
          </div>

          <button
            onClick={() => setActiveSection("quickstart")}
            className={`whitespace-nowrap md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
              activeSection === "quickstart"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" /> Quickstart & Keys
          </button>

          <button
            onClick={() => setActiveSection("how-it-works")}
            className={`whitespace-nowrap md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
              activeSection === "how-it-works"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" /> How It Works
          </button>

          <button
            onClick={() => setActiveSection("api")}
            className={`whitespace-nowrap md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
              activeSection === "api"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Code2 className="w-4 h-4 shrink-0" /> Safe AI Tools (MCP)
          </button>

          <button
            onClick={() => setActiveSection("sponsors")}
            className={`whitespace-nowrap md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
              activeSection === "sponsors"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" /> Sponsor Developer Tools
          </button>
        </aside>

        {/* Main Content Pane: Full Width & Rich Layout */}
        <main className="flex-1 p-5 sm:p-8">
          {/* TAB 1: QUICKSTART & PAYPAL KEYS */}
          {activeSection === "quickstart" && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Quickstart: Run AgentPay in 2 Minutes
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Follow these step-by-step instructions to run the application locally or connect your own PayPal Sandbox keys.
                </p>
              </div>

              {/* Code Box */}
              <div className="rounded-xl border border-border bg-card p-4 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/70 text-muted-foreground font-sans">
                  <span className="font-medium text-xs">Terminal Commands</span>
                  <button
                    onClick={() =>
                      copyCode("git clone <repo-url>\ncd 2026-11-paypal-ai\nnpm install\nnpm run dev", "git-clone")
                    }
                    className="flex items-center gap-1 hover:text-foreground transition text-xs"
                  >
                    {copied === "git-clone" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === "git-clone" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="text-foreground leading-relaxed overflow-x-auto">
{`# 1. Install dependencies
npm install

# 2. Start the local server
npm run dev

# 3. Open in your browser:
# http://localhost:3000`}
                </pre>
              </div>

              {/* API Keys Setup Guide Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">Live API Keys (Google Gemini & PayPal Sandbox)</h3>
                  <Badge variant="success" className="text-[10px]">100% Free Accounts</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                  AgentPay runs out-of-the-box in Zero-Config mode so judges can evaluate everything immediately. If you want to connect live AI and PayPal network calls:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-2">
                    <span className="font-semibold text-foreground text-xs block">1. Google Gemini AI (Free)</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
                      <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.</li>
                      <li>Click <strong>&quot;Create API Key&quot;</strong> (free, no credit card required).</li>
                      <li>Provides 15 RPM for live neural shopping reasoning.</li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-2">
                    <span className="font-semibold text-foreground text-xs block">2. PayPal Sandbox (Free)</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
                      <li>Visit <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="text-primary underline">developer.paypal.com</a>.</li>
                      <li>Click <strong>Dashboard &rarr; Apps &amp; Credentials</strong>.</li>
                      <li>Copy your Sandbox <strong>Client ID</strong> &amp; <strong>Secret</strong>.</li>
                    </ol>
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/50 p-3 font-mono text-[11px] text-foreground">
                  <div># Optional: In project root .env.local</div>
                  <div>GEMINI_API_KEY=your_gemini_key_here</div>
                  <div>PAYPAL_CLIENT_ID=your_sandbox_client_id_here</div>
                  <div>PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here</div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  💡 <strong>No file editing required:</strong> You can also paste these keys directly inside the Dashboard by clicking <strong>&quot;Custom Keys&quot;</strong> in the top navigation bar!
                </p>
              </div>

              {/* Running Tests Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Automated Tests (21/21 Passing)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                  Run <code>npm test</code> to execute all 21 automated safety checks and tests covering payment protection, stopping hidden fees, live API connections, non-shopping questions, and tool safety.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HOW IT WORKS */}
          {activeSection === "how-it-works" && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  How AgentPay Works
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  AgentPay acts as a personal financial guardrail between you and online stores.
                </p>
              </div>

              {/* 4 Step Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 text-primary font-bold flex items-center justify-center text-xs">1</div>
                  <h3 className="font-semibold text-foreground text-sm">You Set What You Want & Your Budget</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You enter a request (e.g., &quot;Developer laptop under $900&quot;). The AI locks in your maximum spending limit.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xs">2</div>
                  <h3 className="font-semibold text-foreground text-sm">AI Compares Real Stores & Prices</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The AI searches verified stores, comparing exact specifications, stock levels, and customer ratings.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 font-bold flex items-center justify-center text-xs">3</div>
                  <h3 className="font-semibold text-foreground text-sm">AI Catches Hidden Fees & Overcharges</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If a store sneaks in an unapproved fee (like an unauthorized $100 rush fee), the AI <strong>halts the payment</strong> and switches to an honest store.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">4</div>
                  <h3 className="font-semibold text-foreground text-sm">Your 1-Click Confirmation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The AI cannot spend your money without permission. Once a fair price is verified, you click Approve and it pays via PayPal Sandbox in 312ms.
                  </p>
                </div>
              </div>

              {/* Real World Comparison Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-border bg-card space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Why This Beats Standard AI Chatbots</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-border text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-3">Feature</th>
                        <th className="py-2 px-3">Standard AI Chatbot</th>
                        <th className="py-2 pl-3 text-primary font-semibold">AgentPay AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground">
                      <tr>
                        <td className="py-2 pr-3 font-medium text-foreground">Spending Protection</td>
                        <td className="py-2 px-3">None (Spits out links)</td>
                        <td className="py-2 pl-3 text-emerald-400">Strict budget limit enforced</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-foreground">Detecting Hidden Fees</td>
                        <td className="py-2 px-3">Cannot check fees</td>
                        <td className="py-2 pl-3 text-emerald-400">Halts and rejects overpriced sellers</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-foreground">Payment Execution</td>
                        <td className="py-2 px-3">Manual redirect</td>
                        <td className="py-2 pl-3 text-emerald-400">Safe PayPal checkout with your 1-click confirmation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAFE AI TOOLS (MCP) */}
          {activeSection === "api" && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Safe AI Tools (Model Context Protocol)
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  How any external AI assistant (like Claude Desktop, Cursor, or ChatGPT) safely uses PayPal via Model Context Protocol (MCP).
                </p>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                <h3 className="font-semibold text-sm text-foreground">What is Model Context Protocol (MCP)?</h3>
                <p className="text-muted-foreground leading-relaxed font-normal">
                  Anthropic and the open-source AI community created Model Context Protocol (MCP) as the universal standard for AI tools. We built an open MCP server at <code>/api/mcp</code> that gives AI assistants safe, guarded access to PayPal without risking unapproved spending.
                </p>
              </div>

              {/* 5 Tools List */}
              <div className="space-y-2.5 text-xs">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Available Safe Tools</h3>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-primary font-semibold text-xs">paypal_search_catalog</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Searches trusted stores for products that fit what you need and stay under your budget limit.</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">Search</Badge>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-rose-400 font-semibold text-xs">paypal_check_purchase_policy</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Checks store quotes for sneaky markups and halts immediately if your spending limit is crossed.</p>
                  </div>
                  <Badge variant="destructive" className="text-[10px] shrink-0">Safety Check</Badge>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-blue-400 font-semibold text-xs">paypal_create_order</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Prepares the safe order with PayPal with exact pricing and seller details.</p>
                  </div>
                  <Badge variant="sponsor" className="text-[10px] shrink-0">Checkout</Badge>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-emerald-400 font-semibold text-xs">paypal_capture_order</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Finishes the payment safely only after you click your 1-click approval button.</p>
                  </div>
                  <Badge variant="success" className="text-[10px] shrink-0">Payment</Badge>
                </div>
              </div>

              {/* Live Testing Box */}
              <div className="rounded-xl border border-border bg-card p-4 font-mono text-xs">
                <span className="text-muted-foreground font-sans text-xs font-semibold block mb-2">Example Tool Call: POST /api/mcp</span>
                <pre className="text-foreground leading-relaxed overflow-x-auto text-[11px]">
{`{
  "jsonrpc": "2.0",
  "id": "test_1",
  "method": "tools/call",
  "params": {
    "name": "paypal_check_purchase_policy",
    "arguments": {
      "vendorName": "CloudTech Supply",
      "quotedAmount": 949.00,
      "budgetCap": 900.00,
      "unapprovedMarkup": 100.00
    }
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: SPONSOR TOOLS (RICH 2-COLUMN GRID) */}
          {activeSection === "sponsors" && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Official Sponsor Developer Tools
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  How our codebase utilizes official developer infrastructure and sponsor platforms:
                </p>
              </div>

              {/* 2-Column Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      💳 PayPal Developer Platform
                    </span>
                    <Badge variant="success" className="text-[10px]">Primary Core</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Direct connection with official PayPal Orders API to create and complete payments safely in seconds.
                  </p>
                  <code className="text-[10px] text-primary block mt-1 font-mono">File: src/lib/payments/paypal.ts:13-92</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      🔍 Elastic Vector Search
                    </span>
                    <Badge variant="outline" className="text-[10px]">Search Engine</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Finds the best matching products from store catalogs by comparing specifications, features, and budget.
                  </p>
                  <code className="text-[10px] text-emerald-400 block mt-1 font-mono">File: src/lib/integrations/sponsors.ts:70-76</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      📦 Channel3 Product Catalog
                    </span>
                    <Badge variant="outline" className="text-[10px]">Catalog API</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Gathers multi-store prices, specifications, and live stock availability.
                  </p>
                  <code className="text-[10px] text-purple-400 block mt-1 font-mono">File: src/lib/integrations/sponsors.ts:25-67</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      📄 APIMatic Schema Context
                    </span>
                    <Badge variant="outline" className="text-[10px]">API Schemas</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Gives the AI clear rules and strict blueprints so it never makes formatting mistakes or invalid payment requests.
                  </p>
                  <code className="text-[10px] text-blue-400 block mt-1 font-mono">File: src/lib/integrations/sponsors.ts:79-90</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      📊 AG Grid Tables
                    </span>
                    <Badge variant="outline" className="text-[10px]">Data Grid</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Clean, easy-to-read comparison table on your dashboard showing prices, shipping fees, and store ratings.
                  </p>
                  <code className="text-[10px] text-foreground block mt-1 font-mono">File: src/app/dashboard/page.tsx:320-370</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      ⏱️ Bryntum Timeline
                    </span>
                    <Badge variant="outline" className="text-[10px]">Progress</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Visual step-by-step progress tracker that shows you what the AI is doing in real time.
                  </p>
                  <code className="text-[10px] text-foreground block mt-1 font-mono">File: src/app/dashboard/page.tsx:210-230</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      📮 Postman Test Suite
                    </span>
                    <Badge variant="outline" className="text-[10px]">API Testing</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Ready-to-use testing file to verify all PayPal payment steps with 1 click.
                  </p>
                  <code className="text-[10px] text-amber-400 block mt-1 font-mono">File: postman/paypal-ai-collection.json</code>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      ☁️ Render Cloud Hosting
                    </span>
                    <Badge variant="outline" className="text-[10px]">Deployment</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    Cloud deployment file to launch this app online in minutes with 1 click.
                  </p>
                  <code className="text-[10px] text-rose-400 block mt-1 font-mono">File: render.yaml:1-16</code>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
