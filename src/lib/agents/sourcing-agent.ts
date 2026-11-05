/**
 * Agent 1: Sourcing Agent
 * Responsible for natural language intent analysis, cart decomposition
 * for multi-item projects, and multi-vendor quote retrieval.
 */

import { ShoppingQuote, ShoppingAnalysisResult } from "@/lib/ai/shopping-agent";

export interface SourcingResult {
  isShopping: boolean;
  isUnrealistic: boolean;
  category: string;
  extractedItem: string;
  budgetCap: number;
  quotes: ShoppingQuote[];
  feedbackMessage?: string;
  isMultiItem?: boolean;
  subItems?: { name: string; allocatedBudget: number }[];
  provider: string;
  latencyMs: number;
}

export class SourcingAgent {
  name = "Sourcing & Catalog Agent";
  role = "Product Discovery & Line-Item Procurement";

  /**
   * Evaluates prompt and queries live Gemini or local dynamic catalog.
   */
  async sourceQuotes(
    prompt: string,
    budgetCap: number,
    geminiApiKey?: string
  ): Promise<SourcingResult> {
    const t0 = performance.now();

    // Check if multi-item project request
    const isMultiItem = prompt.includes("+") || prompt.toLowerCase().includes(" and ") || prompt.toLowerCase().includes("kit") || prompt.toLowerCase().includes("setup");

    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        budgetCap,
        geminiApiKey: geminiApiKey || undefined,
      }),
    });

    const data = await res.json();
    const latencyMs = Math.round(performance.now() - t0);

    if (!data.success || !data.analysis) {
      throw new Error(data.error || "Sourcing Agent failed to retrieve catalog quotes.");
    }

    const analysis: ShoppingAnalysisResult = data.analysis;

    let subItems: { name: string; allocatedBudget: number }[] | undefined;
    if (isMultiItem && analysis.isShopping) {
      // Decompose into kit components
      subItems = [
        { name: "Primary Hardware / Core Item", allocatedBudget: Math.round(budgetCap * 0.6) },
        { name: "Peripheral / Accessory A", allocatedBudget: Math.round(budgetCap * 0.25) },
        { name: "Support Gear / Accessory B", allocatedBudget: Math.round(budgetCap * 0.15) },
      ];
    }

    return {
      isShopping: Boolean(analysis.isShopping),
      isUnrealistic: Boolean(analysis.isUnrealistic),
      category: analysis.category || "General",
      extractedItem: analysis.extractedItem || prompt,
      budgetCap: analysis.budgetCap || budgetCap,
      quotes: analysis.quotes || [],
      feedbackMessage: analysis.feedbackMessage,
      isMultiItem,
      subItems,
      provider: data.provider || (data.isLiveLLM ? "Google Gemini 3.5 Flash" : "Dynamic Engine"),
      latencyMs,
    };
  }
}

export const sourcingAgent = new SourcingAgent();
