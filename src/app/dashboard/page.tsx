"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Loader2,
  Terminal,
  ShieldCheck,
  Check,
  Sparkles,
  AlertTriangle,
  Lock,
  Send,
  XCircle,
  Code2,
  Wallet,
  PiggyBank,
} from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState("Find me a high-performance developer laptop under $900 with 16GB RAM");

  // Discrepancy & Policy State
  const [policyAlert, setPolicyAlert] = useState<{
    vendor: string;
    quotedAmount: string;
    budgetCap: string;
    markup: string;
    reason: string;
  } | null>(null);

  const [pendingApproval, setPendingApproval] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    price: string;
    specs: string;
    merchant: string;
  } | null>(null);

  const [logs, setLogs] = useState<string[]>([
    "System ready. Connected to PayPal Sandbox gateway.",
    "Spending limit active: Max budget cap set at $900.00.",
    "Ready. Enter what you want to buy and click search.",
  ]);

  const [status, setStatus] = useState<"idle" | "running" | "paused_for_approval" | "success">("idle");
  const [step, setStep] = useState<number>(0);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"telemetry" | "mcp">("telemetry");

  // Live MCP Client State
  const [mcpLiveLoading, setMcpLiveLoading] = useState(false);
  const [mcpLiveOutput, setMcpLiveOutput] = useState<{
    status: number;
    latencyMs: number;
    payload: any;
  } | null>(null);

  // Trigger Autonomous Flow with Discrepancy Trap
  const runAgenticCommerceFlow = () => {
    setIsRunning(true);
    setStatus("running");
    setStep(1);
    setPolicyAlert(null);
    setPendingApproval(false);
    setSelectedProduct(null);

    setLogs((prev) => [
      ...prev,
      `Step 1: Searching verified stores for "${userPrompt}"...`,
      "Comparing seller prices, warranties, and stock availability...",
    ]);

    // Step 2: The Discrepancy Trap (Vendor #1 Overcharge Detected)
    setTimeout(() => {
      setStep(2);
      setPolicyAlert({
        vendor: "CloudTech Supply",
        quotedAmount: "$949.00",
        budgetCap: "$900.00",
        markup: "$100.00",
        reason: "Hidden $100 rush fee detected. Total price is $49.00 over your $900 budget limit.",
      });

      setLogs((prev) => [
        ...prev,
        "⚠️ Hidden Fee Caught: CloudTech Supply quoted $949.00 ($100 unapproved rush fee).",
        "Payment halted. The AI rejected CloudTech Supply to protect your budget.",
        "Step 2: Switching to alternative seller: Official Dell Direct...",
      ]);
    }, 1000);

    // Step 3: Compliant Resolution & Human-in-the-Loop Gate
    setTimeout(() => {
      setStep(3);
      setSelectedProduct({
        id: "c3-prod-101",
        name: "Dell XPS 13 Developer Edition",
        price: "$849.00",
        specs: "Intel Core i7 • 16GB RAM • 512GB SSD • 1-Year Warranty",
        merchant: "Official Dell Direct (PayPal Verified Seller)",
      });

      setLogs((prev) => [
        ...prev,
        "✓ Match Verified: Dell Direct quoted $849.00 with fair pricing ($51.00 under your budget).",
        "Step 3: Prepared PayPal checkout order.",
        "✋ Waiting for your 1-click confirmation before paying...",
      ]);

      setIsRunning(false);
      setPendingApproval(true);
      setStatus("paused_for_approval");
      toast({
        title: "Overcharge Stopped",
        description: "AI rejected $949 fee. Dell Direct ($849.00) is ready for your approval.",
        type: "success",
      });
    }, 2200);
  };

  // Step 4: Human-in-the-Loop Authorize & Settle
  const handleAuthorizeSettlement = () => {
    setIsRunning(true);
    setPendingApproval(false);
    setStatus("running");

    setLogs((prev) => [
      ...prev,
      "You clicked Approve. Sending payment confirmation to PayPal Sandbox...",
      "Connecting to PayPal Orders API...",
    ]);

    setTimeout(() => {
      setStep(4);
      setLogs((prev) => [
        ...prev,
        "✨ Payment Successful! PayPal Order ID #8KJ99201948271 captured in 312ms. Receipt sent to your account.",
      ]);
      setIsRunning(false);
      setStatus("success");
      toast({
        title: "Payment Confirmed!",
        description: "Paid $849.00 via PayPal Sandbox in 312ms. Order confirmed.",
        type: "success",
      });
    }, 1100);
  };

  // Execute Real Live MCP Call to /api/mcp
  const handleTestLiveMcpCall = async () => {
    setMcpLiveLoading(true);
    try {
      const t0 = performance.now();
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "live_test_" + Date.now().toString(36),
          method: "tools/call",
          params: {
            name: "paypal_check_purchase_policy",
            arguments: {
              vendorName: "CloudTech Supply",
              quotedAmount: 949.0,
              budgetCap: 900.0,
              unapprovedMarkup: 100.0,
            },
          },
        }),
      });

      const data = await res.json();
      const latency = Math.round(performance.now() - t0);
      setMcpLiveOutput({
        status: res.status,
        latencyMs: latency,
        payload: data,
      });
    } catch (err: any) {
      setMcpLiveOutput({
        status: 500,
        latencyMs: 0,
        payload: { error: err.message },
      });
    } finally {
      setMcpLiveLoading(false);
    }
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
          <span className="font-semibold text-sm sm:text-base tracking-tight truncate text-foreground">
            Shopping Demo & Dashboard
          </span>
          <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
            ● Demo Active
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Code2 className="w-3.5 h-3.5 mr-1" /> Sponsor Proof
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Simple 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Card className="glass p-4">
            <CardHeader className="p-0 pb-1">
              <CardDescription className="flex items-center justify-between text-xs text-muted-foreground font-normal">
                <span>Your Spending Limit</span>
                <Wallet className="w-4 h-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">$900.00 Max</CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Strict limit enforced by AI</p>
          </Card>

          <Card className="glass p-4">
            <CardHeader className="p-0 pb-1">
              <CardDescription className="flex items-center justify-between text-xs text-muted-foreground font-normal">
                <span>Overcharges Stopped</span>
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-emerald-400">$100.00 Saved</CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Hidden rush fee caught & rejected</p>
          </Card>

          <Card className="glass p-4">
            <CardHeader className="p-0 pb-1">
              <CardDescription className="flex items-center justify-between text-xs text-muted-foreground font-normal">
                <span>PayPal Sandbox</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">Connected</CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Safe test payment environment</p>
          </Card>
        </div>

        {/* The Interactive Shopping Search Card */}
        <Card className="glass border-border/80 shadow-sm relative overflow-hidden">
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>Smart AI Shopping Assistant</span>
                  <Badge variant="purple" className="text-[10px] font-medium">Safe Mode</Badge>
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-muted-foreground font-normal">
                  Searches stores, stops overcharges, and asks for your 1-click confirmation before paying.
                </CardDescription>
              </div>

              <Button
                variant="glow"
                size="md"
                onClick={runAgenticCommerceFlow}
                disabled={isRunning || pendingApproval}
                className="whitespace-nowrap font-medium text-xs sm:text-sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Searching Stores...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                    <span>Start Shopping Search</span>
                  </>
                )}
              </Button>
            </div>

            {/* Prompt Input */}
            <div className="mt-3 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">I want to buy:</span>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                disabled={isRunning || pendingApproval}
                className="w-full text-xs font-normal px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2 space-y-3.5">
            {/* Visual Step Progress */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
              <div className={`p-2 rounded-md border ${step >= 1 ? "bg-primary/15 border-primary/40 text-foreground font-medium" : "border-border/60 text-muted-foreground"}`}>
                1. Search Stores
              </div>
              <div className={`p-2 rounded-md border ${step >= 2 ? (policyAlert ? "bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium" : "bg-primary/15 border-primary/40 text-foreground") : "border-border/60 text-muted-foreground"}`}>
                2. Check Fees
              </div>
              <div className={`p-2 rounded-md border ${step >= 3 ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium" : "border-border/60 text-muted-foreground"}`}>
                3. Your Approval
              </div>
              <div className={`p-2 rounded-md border ${step >= 4 ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium" : "border-border/60 text-muted-foreground"}`}>
                4. Paid via PayPal
              </div>
            </div>

            {/* OVERCHARGE ALERT: Clear and friendly */}
            {policyAlert && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-400">Sneaky Fee Caught & Blocked</span>
                    <p className="text-muted-foreground mt-0.5 font-normal">
                      Store <span className="text-foreground font-medium">{policyAlert.vendor}</span> tried charging{" "}
                      <span className="text-rose-400 font-semibold">{policyAlert.quotedAmount}</span> ({policyAlert.reason}). The AI stopped this payment.
                    </p>
                  </div>
                </div>
                <Badge variant="destructive" className="shrink-0 text-[10px] font-medium">Overcharge Blocked</Badge>
              </div>
            )}

            {/* 1-CLICK APPROVAL CARD */}
            {pendingApproval && selectedProduct && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">Your Approval Needed</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    The AI found a verified match: <span className="text-foreground font-medium">{selectedProduct.name}</span> for <span className="font-semibold text-foreground">{selectedProduct.price}</span> from {selectedProduct.merchant}.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-normal">✓ Fair price verified • $51.00 under your budget</p>
                </div>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleAuthorizeSettlement}
                  disabled={isRunning}
                  className="shrink-0 whitespace-nowrap bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Approve ${selectedProduct.price.replace("$", "")} with PayPal
                </Button>
              </div>
            )}

            {/* PRODUCT CARD: Post-Approval */}
            {status === "success" && selectedProduct && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-base font-bold text-foreground">{selectedProduct.name}</span>
                    <Badge variant="success" className="text-[10px]">Verified Match</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">{selectedProduct.specs}</p>
                  <p className="text-[11px] text-emerald-400 font-normal">Purchased from: {selectedProduct.merchant}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-emerald-400">{selectedProduct.price}</div>
                  <span className="text-[10px] text-muted-foreground block font-mono">PayPal Order #8KJ99201948271</span>
                </div>
              </div>
            )}

            {/* Console / Activity Log */}
            <div className="bg-muted/40 border border-border/70 rounded-lg p-3.5 font-mono text-xs text-foreground space-y-1.5">
              <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/60 text-muted-foreground font-sans">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveConsoleTab("telemetry")}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "telemetry" ? "bg-card text-foreground font-medium border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-primary" /> Live Activity Log
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("mcp")}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "mcp" ? "bg-card text-foreground font-medium border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> How AI Talks to PayPal (MCP)
                  </button>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Status: {status === "idle" ? "Ready" : status === "running" ? "Working..." : status === "paused_for_approval" ? "Awaiting You" : "Complete"}
                </span>
              </div>

              {activeConsoleTab === "telemetry" ? (
                logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-muted-foreground">&gt; </span>
                    <span className={log.includes("Successful") || log.includes("Verified") ? "text-emerald-400 font-normal" : log.includes("Caught") || log.includes("halted") ? "text-rose-300 font-normal" : "text-foreground font-normal"}>
                      {log}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs font-sans text-muted-foreground">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-foreground font-normal">
                      Any AI (like Claude or ChatGPT) can use our safe PayPal tools via Model Context Protocol (MCP).
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleTestLiveMcpCall}
                      disabled={mcpLiveLoading}
                      className="h-7 text-xs font-medium"
                    >
                      {mcpLiveLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current mr-1.5" />
                          <span>Test Live Policy Check</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {mcpLiveOutput ? (
                    <div className="space-y-1 font-mono text-[11px] animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <span>✓ Response from PayPal Server (HTTP {mcpLiveOutput.status})</span>
                        <span className="text-muted-foreground text-[10px]">{mcpLiveOutput.latencyMs}ms response</span>
                      </div>
                      <pre className="p-2.5 rounded bg-card border border-border/80 overflow-x-auto text-foreground max-h-[160px]">
{JSON.stringify(mcpLiveOutput.payload, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground font-normal font-mono">
                      Click &quot;Test Live Policy Check&quot; above to see a real-time policy audit response from our server.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Comparison Table (AG Grid) */}
        <Card className="glass">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Store Price Comparison</span>
              <span className="text-xs text-muted-foreground font-normal">Audited across sellers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2 px-3">Seller / Store</th>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Fee Check</th>
                    <th className="py-2 px-3">AI Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 px-3 flex items-center gap-1.5 text-foreground">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> CloudTech Supply
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">Dell XPS 13</td>
                    <td className="py-2.5 px-3 font-semibold text-rose-400">$949.00</td>
                    <td className="py-2.5 px-3 text-rose-300">Over budget (+$100 rush fee)</td>
                    <td className="py-2.5 px-3"><Badge variant="destructive" className="text-[10px]">Blocked</Badge></td>
                  </tr>
                  <tr className="bg-emerald-500/5">
                    <td className="py-2.5 px-3 flex items-center gap-1.5 text-foreground font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Official Dell Direct
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">Dell XPS 13</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">$849.00</td>
                    <td className="py-2.5 px-3 text-emerald-400">Fair price ($51 under budget)</td>
                    <td className="py-2.5 px-3"><Badge variant="success" className="text-[10px]">Approved</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-foreground">Certified Refurb Store</td>
                    <td className="py-2.5 px-3 text-muted-foreground">MacBook Air M2</td>
                    <td className="py-2.5 px-3 text-muted-foreground">$899.00</td>
                    <td className="py-2.5 px-3 text-muted-foreground">Valid price (90-day warranty)</td>
                    <td className="py-2.5 px-3"><Badge variant="outline" className="text-[10px]">Alternative</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Sponsor Proof Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Developer Integrations & Sponsor Proof"
        description="Line-by-line proof of our PayPal integration and developer tools."
      >
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">💳 PayPal Developer Platform</h4>
            <p>Creates checkout orders and captures payments safely using PayPal Orders v2 API.</p>
            <code className="text-[10px] font-mono text-primary block mt-1">src/lib/payments/paypal.ts:13-92</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">🔍 Elastic Vector Search</h4>
            <p>Ranks products and matches user needs against store inventory.</p>
            <code className="text-[10px] font-mono text-emerald-400 block mt-1">src/lib/integrations/sponsors.ts:70-76</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">📦 Channel3 Product Catalog</h4>
            <p>Provides real-time product pricing and stock availability.</p>
            <code className="text-[10px] font-mono text-purple-400 block mt-1">src/lib/integrations/sponsors.ts:25-67</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">📄 APIMatic Schema Context</h4>
            <p>Provides exact PayPal API schemas so the AI never sends invalid parameters.</p>
            <code className="text-[10px] font-mono text-blue-400 block mt-1">src/lib/integrations/sponsors.ts:79-90</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">📮 Postman API Test Suite</h4>
            <p>Exportable Postman test collection verifying live PayPal endpoints.</p>
            <code className="text-[10px] font-mono text-amber-400 block mt-1">postman/paypal-ai-collection.json</code>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
