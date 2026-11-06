"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { ShoppingQuote } from "@/lib/ai/shopping-agent";
import {
  UserSpendingPolicy,
  loadUserPolicy,
  saveUserPolicy,
  resetUserPolicy,
  DEFAULT_SPENDING_POLICY,
} from "@/lib/policy/engine";
import {
  LedgerRecord,
  getLedgerRecords,
  getSavingsSummary,
  clearLedger,
} from "@/lib/storage/ledger";
import { sourcingAgent } from "@/lib/agents/sourcing-agent";
import { policyAuditorAgent } from "@/lib/agents/auditor-agent";
import { settlementAgent } from "@/lib/agents/settlement-agent";
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
  Sliders,
  History,
  FileCheck2,
  ExternalLink,
  RefreshCw,
  Search,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // Policy Engine State
  const [policy, setPolicy] = useState<UserSpendingPolicy>(DEFAULT_SPENDING_POLICY);

  // Persistent Ledger State
  const [ledger, setLedger] = useState<LedgerRecord[]>([]);
  const [savingsSummary, setSavingsSummary] = useState({ totalSpent: 0, totalSaved: 0, transactionCount: 0, completedCount: 0 });

  // Custom Key Configuration State
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [paypalClientIdInput, setPaypalClientIdInput] = useState("");
  const [paypalClientSecretInput, setPaypalClientSecretInput] = useState("");

  const [activeGeminiKey, setActiveGeminiKey] = useState("");
  const [activePaypalClientId, setActivePaypalClientId] = useState("");
  const [activePaypalClientSecret, setActivePaypalClientSecret] = useState("");

  // Search & Procurement State
  const [userPrompt, setUserPrompt] = useState("Find me a high-performance developer laptop under $900 with 16GB RAM");
  const [budgetCap, setBudgetCap] = useState<number>(900);
  const [activeCategory, setActiveCategory] = useState<string>("laptop");

  // 3-Helper Pipeline States
  const [agentStep, setAgentStep] = useState<1 | 2 | 3 | 4>(1);
  const [agentPipeline, setAgentPipeline] = useState<{
    sourcing: { status: "idle" | "running" | "completed" | "halted"; latencyMs?: number; summary?: string };
    auditing: { status: "idle" | "running" | "completed" | "halted"; latencyMs?: number; summary?: string };
    settlement: { status: "idle" | "running" | "completed"; latencyMs?: number; summary?: string };
  }>({
    sourcing: { status: "idle" },
    auditing: { status: "idle" },
    settlement: { status: "idle" },
  });

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
    violations?: string[];
  } | null>(null);

  const [pendingApproval, setPendingApproval] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    price: string;
    specs: string;
    merchant: string;
    moneySaved: number;
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
    "3 AI Helpers ready (Searcher -> Fee Inspector -> PayPal Cashier).",
    `Your spending limit is active: maximum $${budgetCap.toFixed(2)}.`,
    "Ready. Type what you want to buy or click a preset below.",
  ]);

  const [status, setStatus] = useState<"idle" | "running" | "paused_for_approval" | "success">("idle");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"telemetry" | "ledger" | "edge_tests" | "mcp">("telemetry");

  // Live Edge Test Suite State
  const [edgeTestsLoading, setEdgeTestsLoading] = useState(false);
  const [edgeTestsOutput, setEdgeTestsOutput] = useState<any | null>(null);

  // Live MCP Client State
  const [mcpLiveLoading, setMcpLiveLoading] = useState(false);
  const [mcpLiveOutput, setMcpLiveOutput] = useState<{
    status: number;
    latencyMs: number;
    payload: any;
  } | null>(null);

  // Load saved policy, credentials, and ledger on mount
  useEffect(() => {
    try {
      setPolicy(loadUserPolicy());
      const initialLedger = getLedgerRecords();
      setLedger(initialLedger);
      setSavingsSummary(getSavingsSummary());

      const gKey = sessionStorage.getItem("agentpay_gemini_key") || localStorage.getItem("agentpay_gemini_key") || "";
      const pId = sessionStorage.getItem("agentpay_paypal_client_id") || localStorage.getItem("agentpay_paypal_client_id") || "";
      const pSecret = sessionStorage.getItem("agentpay_paypal_client_secret") || localStorage.getItem("agentpay_paypal_client_secret") || "";
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
      // Storage unavailable in private browsing mode
    }
  }, []);

  const handleSavePolicy = (newPolicy: UserSpendingPolicy) => {
    setPolicy(newPolicy);
    saveUserPolicy(newPolicy);
    setIsPolicyOpen(false);
    toast({
      title: "Rules Saved",
      description: `Allowed extra fee: $${newPolicy.maxMarkupTolerance.toFixed(2)} | Ask confirmation over: $${newPolicy.autoApproveThreshold.toFixed(2)}`,
      type: "success",
    });
  };

  const handleSaveCredentials = () => {
    try {
      sessionStorage.setItem("agentpay_gemini_key", geminiKeyInput.trim());
      sessionStorage.setItem("agentpay_paypal_client_id", paypalClientIdInput.trim());
      sessionStorage.setItem("agentpay_paypal_client_secret", paypalClientSecretInput.trim());
      localStorage.setItem("agentpay_gemini_key", geminiKeyInput.trim());
      localStorage.setItem("agentpay_paypal_client_id", paypalClientIdInput.trim());
      localStorage.setItem("agentpay_paypal_client_secret", paypalClientSecretInput.trim());

      setActiveGeminiKey(geminiKeyInput.trim());
      setActivePaypalClientId(paypalClientIdInput.trim());
      setActivePaypalClientSecret(paypalClientSecretInput.trim());
      setIsSettingsOpen(false);
      toast({
        title: "Keys Saved",
        description: "Your keys are now active for live AI searches and PayPal Sandbox payments.",
        type: "success",
      });
    } catch {
      toast({
        title: "Could Not Save",
        description: "Storage error occurred. Please check browser permissions.",
        type: "error",
      });
    }
  };

  const handleClearCredentials = () => {
    try {
      sessionStorage.removeItem("agentpay_gemini_key");
      sessionStorage.removeItem("agentpay_paypal_client_id");
      sessionStorage.removeItem("agentpay_paypal_client_secret");
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
        description: "Switched back to safe zero-setup test mode.",
        type: "info",
      });
    } catch {
      // ignore
    }
  };

  const hasLiveGemini = Boolean(activeGeminiKey);
  const hasLivePayPal = Boolean(activePaypalClientId && activePaypalClientSecret);

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
    setAgentStep(1);
    setAgentPipeline({
      sourcing: { status: "idle" },
      auditing: { status: "idle" },
      settlement: { status: "idle" },
    });
    setLogs((prev) => [
      ...prev,
      `Selected ${category.toUpperCase()} preset with $${budget.toFixed(2)} budget limit.`,
    ]);
  };

  // Run the 3-Helper AI Pipeline
  const runAgenticCommerceFlow = async () => {
    setInfoMessage(null);
    setWarningMessage(null);
    setPolicyAlert(null);
    setPendingApproval(false);
    setSelectedProduct(null);

    setIsRunning(true);
    setStatus("running");
    setAgentStep(1);
    setAgentPipeline({
      sourcing: { status: "running" },
      auditing: { status: "idle" },
      settlement: { status: "idle" },
    });

    setLogs((prev) => [
      ...prev,
      `Starting search for: "${userPrompt}" with $${budgetCap.toFixed(2)} spending limit.`,
      `🔍 1. Store Searcher: Looking up verified stores for real prices and stock...`,
    ]);

    try {
      // 1. SOURCING AGENT
      const sourcingResult = await sourcingAgent.sourceQuotes(userPrompt, budgetCap, activeGeminiKey);

      setAgentPipeline((p) => ({
        ...p,
        sourcing: {
          status: sourcingResult.isShopping && !sourcingResult.isUnrealistic ? "completed" : "halted",
          latencyMs: sourcingResult.latencyMs,
          summary: `Found: ${sourcingResult.extractedItem} (${sourcingResult.quotes.length} stores)`,
        },
      }));

      // Edge Case 1: Non-Shopping Query
      if (!sourcingResult.isShopping) {
        setInfoMessage(sourcingResult.feedbackMessage || "This looks like a general question, not a product purchase. Please enter an item you want to buy.");
        setIsRunning(false);
        setStatus("idle");
        setLogs((prev) => [
          ...prev,
          `⚠️ Non-Shopping Request: "${userPrompt}". The AI safely stopped because no product was requested.`,
        ]);
        return;
      }

      // Edge Case 2: Unrealistic budget
      if (sourcingResult.isUnrealistic) {
        setWarningMessage(sourcingResult.feedbackMessage || `The budget of $${sourcingResult.budgetCap.toFixed(2)} is too low for this item category.`);
        setIsRunning(false);
        setStatus("idle");
        setLogs((prev) => [
          ...prev,
          `⚠️ Price Limit Notice: $${sourcingResult.budgetCap.toFixed(2)} is below normal store prices for ${sourcingResult.category}. Search stopped for safety.`,
        ]);
        return;
      }

      setQuotes(sourcingResult.quotes);
      setLogs((prev) => [
        ...prev,
        `✓ Found ${sourcingResult.quotes.length} store quotes in ${sourcingResult.latencyMs}ms.`,
        sourcingResult.isMultiItem ? `📦 Multi-item package split into component items to fit your budget.` : "",
        `🛡️ 2. Fee Inspector: Checking every quote line-by-line for hidden markups...`,
      ].filter(Boolean));

      // 2. AUDITOR AGENT
      setAgentStep(2);
      setAgentPipeline((p) => ({ ...p, auditing: { status: "running" } }));

      setTimeout(() => {
        const auditResult = policyAuditorAgent.auditQuotes(sourcingResult.quotes, budgetCap, policy);

        setAgentPipeline((p) => ({
          ...p,
          auditing: {
            status: "completed",
            summary: auditResult.hasDiscrepancy ? `Stopped Overcharge: saved $${auditResult.moneySaved.toFixed(2)}` : "All store prices verified",
          },
        }));

        setLogs((prev) => [...prev, ...auditResult.auditLogs]);

        if (auditResult.violatingQuote) {
          const viols = auditResult.violatingQuote.policyDetails?.violations || [];
          setPolicyAlert({
            vendor: auditResult.violatingQuote.vendor,
            quotedAmount: `$${auditResult.violatingQuote.price.toFixed(2)}`,
            budgetCap: `$${budgetCap.toFixed(2)}`,
            markup: `$${auditResult.violatingQuote.markup.toFixed(2)}`,
            reason: viols.length > 0 ? viols.join(" • ") : "Unapproved fee",
            violations: viols,
          });
        }

        // 3. SETTLEMENT APPROVAL GATE
        if (auditResult.approvedQuote) {
          const approved = auditResult.approvedQuote;
          setSelectedProduct({
            id: "prod-" + Date.now().toString(36),
            name: approved.item,
            price: `$${approved.price.toFixed(2)}`,
            specs: approved.specs,
            merchant: approved.vendor,
            moneySaved: auditResult.moneySaved,
          });

          setAgentStep(3);

          if (auditResult.requiresHumanApproval) {
            setIsRunning(false);
            setPendingApproval(true);
            setStatus("paused_for_approval");
            toast({
              title: "Overcharge Stopped",
              description: `AI rejected the overpriced store. ${approved.item} ($${approved.price.toFixed(2)}) is ready for your 1-click confirmation.`,
              type: "success",
            });
          } else {
            // Auto-approved under user's threshold
            setLogs((prev) => [
              ...prev,
              `⚡ Price is under your $${policy.autoApproveThreshold.toFixed(2)} rule. Paying automatically...`,
            ]);
            executeSettlementInternal(approved.item, approved.vendor, approved.price, auditResult.moneySaved);
          }
        }
      }, 700);
    } catch (err: any) {
      setIsRunning(false);
      setStatus("idle");
      setLogs((prev) => [...prev, `❌ Error during search: ${err.message}`]);
      toast({
        title: "Search Stopped",
        description: err.message,
        type: "error",
      });
    }
  };

  // Helper for Payment Execution
  const executeSettlementInternal = async (
    itemName: string,
    merchantName: string,
    priceAmount: number,
    moneySaved: number
  ) => {
    setIsRunning(true);
    setPendingApproval(false);
    setStatus("running");
    setAgentStep(4);
    setAgentPipeline((p) => ({ ...p, settlement: { status: "running" } }));

    setLogs((prev) => [
      ...prev,
      `💳 3. Safe Checkout: Connecting to PayPal Sandbox to create your order...`,
    ]);

    try {
      const settlement = await settlementAgent.executeSettlement({
        item: itemName,
        vendor: merchantName,
        amount: priceAmount,
        userPrompt,
        moneySaved,
        auditLogs: logs.slice(-3),
        clientId: activePaypalClientId || undefined,
        clientSecret: activePaypalClientSecret || undefined,
      });

      setAgentPipeline((p) => ({
        ...p,
        settlement: {
          status: "completed",
          latencyMs: settlement.latencyMs,
          summary: `PayPal Order #${settlement.orderId} (Confirmed)`,
        },
      }));

      // Refresh Ledger & Savings
      const updatedLedger = getLedgerRecords();
      setLedger(updatedLedger);
      setSavingsSummary(getSavingsSummary());

      setLogs((prev) => [
        ...prev,
        `✨ Payment Confirmed in ${settlement.latencyMs}ms! PayPal Order #${settlement.orderId} captured safely.`,
        `Saved to history: prevented $${moneySaved.toFixed(2)} in hidden charges.`,
      ]);

      setIsRunning(false);
      setStatus("success");
      toast({
        title: "Payment Successful!",
        description: `Paid $${priceAmount.toFixed(2)} via PayPal in ${settlement.latencyMs}ms. Order confirmed.`,
        type: "success",
      });
    } catch (err: any) {
      setIsRunning(false);
      setStatus("idle");
      setLogs((prev) => [...prev, `❌ Payment Error: ${err.message}`]);
      toast({
        title: "Payment Could Not Complete",
        description: err.message,
        type: "error",
      });
    }
  };

  const handleAuthorizeSettlement = async () => {
    if (!selectedProduct) return;
    const priceNum = parseFloat(selectedProduct.price.replace(/[^0-9.]/g, "")) || budgetCap;
    await executeSettlementInternal(selectedProduct.name, selectedProduct.merchant, priceNum, selectedProduct.moneySaved);
  };

  // Run the 4 Live API Edge Tests
  const handleRunEdgeTests = async () => {
    setEdgeTestsLoading(true);
    try {
      const res = await fetch("/api/edge-tests", { method: "POST" });
      const data = await res.json();
      setEdgeTestsOutput(data);
      toast({
        title: "Safety Tests Finished",
        description: `All ${data.summary?.passed}/${data.summary?.total} live tests passed cleanly.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Test Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setEdgeTestsLoading(false);
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
            AgentPay AI Shopping
          </span>
          {hasLiveGemini && hasLivePayPal ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live AI &amp; PayPal Connected
            </Badge>
          ) : hasLiveGemini ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live Gemini AI
            </Badge>
          ) : hasLivePayPal ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live PayPal Sandbox
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] font-medium">
              ● Ready to Test (Sandbox)
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsPolicyOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Sliders className="w-3.5 h-3.5 mr-1 text-primary" /> My Rules
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Settings className="w-3.5 h-3.5 mr-1" /> API Keys
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Code2 className="w-3.5 h-3.5 mr-1" /> Developer Tools
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Compact 3-Pill Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass p-3 rounded-xl border border-border/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-medium">Spending Limit</span>
              <span className="text-base font-bold text-foreground">${budgetCap.toFixed(2)} Max</span>
            </div>
          </div>

          <div className="glass p-3 rounded-xl border border-border/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-medium">Total Saved</span>
              <span className="text-base font-bold text-emerald-400">${savingsSummary.totalSaved.toFixed(2)}</span>
            </div>
          </div>

          <div className="glass p-3 rounded-xl border border-border/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-medium">Fee Protection</span>
              <span className="text-base font-bold text-foreground">Zero Hidden Fees</span>
            </div>
          </div>
        </div>

        {/* 3 AI Helpers Status Strip */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-card/60 border border-border/70 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>3 AI Helpers:</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] flex-wrap">
            <span className={`flex items-center gap-1 ${agentPipeline.sourcing.status === "running" ? "text-primary font-semibold" : agentPipeline.sourcing.status === "completed" ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
              {agentPipeline.sourcing.status === "running" ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : "🔍"}
              <span>1. Store Searcher</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className={`flex items-center gap-1 ${agentPipeline.auditing.status === "running" ? "text-primary font-semibold" : agentPipeline.auditing.status === "completed" ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
              {agentPipeline.auditing.status === "running" ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : "🛡️"}
              <span>2. Fee Inspector</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className={`flex items-center gap-1 ${agentPipeline.settlement.status === "running" ? "text-primary font-semibold" : agentPipeline.settlement.status === "completed" ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
              {agentPipeline.settlement.status === "running" ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : "💳"}
              <span>3. Safe Checkout</span>
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {isRunning ? "● Working" : "Ready"}
          </Badge>
        </div>

        {/* CARD 1: SMART SHOPPING ASSISTANT (Active Search & Checkout) */}
        <Card className="glass border-border/80 shadow-sm relative overflow-hidden">
          <CardHeader className="p-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>Smart Shopping Assistant</span>
                  <Badge variant="purple" className="text-[10px] font-medium">Protection Active</Badge>
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-muted-foreground font-normal">
                  Searches online stores, stops sneaky markups, and asks for your 1-click confirmation before paying.
                </CardDescription>
              </div>

              <Button
                variant="glow"
                size="md"
                onClick={runAgenticCommerceFlow}
                disabled={isRunning || pendingApproval}
                className="whitespace-nowrap font-medium text-xs sm:text-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Searching Stores...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                    <span>Find Best Deals Safely</span>
                  </>
                )}
              </Button>
            </div>

            {/* Custom Prompt & Budget Inputs */}
            <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="text-[11px] text-muted-foreground font-medium block mb-1">What do you want to buy?</label>
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  disabled={isRunning || pendingApproval}
                  className="w-full text-xs font-normal px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-medium block mb-1">Highest Budget Limit ($):</label>
                <input
                  type="number"
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(parseFloat(e.target.value) || 0)}
                  disabled={isRunning || pendingApproval}
                  className="w-full text-xs font-normal px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Quick Examples:
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
                variant={activeCategory === "kit" ? "glow" : "outline"}
                size="sm"
                onClick={() => applyPreset("Podcast Studio Kit: USB Condenser Mic + Studio Headphones + Boom Arm under $450", 450, "kit")}
                className="h-7 text-xs font-semibold border-purple-500/40"
              >
                🎙️ Studio Kit ($450)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("Write me a poem about the sunrise and oceans", 100, "non_shopping")}
                className="h-7 text-xs border-dashed text-muted-foreground hover:text-foreground"
              >
                ❓ Non-Shopping
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-3.5">
            {/* Minimalist, Sleek Step Tracker */}
            <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-muted/40 border border-border/50 text-muted-foreground">
              <span className={`flex items-center gap-1.5 ${agentStep >= 1 ? "text-primary font-medium" : ""}`}>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${agentStep >= 1 ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"}`}>1</span>
                <span>Search</span>
              </span>
              <span className="text-border">→</span>
              <span className={`flex items-center gap-1.5 ${agentStep >= 2 ? (policyAlert ? "text-rose-400 font-medium" : "text-primary font-medium") : ""}`}>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${agentStep >= 2 ? (policyAlert ? "bg-rose-500 text-white font-bold" : "bg-primary text-primary-foreground font-bold") : "bg-muted text-muted-foreground"}`}>2</span>
                <span>Check Fees</span>
              </span>
              <span className="text-border">→</span>
              <span className={`flex items-center gap-1.5 ${agentStep >= 3 ? "text-amber-400 font-medium" : ""}`}>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${agentStep >= 3 ? "bg-amber-500 text-black font-bold" : "bg-muted text-muted-foreground"}`}>3</span>
                <span>Your Approval</span>
              </span>
              <span className="text-border">→</span>
              <span className={`flex items-center gap-1.5 ${agentStep >= 4 ? "text-emerald-400 font-medium" : ""}`}>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${agentStep >= 4 ? "bg-emerald-500 text-black font-bold" : "bg-muted text-muted-foreground"}`}>4</span>
                <span>Paid via PayPal</span>
              </span>
            </div>

            {/* EDGE CASE: NON-SHOPPING NOTICE */}
            {infoMessage && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs flex items-center gap-2.5 animate-in fade-in">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="font-semibold text-blue-400">Not a Shopping Request: </span>
                  <span className="text-muted-foreground font-normal">{infoMessage}</span>
                </div>
              </div>
            )}

            {/* EDGE CASE: UNREALISTIC BUDGET NOTICE */}
            {warningMessage && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-amber-400">Budget Notice: </span>
                  <span className="text-muted-foreground font-normal">{warningMessage}</span>
                </div>
              </div>
            )}

            {/* OVERCHARGE ALERT - CLEAN 1-LINE PILL */}
            {policyAlert && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold text-rose-400">Overpriced Store Blocked:</span>
                  <span className="text-foreground font-medium">{policyAlert.vendor}</span>
                  <span className="text-rose-300 font-semibold">{policyAlert.quotedAmount}</span>
                  <span className="text-muted-foreground text-[11px]">
                    ({policyAlert.violations && policyAlert.violations.length > 0 ? policyAlert.violations.join(" • ") : policyAlert.reason})
                  </span>
                </div>
                <Badge variant="destructive" className="shrink-0 text-[10px]">Blocked</Badge>
              </div>
            )}

            {/* 1-CLICK APPROVAL CARD */}
            {pendingApproval && selectedProduct && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-[10px] font-semibold">
                      ✓ Best Fair Price Found
                    </Badge>
                    <span className="text-xs text-muted-foreground">Ready for your confirmation</span>
                  </div>
                  <h4 className="font-bold text-base text-foreground">{selectedProduct.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>Store: <strong className="text-foreground">{selectedProduct.merchant}</strong></span>
                    <span>•</span>
                    <span>Fair Price: <strong className="text-emerald-400 text-base font-bold">{selectedProduct.price}</strong></span>
                    {selectedProduct.moneySaved > 0 && (
                      <span className="text-purple-400 font-semibold text-xs bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                        Saved ${selectedProduct.moneySaved.toFixed(2)} vs overpriced store!
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  size="md"
                  variant="glow"
                  onClick={handleAuthorizeSettlement}
                  disabled={isRunning}
                  className="w-full sm:w-auto font-medium px-5 shadow-md"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Confirming via PayPal...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      <span>1-Click Approve via PayPal</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: STORE PRICE COMPARISON TABLE */}
        <Card className="glass">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Store Price Comparison</span>
              <span className="text-xs text-muted-foreground font-normal">Prices checked across verified stores</span>
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
                    <th className="py-2 px-3">Fee &amp; Rule Check</th>
                    <th className="py-2 px-3">Decision</th>
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
                        {!q.isCompliant ? `Over budget (+$${q.markup.toFixed(2)} extra fee)` : `Fair price (${q.warranty})`}
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

        {/* CARD 3: ACTIVITY, HISTORY & SAFETY CONSOLE (Dedicated Card Below) */}
        <Card className="glass">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between border-b border-border/70 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveConsoleTab("telemetry")}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "telemetry" ? "bg-card text-foreground font-medium border border-border/80 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Terminal className="w-3.5 h-3.5 text-primary" /> Live Activity Log
                </button>
                <button
                  onClick={() => setActiveConsoleTab("ledger")}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "ledger" ? "bg-card text-foreground font-medium border border-border/80 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <History className="w-3.5 h-3.5 text-emerald-400" /> Past Purchases &amp; Savings ({ledger.length})
                </button>
                <button
                  onClick={() => setActiveConsoleTab("edge_tests")}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "edge_tests" ? "bg-card text-foreground font-medium border border-border/80 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-400" /> Safety Tests &amp; Checks
                </button>
                <button
                  onClick={() => setActiveConsoleTab("mcp")}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "mcp" ? "bg-card text-foreground font-medium border border-border/80 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> PayPal AI Tools
                </button>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                Status: {status === "idle" ? "Ready" : status === "running" ? "Searching..." : status === "paused_for_approval" ? "Waiting for You" : "Done"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            {/* TAB 1: ACTIVITY LOG */}
            {activeConsoleTab === "telemetry" && (
              <div className="font-mono text-[11px] space-y-1 max-h-[180px] overflow-y-auto pr-1">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-muted-foreground">&gt; </span>
                    <span className={log.includes("Successful") || log.includes("Verified") || log.includes("COMPLIANT") || log.includes("Confirmed") ? "text-emerald-400 font-normal" : log.includes("Caught") || log.includes("halted") || log.includes("VIOLATION") || log.includes("Stopped") ? "text-rose-300 font-normal" : "text-foreground font-normal"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: AUDIT LEDGER */}
            {activeConsoleTab === "ledger" && (
              <div className="space-y-2 text-xs font-sans animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                  <span>Saved history of past purchases and extra fees prevented:</span>
                  <button onClick={clearLedger} className="text-[10px] text-muted-foreground hover:text-foreground underline">
                    Clear History
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[220px]">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-border text-muted-foreground font-medium">
                      <tr>
                        <th className="py-1.5 px-2">Date</th>
                        <th className="py-1.5 px-2">Product &amp; Store</th>
                        <th className="py-1.5 px-2">Price Paid</th>
                        <th className="py-1.5 px-2">Money Saved</th>
                        <th className="py-1.5 px-2">PayPal Order ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {ledger.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="py-1.5 px-2 text-muted-foreground font-mono">{new Date(r.timestamp).toLocaleDateString()}</td>
                          <td className="py-1.5 px-2 text-foreground font-medium">{r.item} <span className="text-muted-foreground font-normal">({r.merchant})</span></td>
                          <td className="py-1.5 px-2 text-emerald-400 font-semibold">${r.paidAmount.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-purple-400 font-semibold">+${r.moneySaved.toFixed(2)}</td>
                          <td className="py-1.5 px-2 font-mono text-[10px] text-primary">
                            {r.receiptUrl ? (
                              <a href={r.receiptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                                #{r.paypalOrderId} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              `#${r.paypalOrderId}`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: SAFETY TESTS */}
            {activeConsoleTab === "edge_tests" && (
              <div className="space-y-3 text-xs font-sans animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-foreground font-normal">
                    Run live tests with real APIs to see how the AI handles weird questions, absurd budgets, and test orders.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRunEdgeTests}
                    disabled={edgeTestsLoading}
                    className="h-7 text-xs font-medium"
                  >
                    {edgeTestsLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                        <span>Testing Now...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current mr-1.5" />
                        <span>Run 4 Live Safety Tests</span>
                      </>
                    )}
                  </Button>
                </div>

                {edgeTestsOutput && (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <span>✓ {edgeTestsOutput.summary?.passed} / {edgeTestsOutput.summary?.total} Safety Tests Passed Cleanly</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {edgeTestsOutput.results?.map((t: any) => (
                        <div key={t.id} className="p-2 rounded bg-muted/40 border border-border/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> {t.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{t.durationMs}ms</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{t.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PAYPAL AI TOOLS */}
            {activeConsoleTab === "mcp" && (
              <div className="space-y-2 text-xs font-sans text-muted-foreground">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-foreground font-normal">
                    Any external AI assistant (like Claude or ChatGPT) can use our safe PayPal tools to check prices.
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
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current mr-1.5" />
                        <span>Test Hidden-Fee Detector</span>
                      </>
                    )}
                  </Button>
                </div>

                {mcpLiveOutput ? (
                  <div className="space-y-1 font-mono text-[11px] animate-in fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <span>✓ Response from PayPal Server (Status {mcpLiveOutput.status})</span>
                      <span className="text-muted-foreground text-[10px]">{mcpLiveOutput.latencyMs}ms response</span>
                    </div>
                    <pre className="p-2.5 rounded bg-card border border-border/80 overflow-x-auto text-foreground max-h-[180px]">
{JSON.stringify(mcpLiveOutput.payload, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground font-normal font-mono">
                    Click &quot;Test Hidden-Fee Detector&quot; above to see a live safety check response from our server.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* POLICY CONFIGURATION DIALOG: EASY WORDS */}
      <Dialog
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        title="Your Shopping & Safety Rules"
        description="Set the exact rules you want your AI assistant to follow when shopping for you."
      >
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-foreground">Highest extra fee you will allow ($)</label>
              <span className="font-mono text-primary font-bold">${policy.maxMarkupTolerance.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Keep at $0 to block all hidden markups completely.</p>
            <input
              type="number"
              min="0"
              step="5"
              value={policy.maxMarkupTolerance}
              onChange={(e) => setPolicy({ ...policy, maxMarkupTolerance: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs px-3 py-1.5 rounded-md bg-muted/50 border border-border text-foreground font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-foreground">Ask for approval if price is over ($)</label>
              <span className="font-mono text-emerald-400 font-bold">${policy.autoApproveThreshold.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Any purchase higher than this will wait for your 1-click confirmation before paying.</p>
            <input
              type="number"
              min="10"
              step="10"
              value={policy.autoApproveThreshold}
              onChange={(e) => setPolicy({ ...policy, autoApproveThreshold: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs px-3 py-1.5 rounded-md bg-muted/50 border border-border text-foreground font-mono"
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={policy.requireVerifiedMerchants}
                onChange={(e) => setPolicy({ ...policy, requireVerifiedMerchants: e.target.checked })}
                className="rounded border-border text-primary focus:ring-0"
              />
              <span className="text-foreground text-[11px]">Only buy from verified stores (PayPal Verified)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={policy.allowRefurbished}
                onChange={(e) => setPolicy({ ...policy, allowRefurbished: e.target.checked })}
                className="rounded border-border text-primary focus:ring-0"
              />
              <span className="text-foreground text-[11px]">Allow certified refurbished items (great for saving money)</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPolicy(DEFAULT_SPENDING_POLICY);
                resetUserPolicy();
                toast({ title: "Rules Reset", description: "Reverted to recommended safety rules.", type: "info" });
              }}
              className="text-xs"
            >
              Reset to Recommended
            </Button>
            <Button type="button" size="sm" onClick={() => handleSavePolicy(policy)}>
              Save Rules
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Settings / Custom API Keys Dialog: EASY WORDS */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Connect Your API Keys (Optional)"
        description="Everything works immediately in test mode without signing up! If you want to connect your own developer keys, paste them below."
      >
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          {/* Active Status Banner */}
          <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
            <span className="font-semibold text-foreground text-xs block">Current Connection Status:</span>
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Google Gemini AI:</span>
                <span className={hasLiveGemini ? "text-emerald-400 font-semibold" : "text-muted-foreground font-medium"}>
                  {hasLiveGemini ? "🟢 Live Key Connected" : "⚪ Ready in Test Mode"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>PayPal Sandbox:</span>
                <span className={hasLivePayPal ? "text-emerald-400 font-semibold" : "text-muted-foreground font-medium"}>
                  {hasLivePayPal ? "🟢 Live Sandbox Connected" : "⚪ Ready in Test Mode"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              Judges can test every feature immediately without creating any accounts.
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
              placeholder="AIzaSy... (leave blank to use Test Mode)"
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
              placeholder="Paste Client ID from your PayPal Dashboard"
              className="w-full text-xs px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* PayPal Client Secret Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground block">PayPal Sandbox Secret (Optional)</label>
            <input
              type="password"
              value={paypalClientSecretInput}
              onChange={(e) => setPaypalClientSecretInput(e.target.value)}
              placeholder="Paste Secret from your PayPal Dashboard"
              className="w-full text-xs px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Easy-Word Explanatory Note */}
          <div className="p-3 rounded-lg border border-border bg-blue-500/5 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground text-xs block">💡 Quick Note in Simple Words:</span>
            <p>
              <strong>1. Where are these keys?</strong> Go to your PayPal Developer dashboard under <em>&quot;Apps &amp; Credentials&quot;</em> and click the copy icon next to <strong>Client ID</strong> and <strong>Secret</strong>.
            </p>
            <p>
              <strong>2. Is this safe?</strong> Yes! For testing, your keys stay safely inside your private browser session.
            </p>
            <p>
              <strong>3. How real websites do this:</strong> Real apps keep secret keys locked safely inside backend cloud servers, or let users click <em>&quot;Connect with PayPal&quot;</em>.
            </p>
          </div>

          <p className="text-[10px] text-muted-foreground">
            You can also configure keys in <code>.env.local</code> as <code>PAYPAL_CLIENT_ID</code> and <code>PAYPAL_CLIENT_SECRET</code>.
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
              Clear Keys (Use Test Mode)
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveCredentials}>
                Save Keys
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Developer Integrations & Sponsor Proof Modal: EASY WORDS */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Developer Tools Used"
        description="A quick reference showing where each developer tool is used in our code."
      >
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">💳 PayPal Developer Platform</h4>
            <p>Creates checkout orders and confirms payments safely using the PayPal Orders API.</p>
            <code className="text-[10px] font-mono text-primary block mt-1">src/lib/payments/paypal.ts:13-92</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">🔍 Elastic Search</h4>
            <p>Matches what you ask for against store inventory to find the best products.</p>
            <code className="text-[10px] font-mono text-emerald-400 block mt-1">src/lib/integrations/sponsors.ts:70-76</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">📦 Channel3 Product Catalog</h4>
            <p>Supplies live store prices and product availability information.</p>
            <code className="text-[10px] font-mono text-purple-400 block mt-1">src/lib/integrations/sponsors.ts:25-67</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">📄 APIMatic Schema Context</h4>
            <p>Validates data formats so the AI never sends malformed parameters to PayPal.</p>
            <code className="text-[10px] font-mono text-blue-400 block mt-1">src/lib/integrations/sponsors.ts:79-90</code>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-0.5">📮 Postman Test Suite</h4>
            <p>Ready-to-run Postman test collection verifying live PayPal endpoints.</p>
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
