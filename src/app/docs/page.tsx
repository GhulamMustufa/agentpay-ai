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

              {/* PayPal Sandbox Setup Guide Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">How to Connect Free PayPal Sandbox Keys</h3>
                  <Badge variant="success" className="text-[10px]">Free Developer Account</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                  The app runs out-of-the-box in simulated sandbox mode. If you want to make live API calls to PayPal servers:
                </p>

                <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground pl-1 font-normal">
                  <li>Go to <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="text-primary underline">developer.paypal.com</a> and sign in with any PayPal account.</li>
                  <li>Click <strong>Dashboard</strong> &rarr; <strong>Apps & Credentials</strong> &rarr; Make sure <strong>Sandbox</strong> toggle is active.</li>
                  <li>Click <strong>Create App</strong> (App Name: <em>AgentPay</em> &rarr; App Type: <em>Merchant</em>).</li>
                  <li>Copy your <strong>Client ID</strong> and <strong>Secret</strong>.</li>
                  <li>Create a <code>.env.local</code> file in the project root:</li>
                </ol>

                <div className="rounded-lg border border-border/70 bg-muted/50 p-3 font-mono text-[11px] text-foreground">
                  <div>PAYPAL_MODE=sandbox</div>
                  <div>PAYPAL_CLIENT_ID=your_sandbox_client_id_here</div>
                  <div>PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here</div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  💡 You can also paste these keys directly inside the Dashboard by clicking <strong>&quot;Custom Keys&quot;</strong> in the top navigation bar.
                </p>
              </div>

              {/* Running Tests Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Automated Tests (14/14 Passing)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                  Run <code>npm test</code> to execute all 14 automated unit tests covering payment safety, overcharge detection, non-shopping queries, and Model Context Protocol (MCP) tool execution.
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
                  <h3 className="font-semibold text-foreground text-sm">AI Compares Real Stores & Line Items</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The AI searches verified stores using Elastic vector search, checking specs, stock, and seller ratings.
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
                        <td className="py-2 pl-3 text-emerald-400">PayPal Orders v2 with 1-click approval</td>
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
                    <p className="text-muted-foreground text-[11px] mt-0.5">Searches verified stores for products matching user needs and budget constraints.</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">Search</Badge>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-rose-400 font-semibold text-xs">paypal_check_purchase_policy</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Audits store quotes. Detects unauthorized fees and halts if budget limit is exceeded.</p>
                  </div>
                  <Badge variant="destructive" className="text-[10px] shrink-0">Guardrail</Badge>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-blue-400 font-semibold text-xs">paypal_create_order</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Prepares a PayPal Orders v2 transaction with strict schema validation.</p>
                  </div>
                  <Badge variant="sponsor" className="text-[10px] shrink-0">Checkout</Badge>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <code className="text-emerald-400 font-semibold text-xs">paypal_capture_order</code>
                    <p className="text-muted-foreground text-[11px] mt-0.5">Captures payment only when a signed human approval token is provided.</p>
                  </div>
                  <Badge variant="success" className="text-[10px] shrink-0">Settlement</Badge>
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
                    Direct integration with PayPal Orders v2 REST API (`/v2/checkout/orders`) with OAuth2 client credentials and automated capture.
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
                    Ranks products and matches user needs against store inventory using semantic search.
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
                    Provides multi-store product data, live price comparisons, and stock verification.
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
                    Feeds strictly typed OpenAPI 3.0 contracts to the AI so it never makes invalid parameter calls.
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
                    Powers the multi-store price and spec comparison table on the dashboard.
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
                    Drives the 4-stage visual progress tracker on the dashboard.
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
                    Includes a ready-to-import Postman test collection verifying live PayPal endpoints.
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
                    Infrastructure-as-code configuration for 1-click zero-downtime deployment.
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
