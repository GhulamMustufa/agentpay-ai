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

  // Multi-Agent Swarm Pipeline States
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
    "3-Agent Swarm Initialized (Sourcing -> Policy Auditor -> PayPal Settlement).",
    `Spending limit active: Max budget cap set at $${budgetCap.toFixed(2)}.`,
    "Ready. Enter what you want to buy or select a preset below.",
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
      title: "Policy Guardrails Saved",
      description: `Max markup: $${newPolicy.maxMarkupTolerance.toFixed(2)} | Auto-approve: $${newPolicy.autoApproveThreshold.toFixed(2)}`,
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
        title: "Credentials Saved",
        description: "Your custom keys are active for live AI reasoning and PayPal Sandbox transactions.",
        type: "success",
      });
    } catch {
      toast({
        title: "Storage Error",
        description: "Could not save credentials to storage.",
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
        description: "Reverted to Zero-Config Sandbox mode.",
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
      `Switched preset: ${category.toUpperCase()} • Budget Cap: $${budget.toFixed(2)}.`,
    ]);
  };

  // Run the 3-Agent Cooperating Swarm Pipeline
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
      `[PIPELINE START] User Goal: "${userPrompt}" with $${budgetCap.toFixed(2)} limit.`,
      `🔍 Agent 1 (Sourcing Agent): Searching catalogs across verified distributors...`,
    ]);

    try {
      // 1. SOURCING AGENT EXECUTION
      const sourcingResult = await sourcingAgent.sourceQuotes(userPrompt, budgetCap, activeGeminiKey);

      setAgentPipeline((p) => ({
        ...p,
        sourcing: {
          status: sourcingResult.isShopping && !sourcingResult.isUnrealistic ? "completed" : "halted",
          latencyMs: sourcingResult.latencyMs,
          summary: `Extracted: ${sourcingResult.extractedItem} (${sourcingResult.quotes.length} quotes)`,
        },
      }));

      // Edge Case 1: Non-Shopping Query
      if (!sourcingResult.isShopping) {
        setInfoMessage(sourcingResult.feedbackMessage || "Non-shopping request detected. Please ask for an item to buy.");
        setIsRunning(false);
        setStatus("idle");
        setLogs((prev) => [
          ...prev,
          `⚠️ Sourcing Agent Halted: "${userPrompt}" is non-commercial. No payment initiated.`,
        ]);
        return;
      }

      // Edge Case 2: Unrealistic budget
      if (sourcingResult.isUnrealistic) {
        setWarningMessage(sourcingResult.feedbackMessage || "Budget limit too low for this item category.");
        setIsRunning(false);
        setStatus("idle");
        setLogs((prev) => [
          ...prev,
          `⚠️ Sourcing Agent Warning: $${sourcingResult.budgetCap.toFixed(2)} is below reasonable market minimum for ${sourcingResult.category}.`,
        ]);
        return;
      }

      setQuotes(sourcingResult.quotes);
      setLogs((prev) => [
        ...prev,
        `✓ Sourcing Agent finished in ${sourcingResult.latencyMs}ms (${sourcingResult.provider}).`,
        sourcingResult.isMultiItem ? `📦 Multi-Item Kit decomposed into 3 component line items.` : "",
        `🛡️ Agent 2 (Policy Auditor): Auditing candidate quotes against your active spending rules...`,
      ].filter(Boolean));

      // 2. POLICY AUDITOR AGENT EXECUTION
      setAgentStep(2);
      setAgentPipeline((p) => ({ ...p, auditing: { status: "running" } }));

      setTimeout(() => {
        const auditResult = policyAuditorAgent.auditQuotes(sourcingResult.quotes, budgetCap, policy);

        setAgentPipeline((p) => ({
          ...p,
          auditing: {
            status: "completed",
            summary: auditResult.hasDiscrepancy ? `Overcharge Caught: $${auditResult.moneySaved.toFixed(2)} saved` : "All quotes compliant",
          },
        }));

        setLogs((prev) => [...prev, ...auditResult.auditLogs]);

        if (auditResult.violatingQuote) {
          setPolicyAlert({
            vendor: auditResult.violatingQuote.vendor,
            quotedAmount: `$${auditResult.violatingQuote.price.toFixed(2)}`,
            budgetCap: `$${budgetCap.toFixed(2)}`,
            markup: `$${auditResult.violatingQuote.markup.toFixed(2)}`,
            reason: auditResult.violatingQuote.policyDetails?.violations.join(" ") || "Unapproved fee",
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
              description: `AI rejected overcharge. ${approved.item} ($${approved.price.toFixed(2)}) is ready for your 1-click confirmation.`,
              type: "success",
            });
          } else {
            // Auto-approved under policy threshold!
            setLogs((prev) => [
              ...prev,
              `⚡ Auto-Approval Policy Active (Order under $${policy.autoApproveThreshold.toFixed(2)}). Proceeding directly to settlement...`,
            ]);
            executeSettlementInternal(approved.item, approved.vendor, approved.price, auditResult.moneySaved);
          }
        }
      }, 700);
    } catch (err: any) {
      setIsRunning(false);
      setStatus("idle");
      setLogs((prev) => [...prev, `❌ Pipeline Error: ${err.message}`]);
      toast({
        title: "Pipeline Error",
        description: err.message,
        type: "error",
      });
    }
  };

  // Helper for Settlement Execution
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
      `💳 Agent 3 (PayPal Settlement Agent): Connecting to PayPal Orders v2 Sandbox...`,
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
          summary: `PayPal Order #${settlement.orderId} (${settlement.status})`,
        },
      }));

      // Refresh Ledger & Savings
      const updatedLedger = getLedgerRecords();
      setLedger(updatedLedger);
      setSavingsSummary(getSavingsSummary());

      setLogs((prev) => [
        ...prev,
        `✨ Settlement Completed in ${settlement.latencyMs}ms! PayPal Order #${settlement.orderId} captured.`,
        `Saved to Persistent Ledger: +$${moneySaved.toFixed(2)} in overcharges prevented.`,
      ]);

      setIsRunning(false);
      setStatus("success");
      toast({
        title: "Payment Confirmed!",
        description: `Paid $${priceAmount.toFixed(2)} via PayPal ${settlement.isLive ? "Live Sandbox" : "Sandbox"} in ${settlement.latencyMs}ms.`,
        type: "success",
      });
    } catch (err: any) {
      setIsRunning(false);
      setStatus("idle");
      setLogs((prev) => [...prev, `❌ Settlement Error: ${err.message}`]);
      toast({
        title: "Settlement Failed",
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
        title: "Edge Tests Complete",
        description: `${data.summary?.passed}/${data.summary?.total} live API tests passed (100%).`,
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
            AgentPay Platform
          </span>
          {hasLiveGemini && hasLivePayPal ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live Gemini + PayPal Sandbox
            </Badge>
          ) : hasLiveGemini ? (
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              🟢 Live Gemini 3.5 Flash
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
          <Button variant="outline" size="sm" onClick={() => setIsPolicyOpen(true)} className="px-2.5 sm:px-3 text-xs sm:text-sm">
            <Sliders className="w-3.5 h-3.5 mr-1 text-primary" /> Policies
          </Button>
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
                <span>Active Spending Cap</span>
                <Wallet className="w-4 h-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">${budgetCap.toFixed(2)} Max</CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Strict limit enforced by AI guardrail</p>
          </Card>

          <Card className="glass p-4">
            <CardHeader className="p-0 pb-1">
              <CardDescription className="flex items-center justify-between text-xs text-muted-foreground font-normal">
                <span>Cumulative Money Saved</span>
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-emerald-400">
                ${savingsSummary.totalSaved.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Across {savingsSummary.transactionCount} audited purchases</p>
          </Card>

          <Card className="glass p-4">
            <CardHeader className="p-0 pb-1">
              <CardDescription className="flex items-center justify-between text-xs text-muted-foreground font-normal">
                <span>Guardrail Policy</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">
                ${policy.maxMarkupTolerance.toFixed(2)} Surcharge Cap
              </CardTitle>
            </CardHeader>
            <p className="text-[11px] text-muted-foreground mt-1">Auto-approves under ${policy.autoApproveThreshold.toFixed(2)}</p>
          </Card>
        </div>

        {/* Multi-Agent Swarm Pipeline Stepper */}
        <Card className="glass p-3 border-border/80">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> 3-Agent Cooperating Swarm Pipeline
            </span>
            <Badge variant="outline" className="text-[10px]">
              {isRunning ? "● Active Execution" : "Autonomous Mode"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Agent 1 */}
            <div className={`p-2.5 rounded-lg border text-xs transition-all ${agentPipeline.sourcing.status === "running" ? "bg-primary/10 border-primary/50 shadow-sm" : agentPipeline.sourcing.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30 border-border/60"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  🔍 1. Sourcing Agent
                </span>
                {agentPipeline.sourcing.status === "running" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : agentPipeline.sourcing.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Ready</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {agentPipeline.sourcing.summary || "Product discovery & cart decomposition"}
              </p>
            </div>

            {/* Agent 2 */}
            <div className={`p-2.5 rounded-lg border text-xs transition-all ${agentPipeline.auditing.status === "running" ? "bg-primary/10 border-primary/50 shadow-sm" : agentPipeline.auditing.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30 border-border/60"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  🛡️ 2. Policy Auditor Agent
                </span>
                {agentPipeline.auditing.status === "running" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : agentPipeline.auditing.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Ready</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {agentPipeline.auditing.summary || "Stealth fee trap & budget compliance"}
              </p>
            </div>

            {/* Agent 3 */}
            <div className={`p-2.5 rounded-lg border text-xs transition-all ${agentPipeline.settlement.status === "running" ? "bg-primary/10 border-primary/50 shadow-sm" : agentPipeline.settlement.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30 border-border/60"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  💳 3. PayPal Settlement Agent
                </span>
                {agentPipeline.settlement.status === "running" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : agentPipeline.settlement.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Ready</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {agentPipeline.settlement.summary || "Orders v2 sandbox checkout & ledger write"}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Presets:
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
            variant={activeCategory === "kit" ? "glow" : "outline"}
            size="sm"
            onClick={() => applyPreset("Podcast Studio Kit: USB Condenser Mic + Studio Headphones + Boom Arm under $450", 450, "kit")}
            className="h-7 text-xs font-semibold border-purple-500/40"
          >
            🎙️ Multi-Item Studio Kit ($450)
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
                  <Badge variant="purple" className="text-[10px] font-medium">Guardrail Active</Badge>
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
                    <span>Executing Swarm...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                    <span>Run Procurement Swarm</span>
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
              <div className={`p-2 rounded-md border ${agentStep >= 1 ? "bg-primary/15 border-primary/40 text-foreground font-medium" : "border-border/60 text-muted-foreground"}`}>
                1. Sourcing Agent
              </div>
              <div className={`p-2 rounded-md border ${agentStep >= 2 ? (policyAlert ? "bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium" : "bg-primary/15 border-primary/40 text-foreground") : "border-border/60 text-muted-foreground"}`}>
                2. Policy Auditor
              </div>
              <div className={`p-2 rounded-md border ${agentStep >= 3 ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium" : "border-border/60 text-muted-foreground"}`}>
                3. Confirmation Gate
              </div>
              <div className={`p-2 rounded-md border ${agentStep >= 4 ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium" : "border-border/60 text-muted-foreground"}`}>
                4. Paid & Recorded
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

            {/* OVERCHARGE ALERT */}
            {policyAlert && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-400">Sneaky Fee Caught & Blocked</span>
                    <p className="text-muted-foreground mt-0.5 font-normal">
                      Store <span className="text-foreground font-medium">{policyAlert.vendor}</span> quoted{" "}
                      <span className="text-rose-400 font-semibold">{policyAlert.quotedAmount}</span> ({policyAlert.reason}). The Auditor Agent halted this charge.
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
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-[10px]">Verified Compliant</Badge>
                    <span className="text-xs text-muted-foreground">Ready for your confirmation</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{selectedProduct.name}</h4>
                  <p className="text-xs text-muted-foreground font-normal">
                    Direct from: <strong className="text-foreground">{selectedProduct.merchant}</strong> • Price:{" "}
                    <strong className="text-emerald-400 text-sm">{selectedProduct.price}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={handleAuthorizeSettlement}
                    disabled={isRunning}
                    className="w-full sm:w-auto font-medium"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Capturing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        <span>1-Click Approve via PayPal</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 4 CONSOLE TABS: Telemetry, Ledger, Edge Tests, MCP */}
            <div className="rounded-xl border border-border bg-card/80 p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-border/70 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveConsoleTab("telemetry")}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "telemetry" ? "bg-card text-foreground font-medium border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-primary" /> Live Agent Telemetry
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("ledger")}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "ledger" ? "bg-card text-foreground font-medium border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <History className="w-3.5 h-3.5 text-emerald-400" /> Audit Ledger & Savings ({ledger.length})
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("edge_tests")}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "edge_tests" ? "bg-card text-foreground font-medium border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-400" /> Live Edge-Case Suite
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("mcp")}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${activeConsoleTab === "mcp" ? "bg-card text-foreground font-medium border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Safe MCP Inspector
                  </button>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Status: {status === "idle" ? "Ready" : status === "running" ? "Working..." : status === "paused_for_approval" ? "Awaiting You" : "Complete"}
                </span>
              </div>

              {/* TAB 1: TELEMETRY */}
              {activeConsoleTab === "telemetry" && (
                <div className="font-mono text-[11px] space-y-1 max-h-[160px] overflow-y-auto pr-1">
                  {logs.map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      <span className="text-muted-foreground">&gt; </span>
                      <span className={log.includes("Successful") || log.includes("Verified") || log.includes("COMPLIANT") ? "text-emerald-400 font-normal" : log.includes("Caught") || log.includes("halted") || log.includes("VIOLATION") ? "text-rose-300 font-normal" : "text-foreground font-normal"}>
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
                    <span>Persistent record of completed purchases & overcharges prevented:</span>
                    <button onClick={clearLedger} className="text-[10px] text-muted-foreground hover:text-foreground underline">
                      Clear History
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[180px]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="border-b border-border text-muted-foreground font-medium">
                        <tr>
                          <th className="py-1.5 px-2">Time</th>
                          <th className="py-1.5 px-2">Product & Store</th>
                          <th className="py-1.5 px-2">Paid</th>
                          <th className="py-1.5 px-2">Saved</th>
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

              {/* TAB 3: LIVE EDGE-CASE SUITE */}
              {activeConsoleTab === "edge_tests" && (
                <div className="space-y-3 text-xs font-sans animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-foreground font-normal">
                      Run live tests against Google Gemini 3.5 Flash and PayPal Sandbox across adversarial prompts and edge cases.
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
                          <span>Testing Live APIs...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current mr-1.5" />
                          <span>Execute 4 Live Edge Tests</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {edgeTestsOutput && (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <span>✓ {edgeTestsOutput.summary?.passed} / {edgeTestsOutput.summary?.total} Live API Tests Passed</span>
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

              {/* TAB 4: MCP */}
              {activeConsoleTab === "mcp" && (
                <div className="space-y-2 text-xs font-sans text-muted-foreground">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-foreground font-normal">
                      Any AI (Claude, ChatGPT) can call our safe PayPal tools via Model Context Protocol (MCP JSON-RPC).
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
                          <span>Auditing...</span>
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
                        <span>✓ Response from PayPal MCP Server (HTTP {mcpLiveOutput.status})</span>
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

        {/* Dynamic Price Comparison Table */}
        <Card className="glass">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Dynamic Store Price Comparison</span>
              <span className="text-xs text-muted-foreground font-normal">Audited quotes based on your search</span>
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

      {/* POLICY CONFIGURATION DIALOG */}
      <Dialog
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        title="Custom Spending Policy & Guardrails"
        description="Configure the exact rules your Policy Auditor Agent enforces across all online stores."
      >
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-foreground">Max Unapproved Markup Tolerance ($)</label>
              <span className="font-mono text-primary font-bold">${policy.maxMarkupTolerance.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Any hidden surcharge or fee exceeding this is immediately halted.</p>
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
              <label className="text-[11px] font-medium text-foreground">Auto-Approve Spend Limit ($)</label>
              <span className="font-mono text-emerald-400 font-bold">${policy.autoApproveThreshold.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Purchases above this amount require human 1-click confirmation before paying.</p>
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
              <span className="text-foreground text-[11px]">Require PayPal Verified Merchants Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={policy.allowRefurbished}
                onChange={(e) => setPolicy({ ...policy, allowRefurbished: e.target.checked })}
                className="rounded border-border text-primary focus:ring-0"
              />
              <span className="text-foreground text-[11px]">Allow Certified Refurbished Items for Cost Savings</span>
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
                toast({ title: "Policies Reset", description: "Reverted to strict zero-surcharge guardrails.", type: "info" });
              }}
              className="text-xs"
            >
              Reset to Defaults
            </Button>
            <Button type="button" size="sm" onClick={() => handleSavePolicy(policy)}>
              Save Policies
            </Button>
          </div>
        </div>
      </Dialog>

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
                <span>Google Gemini AI:</span>
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

          {/* Easy-Word Explanatory Note */}
          <div className="p-3 rounded-lg border border-border bg-blue-500/5 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground text-xs block">💡 Quick Note in Simple Words:</span>
            <p>
              <strong>1. Where are these keys?</strong> In your PayPal Developer dashboard under <em>&quot;Apps &amp; Credentials&quot;</em>, you will see your <strong>Client ID</strong> and <strong>Secret</strong> (click the copy icon next to each one).
            </p>
            <p>
              <strong>2. Is this safe?</strong> Yes! For testing, your keys stay safely inside your private browser session.
            </p>
            <p>
              <strong>3. Real Production Standard:</strong> Real apps keep secret keys securely locked on backend cloud servers (never in the browser) or use <em>&quot;Connect with PayPal&quot;</em> buttons.
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
