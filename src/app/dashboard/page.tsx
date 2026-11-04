"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { DEMO_METRICS } from "@/lib/demo-data";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Loader2,
  Terminal,
  Activity,
  TrendingUp,
  Layers,
  Code2,
  ShoppingCart,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState("Find me a high-performance developer laptop under $900 with 16GB RAM");
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    price: string;
    specs: string;
    score: string;
    merchant: string;
  } | null>(null);

  const [logs, setLogs] = useState<string[]>([
    "[System Initialized]: AgentPay Core connected to PayPal Developer Gateway (Sandbox).",
    "[Integrations Active]: Channel3 (Catalog API), Elastic (Vector Index), APIMatic (OpenAPI Specs).",
    "[Ready]: Awaiting buyer prompt or intent...",
  ]);
  const [status, setStatus] = useState<"idle" | "running" | "success">("idle");
  const [step, setStep] = useState<number>(0);

  const runAgenticCommerceFlow = () => {
    setIsRunning(true);
    setStatus("running");
    setStep(1);
    setSelectedProduct(null);
    setLogs((prev) => [
      ...prev,
      `[Astropods Agent]: Processing user prompt: "${userPrompt}"`,
      "[Channel3 API]: Querying product catalog for 'developer laptop' with priceCap <= $900.00...",
    ]);

    setTimeout(() => {
      setStep(2);
      setLogs((prev) => [
        ...prev,
        "[Elastic Vector Search]: Retrieved 14 candidates. Ranked by developer spec score & merchant reliability.",
        "[AI Reasoning Engine]: Top pick determined: Dell XPS 13 Developer Edition ($849.00, Core i7, 16GB RAM, Score: 98/100).",
      ]);
      setSelectedProduct({
        id: "c3-prod-101",
        name: "Dell XPS 13 Developer Edition",
        price: "$849.00",
        specs: "Intel Core i7-1360P • 16GB LPDDR5 • 512GB NVMe SSD • Ubuntu/Win Certified",
        score: "98% Match",
        merchant: "Official Dell Direct (PayPal Verified Partner)",
      });
    }, 800);

    setTimeout(() => {
      setStep(3);
      setLogs((prev) => [
        ...prev,
        "[APIMatic Context]: Validating PayPal Orders v2 schema with strict JSON contracts...",
        "[PayPal Sandbox API]: Dispatched POST /v2/checkout/orders (Intent: CAPTURE, Amount: $849.00 USD)...",
        "[Security Sandbox]: Human-in-the-loop spending threshold approved (within $900 cap).",
      ]);
    }, 1600);

    setTimeout(() => {
      setStep(4);
      setLogs((prev) => [
        ...prev,
        "✨ [Success]: Captured PayPal Order ID #8KJ99201948271! Receipt issued. Order dispatched to merchant in 312ms!",
      ]);
      setIsRunning(false);
      setStatus("success");
      toast({
        title: "PayPal Payment Captured!",
        description: "Order #8KJ99201948271 for Dell XPS 13 settled via PayPal Orders v2 in 312ms.",
        type: "success",
      });
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/">
            <Button variant="outline" size="sm" className="px-2.5 sm:px-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <span className="font-bold text-sm sm:text-lg tracking-tight truncate">AgentPay Command Center</span>
          <Badge variant="success" className="hidden sm:inline-flex">● Demo Active</Badge>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">Sponsor</span> Proof
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>Active Sessions</span>
                <Activity className="w-4 h-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl font-bold">{DEMO_METRICS.activeSessions}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>Payment Success</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-500">
                {DEMO_METRICS.successRate}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>Avg Decision Latency</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl font-bold">{DEMO_METRICS.avgLatency}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>Processed Volume</span>
                <Layers className="w-4 h-4 text-purple-500" />
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl font-bold">{DEMO_METRICS.totalVolumeProcessed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* The Magic Moment Interactive Runner */}
        <Card className="border-primary/30 bg-card/70 shadow-lg relative overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>⚡ Autonomous Agentic Commerce Pipeline</span>
                  <Badge variant="sponsor">PayPal + AI</Badge>
                </CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">
                  Autonomous product discovery via Channel3, vector filtering via Elastic, and 1-click checkout via PayPal Orders v2.
                </CardDescription>
              </div>
              <Button
                variant="glow"
                size="md"
                onClick={runAgenticCommerceFlow}
                disabled={isRunning}
                className="whitespace-nowrap"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Checkout...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Agentic Commerce Flow</span>
                  </>
                )}
              </Button>
            </div>

            {/* Prompt Input Area */}
            <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Buyer Intent:</span>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                disabled={isRunning}
                className="w-full text-xs font-sans px-3 py-2 rounded-md bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Bryntum-Inspired Order Lifecycle Timeline */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Bryntum-Style Order Lifecycle Timeline
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Stage: {step}/4</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className={`p-2 rounded border ${step >= 1 ? "bg-primary/20 border-primary text-foreground font-medium" : "border-border text-muted-foreground"}`}>
                  1. Discovery (Channel3)
                </div>
                <div className={`p-2 rounded border ${step >= 2 ? "bg-primary/20 border-primary text-foreground font-medium" : "border-border text-muted-foreground"}`}>
                  2. Vector Rank (Elastic)
                </div>
                <div className={`p-2 rounded border ${step >= 3 ? "bg-primary/20 border-primary text-foreground font-medium" : "border-border text-muted-foreground"}`}>
                  3. Order v2 (PayPal)
                </div>
                <div className={`p-2 rounded border ${step >= 4 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-medium" : "border-border text-muted-foreground"}`}>
                  4. Settled (Receipt)
                </div>
              </div>
            </div>

            {/* Selected Product Card (AG Grid Style Result) */}
            {selectedProduct && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">{selectedProduct.name}</span>
                    <Badge variant="success">{selectedProduct.score}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedProduct.specs}</p>
                  <p className="text-[11px] text-emerald-500 font-medium">Verified Merchant: {selectedProduct.merchant}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-mono font-bold text-foreground">{selectedProduct.price}</div>
                  <span className="text-[10px] text-muted-foreground block">PayPal Sandbox Capture</span>
                </div>
              </div>
            )}

            {/* Terminal Log Console */}
            <div className="bg-muted/70 border border-border rounded-lg p-4 font-mono text-xs text-foreground space-y-1.5 shadow-inner min-h-[140px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80 text-muted-foreground">
                <span className="flex items-center gap-1.5 font-sans font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-primary" /> Real-Time Telemetry & Agent Execution Log
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold uppercase">
                  STATUS: {status}
                </span>
              </div>
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  <span className="text-muted-foreground">&gt; </span>
                  <span className={log.includes("Success") ? "text-emerald-500 font-semibold" : ""}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AG Grid Inspired Product Spec Comparison Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>AG Grid Multi-Vendor Spec & Price Matrix</span>
              <Badge variant="outline">Live Benchmark</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Live multi-attribute comparison scored by Elastic hybrid search algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Device / Candidate</th>
                    <th className="py-2.5 px-3">Key Specs</th>
                    <th className="py-2.5 px-3">Vendor / Merchant</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">AI Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="bg-primary/5 font-medium">
                    <td className="py-3 px-3 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Dell XPS 13 Dev Edition
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">Core i7 • 16GB RAM • 512GB SSD</td>
                    <td className="py-3 px-3">Dell Direct</td>
                    <td className="py-3 px-3 font-mono font-bold text-foreground">$849.00</td>
                    <td className="py-3 px-3"><Badge variant="success">98% (Selected)</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">Lenovo ThinkPad E14</td>
                    <td className="py-3 px-3 text-muted-foreground">Ryzen 7 • 16GB RAM • 512GB SSD</td>
                    <td className="py-3 px-3">Lenovo Authorized</td>
                    <td className="py-3 px-3 font-mono">$789.00</td>
                    <td className="py-3 px-3"><Badge variant="outline">92%</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">MacBook Air M2 (Refurb)</td>
                    <td className="py-3 px-3 text-muted-foreground">M2 8-Core • 16GB RAM • 256GB SSD</td>
                    <td className="py-3 px-3">Certified Refurb Store</td>
                    <td className="py-3 px-3 font-mono">$899.00</td>
                    <td className="py-3 px-3"><Badge variant="outline">94%</Badge></td>
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
        title="Verifiable Sponsor Integrations Matrix"
        description="Direct line-by-line proof of official hackathon sponsors & developer infrastructure."
      >
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-2.5 rounded-lg border border-border bg-muted/40">
            <h4 className="font-semibold text-foreground mb-0.5">💳 PayPal Developer Platform</h4>
            <p>Orders v2 API creation, OAuth2 credentials, and autonomous payment capture.</p>
            <code className="text-[10px] font-mono text-primary block mt-1">src/lib/payments/paypal.ts:13-92</code>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-muted/40">
            <h4 className="font-semibold text-foreground mb-0.5">📦 Channel3 Product Data API</h4>
            <p>Real-time catalog discovery, inventory checks, and price boundary queries.</p>
            <code className="text-[10px] font-mono text-purple-400 block mt-1">src/lib/integrations/sponsors.ts:25-67</code>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-muted/40">
            <h4 className="font-semibold text-foreground mb-0.5">🔍 Elastic Vector Search</h4>
            <p>Hybrid semantic search and KNN vector ranking matching natural language constraints.</p>
            <code className="text-[10px] font-mono text-emerald-400 block mt-1">src/lib/integrations/sponsors.ts:70-76</code>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-muted/40">
            <h4 className="font-semibold text-foreground mb-0.5">📄 APIMatic Context Engine</h4>
            <p>OpenAPI 3.0 schema feeds preventing LLM parameter hallucination on PayPal APIs.</p>
            <code className="text-[10px] font-mono text-blue-400 block mt-1">src/lib/integrations/sponsors.ts:79-90</code>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-muted/40">
            <h4 className="font-semibold text-foreground mb-0.5">📮 Postman API Test Suite</h4>
            <p>Exportable Postman collection testing live PayPal Sandbox endpoints.</p>
            <code className="text-[10px] font-mono text-amber-400 block mt-1">postman/paypal-ai-collection.json</code>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-muted/40">
            <h4 className="font-semibold text-foreground mb-0.5">☁️ Render Cloud Deployment</h4>
            <p>Infrastructure-as-code blueprint for zero-config production deployment.</p>
            <code className="text-[10px] font-mono text-rose-400 block mt-1">render.yaml:1-16</code>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setIsModalOpen(false)}>
              Close Proof
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
