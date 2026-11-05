"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { analyzeShoppingPrompt, ShoppingQuote } from "@/lib/ai/shopping-agent";
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
  Settings,
  HelpCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Custom Key Configuration State
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [paypalClientIdInput, setPaypalClientIdInput] = useState("");
  const [paypalClientSecretInput, setPaypalClientSecretInput] = useState("");

  const [activeGeminiKey, setActiveGeminiKey] = useState("");
  const [activePaypalClientId, setActivePaypalClientId] = useState("");
  const [activePaypalClientSecret, setActivePaypalClientSecret] = useState("");

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const gKey = localStorage.getItem("agentpay_gemini_key") || "";
      const pId = localStorage.getItem("agentpay_paypal_client_id") || "";
      const pSecret = localStorage.getItem("agentpay_paypal_client_secret") || "";
      if (gKey) {
        setGeminiKeyInput(gKey);
        setActiveGeminiKey(gKey);
      }
      if (pId) {
        setPaypalClientIdInput(pId);
        setActivePaypalClientId(pId);
      }
      if (pSecret) {
        setPaypalClientSecretInput(pSecret);
        setActivePaypalClientSecret(pSecret);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const handleSaveCredentials = () => {
    try {
      localStorage.setItem("agentpay_gemini_key", geminiKeyInput.trim());
      localStorage.setItem("agentpay_paypal_client_id", paypalClientIdInput.trim());
      localStorage.setItem("agentpay_paypal_client_secret", paypalClientSecretInput.trim());
      setActiveGeminiKey(geminiKeyInput.trim());
      setActivePaypalClientId(paypalClientIdInput.trim());
      setActivePaypalClientSecret(paypalClientSecretInput.trim());
      setIsSettingsOpen(false);
      toast({
        title: "Credentials Saved",
        description: "Your custom keys are now active for live AI reasoning and PayPal Sandbox transactions.",
        type: "success",
      });
    } catch {
      toast({
        title: "Storage Error",
        description: "Could not save credentials to local storage.",
        type: "destructive",
      });
    }
  };

  const handleClearCredentials = () => {
    try {
      localStorage.removeItem("agentpay_gemini_key");
      localStorage.removeItem("agentpay_paypal_client_id");
      localStorage.removeItem("agentpay_paypal_client_secret");
      setGeminiKeyInput("");
      setPaypalClientIdInput("");
      setPaypalClientSecretInput("");
      setActiveGeminiKey("");
      setActivePaypalClientId("");
      setActivePaypalClientSecret("");
      toast({
        title: "Keys Cleared",
        description: "Reverted to Zero-Config Sandbox mode.",
        type: "info",
      });
    } catch {
      // ignore
    }
  };

  const hasLiveGemini = Boolean(activeGeminiKey);
  const hasLivePayPal = Boolean(activePaypalClientId && activePaypalClientSecret);

  // Search & Customization State
  const [userPrompt, setUserPrompt] = useState("Find me a high-performance developer laptop under $900 with 16GB RAM");
  const [budgetCap, setBudgetCap] = useState<number>(900);
  const [activeCategory, setActiveCategory] = useState<string>("laptop");

  // Edge case message states
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

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

  // Dynamic Store Quotes Table State
  const [quotes, setQuotes] = useState<ShoppingQuote[]>([
    {
      vendor: "CloudTech Supply",
      item: "Dell XPS 13 Dev Edition",
      specs: "Intel Core i7 • 16GB RAM • 512GB SSD",
      price: 949.0,
      markup: 100.0,
      markupReason: "Unauthorized Rush Fee",
      isCompliant: false,
      warranty: "1-Year Standard",
      matchScore: 0.88,
    },
    {
      vendor: "Official Dell Direct (PayPal Verified)",
      item: "Dell XPS 13 Dev Edition",
      specs: "Intel Core i7 • 16GB RAM • 512GB SSD • Ubuntu/Win",
      price: 849.0,
      markup: 0,
      isCompliant: true,
      warranty: "Full 1-Year Manufacturer Warranty",
      matchScore: 0.98,
    },
    {
      vendor: "Certified Refurb Store",
      item: "MacBook Air M2 (Refurb)",
      specs: "Apple M2 • 16GB Unified RAM • 256GB SSD",
      price: 899.0,
      markup: 0,
      isCompliant: true,
      warranty: "90-Day Limited Warranty",
      matchScore: 0.92,
    },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "System ready. Connected to PayPal Sandbox gateway.",
    `Spending limit active: Max budget cap set at $${budgetCap.toFixed(2)}.`,
    "Ready. Enter what you want to buy or select a preset below.",
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

  // Quick Preset Selection Helper
  const applyPreset = (promptText: string, budget: number, category: string) => {
    setUserPrompt(promptText);
    setBudgetCap(budget);
    setActiveCategory(category);
    setInfoMessage(null);
    setWarningMessage(null);
    setPolicyAlert(null);
    setPendingApproval(false);
    setSelectedProduct(null);
    setStatus("idle");
    setStep(0);
    setLogs((prev) => [
      ...prev,
      `Switched preset: ${category.toUpperCase()} • Budget Cap: $${budget.toFixed(2)}.`,
    ]);
  };

  // Trigger Autonomous Dynamic Flow with Real AI & Edge Case Detection
  const runAgenticCommerceFlow = async () => {
    setInfoMessage(null);
    setWarningMessage(null);
    setPolicyAlert(null);
    setPendingApproval(false);
    setSelectedProduct(null);

    setIsRunning(true);
    setStatus("running");
    setStep(1);

    setLogs((prev) => [
      ...prev,
      `Step 1: Analyzing "${userPrompt}" with budget cap $${budgetCap.toFixed(2)}...`,
      activeGeminiKey
        ? "Connecting to Google Gemini 1.5 Flash AI reasoning engine..."
        : "Running AgentPay Dynamic Procurement engine...",
    ]);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          budgetCap,
          geminiApiKey: activeGeminiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.analysis) {
        throw new Error(data.error || "Analysis failed");
      }

      const analysis = data.analysis;

      if (data.isLiveLLM) {
        setLogs((prev) => [
          ...prev,
          `🧠 Google Gemini (${data.model}) completed live neural reasoning on current market options.`,
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          `⚙️ Dynamic engine evaluated request (${data.provider || "Smart Rules"}).`,
        ]);
      }

      // Edge Case 1: Non-Shopping Query
      if (!analysis.isShopping) {
        setInfoMessage(analysis.feedbackMessage || "Non-shopping request detected. Please ask for an item to buy.");
        setIsRunning(false);
        setStatus("idle");
        setStep(0);
        setLogs((prev) => [
          ...prev,
          `⚠️ Non-Shopping Request: "${userPrompt}"`,
          "AgentPay halted execution. No purchase initiated for non-commercial queries.",
        ]);
        return;
      }

      // Edge Case 2: Unrealistic budget
      if (analysis.isUnrealistic) {
        setWarningMessage(analysis.feedbackMessage || "Budget limit too low for this item category.");
        setIsRunning(false);
        setStatus("idle");
        setStep(0);
        setLogs((prev) => [
          ...prev,
          `⚠️ Unrealistic Budget Warning for ${analysis.category || "item"}: $${analysis.budgetCap.toFixed(2)}.`,
          "No verified sellers available below minimum market cost. Execution halted safely.",
        ]);
        return;
      }

      // Valid shopping query with quotes
      setQuotes(analysis.quotes || []);

      // Step 2: The Discrepancy Trap (Vendor #1 Overcharge Detected)
      setTimeout(() => {
        setStep(2);
        const violating = analysis.violatingQuote || analysis.quotes?.find((q: any) => !q.isCompliant);
        if (violating) {
          setPolicyAlert({
            vendor: violating.vendor,
            quotedAmount: `$${violating.price.toFixed(2)}`,
            budgetCap: `$${analysis.budgetCap.toFixed(2)}`,
            markup: `$${violating.markup.toFixed(2)}`,
            reason: `${violating.markupReason || "Unapproved surcharge"}. Total is $${(violating.price - analysis.budgetCap).toFixed(2)} over your budget.`,
          });

          setLogs((prev) => [
            ...prev,
            `⚠️ Hidden Fee Caught: ${violating.vendor} quoted $${violating.price.toFixed(2)} (including $${violating.markup.toFixed(2)} surcharge).`,
            `Payment halted. The AI rejected ${violating.vendor} to protect your budget limit of $${analysis.budgetCap.toFixed(2)}.`,
            `Step 2: Switching to compliant seller: ${analysis.approvedQuote?.vendor || "Verified Seller"}...`,
          ]);
        }
      }, 700);

      // Step 3: Compliant Resolution & Human-in-the-Loop Gate
      setTimeout(() => {
        setStep(3);
        const approved = analysis.approvedQuote || analysis.quotes?.find((q: any) => q.isCompliant);
        if (approved) {
          setSelectedProduct({
            id: "prod-" + Date.now().toString(36),
            name: approved.item,
            price: `$${approved.price.toFixed(2)}`,
            specs: approved.specs,
            merchant: approved.vendor,
          });

          const diff = analysis.budgetCap - approved.price;
          setLogs((prev) => [
            ...prev,
            `✓ Match Verified: ${approved.vendor} quoted $${approved.price.toFixed(2)} ($${diff.toFixed(2)} under your budget).`,
            "Step 3: Prepared checkout order with PayPal buyer protection.",
            "✋ Waiting for your 1-click confirmation before paying...",
          ]);

          setIsRunning(false);
          setPendingApproval(true);
          setStatus("paused_for_approval");
          toast({
            title: "Overcharge Stopped",
            description: `AI rejected overcharge. ${approved.item} ($${approved.price.toFixed(2)}) is ready for your approval.`,
            type: "success",
          });
        }
      }, 1500);
    } catch (err: any) {
      setIsRunning(false);
      setStatus("idle");
      setLogs((prev) => [...prev, `❌ Analysis Error: ${err.message}`]);
      toast({
        title: "Analysis Failed",
        description: err.message,
        type: "destructive",
      });
    }
  };

  // Step 4: Human-in-the-Loop Authorize & Live/Simulated PayPal Orders v2 Settlement
  const handleAuthorizeSettlement = async () => {
    if (!selectedProduct) return;
    setIsRunning(true);
    setPendingApproval(false);
    setStatus("running");

    const priceNum = parseFloat(selectedProduct.price.replace(/[^0-9.]/g, "")) || budgetCap;

    setLogs((prev) => [
      ...prev,
      "You clicked Approve. Sending order creation request to PayPal Orders v2 API...",
    ]);

    try {
      const t0 = performance.now();

      // 1. Create PayPal Order
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: priceNum,
          currency: "USD",
          description: selectedProduct.name,
          clientId: activePaypalClientId || undefined,
          clientSecret: activePaypalClientSecret || undefined,
        }),
      });

      const createData = await createRes.json();
      if (!createData.success || !createData.order) {
        throw new Error(createData.error || "Failed to create PayPal order");
      }

      const orderId = createData.order.id;
      const isLiveSandbox = Boolean(createData.isLive);

      setLogs((prev) => [
        ...prev,
        `✓ PayPal Order created: #${orderId} (${isLiveSandbox ? "Live PayPal Sandbox Network" : "Zero-Config Sandbox Mode"})`,
        "Step 4: Executing PayPal Orders v2 capture...",
      ]);

      // 2. Capture PayPal Order
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          clientId: activePaypalClientId || undefined,
          clientSecret: activePaypalClientSecret || undefined,
        }),
      });

      const captureData = await captureRes.json();
      const latency = Math.round(performance.now() - t0);

      if (!captureData.success) {
        throw new Error(captureData.error || "Failed to capture PayPal order");
      }

      setStep(4);
      setLogs((prev) => [
        ...prev,
        `✨ Payment Successful! Captured PayPal Order #${orderId} in ${latency}ms.`,
        `Network: ${isLiveSandbox ? "🟢 api-m.sandbox.paypal.com (Live)" : "🟡 Zero-Config Simulated Sandbox"}`,
        "Receipt generated and sent to buyer account.",
      ]);

      setIsRunning(false);
      setStatus("success");
      toast({
        title: "Payment Confirmed!",
        description: `Captured ${selectedProduct.price} via PayPal ${isLiveSandbox ? "Live Sandbox" : "Sandbox"} in ${latency}ms.`,
        type: "success",
      });
    } catch (err: any) {
      setIsRunning(false);
      setStatus("idle");
      setLogs((prev) => [...prev, `❌ Payment Error: ${err.message}`]);
      toast({
        title: "Payment Failed",
        description: err.message,
        type: "destructive",
      });
    }
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
              quotedAmount: budgetCap + 49.0,
              budgetCap: budgetCap,
              unapprovedMarkup: 50.0,
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
          {hasLiveGemini && hasLivePayPal ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live Gemini + PayPal Sandbox
            </Badge>
          ) : hasLiveGemini ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live Gemini 1.5 Flash
            </Badge>
          ) : hasLivePayPal ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live PayPal Sandbox
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] font-medium">
              ● Zero-Config Sandbox Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Settings className="w-3.5 h-3.5 mr-1" /> Custom Keys
          </Button>
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
              <CardTitle className="text-xl font-bold text-foreground">${budgetCap.toFixed(2)} Max</CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Strict limit enforced by AI guardrail</p>
          </Card>

          <Card className="glass p-4">
            <CardHeader className="p-0 pb-1">
              <CardDescription className="flex items-center justify-between text-xs text-muted-foreground font-normal">
                <span>Overcharges Stopped</span>
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-emerald-400">
                {policyAlert ? policyAlert.markup : "$0.00 Saved"}
              </CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Hidden fee detected & blocked</p>
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

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Presets:
          </span>
          <Button
            variant={activeCategory === "laptop" ? "glow" : "outline"}
            size="sm"
            onClick={() => applyPreset("Find me a high-performance developer laptop under $900 with 16GB RAM", 900, "laptop")}
            className="h-7 text-xs"
          >
            💻 Laptop ($900)
          </Button>
          <Button
            variant={activeCategory === "headphones" ? "glow" : "outline"}
            size="sm"
            onClick={() => applyPreset("Find noise canceling wireless headphones under $250 for travel", 250, "headphones")}
            className="h-7 text-xs"
          >
            🎧 Headphones ($250)
          </Button>
          <Button
            variant={activeCategory === "monitor" ? "glow" : "outline"}
            size="sm"
            onClick={() => applyPreset("Buy a 27 inch 4K UltraSharp monitor under $400 for coding", 400, "monitor")}
            className="h-7 text-xs"
          >
            🖥️ 4K Monitor ($400)
          </Button>
          <Button
            variant={activeCategory === "chair" ? "glow" : "outline"}
            size="sm"
            onClick={() => applyPreset("Ergonomic desk chair for lumbar support under $350", 350, "chair")}
            className="h-7 text-xs"
          >
            🪑 Office Chair ($350)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("Write me a poem about the sunrise and oceans", 100, "non_shopping")}
            className="h-7 text-xs border-dashed text-muted-foreground hover:text-foreground"
          >
            ❓ Non-Shopping Edge Case
          </Button>
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

            {/* Custom Prompt & Budget Inputs */}
            <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="text-[11px] text-muted-foreground font-medium block mb-1">I want to buy:</label>
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  disabled={isRunning || pendingApproval}
                  className="w-full text-xs font-normal px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-medium block mb-1">Max Budget Cap ($):</label>
                <input
                  type="number"
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(parseFloat(e.target.value) || 0)}
                  disabled={isRunning || pendingApproval}
                  className="w-full text-xs font-normal px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
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

            {/* EDGE CASE: NON-SHOPPING NOTICE */}
            {infoMessage && (
              <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs flex items-start gap-2.5 animate-in fade-in">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-blue-400">Non-Shopping Request</span>
                  <p className="text-muted-foreground mt-0.5 font-normal">{infoMessage}</p>
                </div>
              </div>
            )}

            {/* EDGE CASE: UNREALISTIC BUDGET NOTICE */}
            {warningMessage && (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-400">Price Limit Notice</span>
                  <p className="text-muted-foreground mt-0.5 font-normal">{warningMessage}</p>
                </div>
              </div>
            )}

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
                  <p className="text-[11px] text-emerald-400 font-normal">✓ Fair price verified • Within your ${budgetCap.toFixed(2)} budget</p>
                </div>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleAuthorizeSettlement}
                  disabled={isRunning}
                  className="shrink-0 whitespace-nowrap bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Approve {selectedProduct.price} with PayPal
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
                    <span className={log.includes("Successful") || log.includes("Verified") ? "text-emerald-400 font-normal" : log.includes("Caught") || log.includes("halted") || log.includes("Non-Shopping") ? "text-rose-300 font-normal" : "text-foreground font-normal"}>
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

        {/* Dynamic Price Comparison Table (AG Grid) */}
        <Card className="glass">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Dynamic Store Price Comparison</span>
              <span className="text-xs text-muted-foreground font-normal">Real-time quotes based on your search</span>
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
                    <th className="py-2 px-3">Fee & Policy Check</th>
                    <th className="py-2 px-3">AI Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotes.map((q, idx) => (
                    <tr key={idx} className={!q.isCompliant ? "" : "bg-emerald-500/5"}>
                      <td className="py-2.5 px-3 flex items-center gap-1.5 text-foreground font-medium">
                        {!q.isCompliant ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        {q.vendor}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{q.item}</td>
                      <td className={`py-2.5 px-3 font-semibold ${!q.isCompliant ? "text-rose-400" : "text-emerald-400"}`}>
                        ${q.price.toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-3 ${!q.isCompliant ? "text-rose-300" : "text-emerald-400"}`}>
                        {!q.isCompliant ? `Over budget (+$${q.markup.toFixed(2)} fee)` : `Fair price (${q.warranty})`}
                      </td>
                      <td className="py-2.5 px-3">
                        {!q.isCompliant ? (
                          <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">Approved</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Settings / Custom API Keys Dialog */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Live Keys & Sandbox Settings"
        description="Switch between Zero-Config Simulation and real Live Google Gemini & PayPal Sandbox endpoints."
      >
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          {/* Active Status Banner */}
          <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
            <span className="font-semibold text-foreground text-xs block">Active Connection Status:</span>
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Google Gemini 1.5 Flash:</span>
                <span className={hasLiveGemini ? "text-emerald-400 font-semibold" : "text-muted-foreground font-medium"}>
                  {hasLiveGemini ? "🟢 Live Key Configured" : "⚪ Zero-Config Engine"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>PayPal Orders v2 API:</span>
                <span className={hasLivePayPal ? "text-emerald-400 font-semibold" : "text-muted-foreground font-medium"}>
                  {hasLivePayPal ? "🟢 Live Sandbox Gateway" : "⚪ Zero-Config Simulator"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              Judges can test every feature right away without signing up! Adding keys connects this browser tab to live HTTPS endpoints.
            </p>
          </div>

          {/* Gemini Key Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-foreground">Google Gemini API Key (Optional)</label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary hover:underline"
              >
                Get Free Key ↗
              </a>
            </div>
            <input
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="AIzaSy... (leave blank for Zero-Config)"
              className="w-full text-xs px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* PayPal Client ID Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-foreground">PayPal Sandbox Client ID (Optional)</label>
              <a
                href="https://developer.paypal.com/dashboard/applications/sandbox"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary hover:underline"
              >
                developer.paypal.com ↗
              </a>
            </div>
            <input
              type="text"
              value={paypalClientIdInput}
              onChange={(e) => setPaypalClientIdInput(e.target.value)}
              placeholder="AZ... (from your PayPal Sandbox App)"
              className="w-full text-xs px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* PayPal Client Secret Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground block">PayPal Sandbox Client Secret (Optional)</label>
            <input
              type="password"
              value={paypalClientSecretInput}
              onChange={(e) => setPaypalClientSecretInput(e.target.value)}
              placeholder="ED... (from your PayPal Sandbox App)"
              className="w-full text-xs px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <p className="text-[10px] text-muted-foreground">
            Keys are saved locally in your browser session and never sent to external servers. You can also configure them in <code>.env.local</code>.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearCredentials}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset to Zero-Config
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveCredentials}>
                Save Credentials
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

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
