"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArrowLeft, BookOpen, Terminal, Code2, Layers, ShieldCheck, Copy, Check } from "lucide-react";

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
      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border/70 p-3 sm:p-5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 shrink-0 bg-card/20 md:bg-transparent">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3 hidden md:block">
            Topics
          </div>

          <button
            onClick={() => setActiveSection("quickstart")}
            className={`whitespace-nowrap md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
              activeSection === "quickstart"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" /> Quickstart
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
            <Code2 className="w-4 h-4 shrink-0" /> Endpoints & Tools
          </button>

          <button
            onClick={() => setActiveSection("sponsors")}
            className={`whitespace-nowrap md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
              activeSection === "sponsors"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" /> Sponsor Tools
          </button>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-5 sm:p-8 max-w-3xl">
          {activeSection === "quickstart" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Quickstart Guide
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  How to run AgentPay AI on your computer in under two minutes.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-xl border border-border bg-card p-4 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/70 text-muted-foreground">
                  <span>Terminal / Command Line</span>
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

              <div className="p-4 rounded-xl border border-border bg-muted/40">
                <h4 className="font-semibold text-xs text-foreground mb-1">Instant Demo Mode</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You do not need to set up live credit cards or complex keys. The project includes automated sandbox fallbacks so you can test the entire shopping and approval process right out of the box.
                </p>
              </div>
            </div>
          )}

          {activeSection === "how-it-works" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  How AgentPay Works
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  How the AI shopping assistant protects your wallet from overcharges.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                  <div className="p-3 rounded-lg border border-border/80 bg-muted/40">
                    <span className="font-semibold text-foreground text-sm block mb-1">1. You Set the Goal & Budget</span>
                    You tell the AI what you need (e.g. &quot;Developer laptop under $900&quot;). The AI sets a strict spending ceiling.
                  </div>

                  <div className="p-3 rounded-lg border border-border/80 bg-muted/40">
                    <span className="font-semibold text-foreground text-sm block mb-1">2. AI Audits the Line Items</span>
                    The AI checks store quotes. If a seller adds a sneaky $100 fee or charges more than your budget, the AI rejects it immediately.
                  </div>

                  <div className="p-3 rounded-lg border border-border/80 bg-muted/40">
                    <span className="font-semibold text-foreground text-sm block mb-1">3. You Give 1-Click Confirmation</span>
                    Once a fair price is verified, the AI presents the order for your 1-click confirmation before paying safely with PayPal.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "api" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Endpoints & Tools
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Clean endpoints allowing external apps and AI agents to connect safely.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card divide-y divide-border text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      GET
                    </span>
                    <code className="font-mono text-foreground">/api/health</code>
                  </div>
                  <span className="text-muted-foreground">Checks server health</span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      POST
                    </span>
                    <code className="font-mono text-foreground">/api/mcp</code>
                  </div>
                  <span className="text-muted-foreground">Standard AI tool runner (Model Context Protocol)</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "sponsors" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Sponsor Integrations
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  How we used official hackathon developer tools:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <span className="font-semibold text-foreground text-sm block mb-1">💳 PayPal Orders v2</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Handles order creation and capture in sandbox mode with complete test safety. Located at <code>src/lib/payments/paypal.ts</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <span className="font-semibold text-foreground text-sm block mb-1">🔍 Elastic & Channel3</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Powers product search and checks catalog stock across sellers. Located at <code>src/lib/integrations/sponsors.ts</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <span className="font-semibold text-foreground text-sm block mb-1">📮 Postman Test Suite</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Includes a ready-to-use Postman test file at <code>postman/paypal-ai-collection.json</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
