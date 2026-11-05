import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeShoppingPrompt, ShoppingAnalysisResult } from "@/lib/ai/shopping-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, budgetCap = 900, geminiApiKey } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt string." },
        { status: 400 }
      );
    }

    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    // If an API key is available, call Google Gemini 1.5 Flash
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const promptTemplate = `
You are the AI procurement engine for AgentPay.
The user wants to buy: "${prompt}".
The user's maximum budget cap is $${budgetCap}.

Evaluate the request:
1. Is this a shopping or purchasing request? (e.g. buying a laptop, chair, headphones, coffee machine, etc.)
   If NOT a shopping request (e.g. "write a poem", "tell me a joke", "what is the capital of France"):
   set isShopping: false, feedbackMessage: "AgentPay is an AI shopping and purchasing agent. Please enter an item or equipment you want to buy.", quotes: []

2. If it IS a shopping request, is the budgetCap unrealistically low for this category (e.g., a brand new laptop for $30, a car for $200)?
   If unrealistic: set isShopping: true, isUnrealistic: true, feedbackMessage: "Budget of $${budgetCap} is below reasonable market minimum for this item.", quotes: []

3. If it is a valid shopping request with a reasonable budget:
   - Identify category (e.g., "laptop", "audio", "office furniture", "phone")
   - Identify extractedItem
   - Generate exactly 3 realistic market vendor quotes:
     * Quote 1 (Violating Overcharge): price must EXCEED budgetCap by 5-15% because of an unapproved hidden fee (e.g. "Unauthorized Expedited Processing Fee"). Set isCompliant: false, markup: number (e.g. 50-100), markupReason: "Unauthorized Surcharge".
     * Quote 2 (Compliant Fair Price): price must be 5-15% UNDER budgetCap from a verified direct merchant. isCompliant: true, markup: 0.
     * Quote 3 (Alternative / Refurbished): price must be 10-25% UNDER budgetCap. isCompliant: true, markup: 0.
   - Set violatingQuote to Quote 1.
   - Set approvedQuote to Quote 2.

Return STRICT JSON matching this exact structure:
{
  "isShopping": true,
  "isUnrealistic": false,
  "category": "laptop",
  "extractedItem": "Dell XPS 13",
  "budgetCap": ${budgetCap},
  "feedbackMessage": null,
  "quotes": [
    {
      "vendor": "CloudTech Supply",
      "item": "Dell XPS 13",
      "specs": "Intel i7 • 16GB RAM • 512GB SSD",
      "price": 949.00,
      "markup": 100.00,
      "markupReason": "Unauthorized Expedited Fee",
      "isCompliant": false,
      "warranty": "1-Year Standard",
      "matchScore": 0.88
    },
    {
      "vendor": "Official Dell Direct (PayPal Verified)",
      "item": "Dell XPS 13",
      "specs": "Intel i7 • 16GB RAM • 512GB SSD",
      "price": 849.00,
      "markup": 0,
      "isCompliant": true,
      "warranty": "Full 1-Year Manufacturer Warranty",
      "matchScore": 0.98
    },
    {
      "vendor": "Certified Refurb Store",
      "item": "MacBook Air M2 (Refurb)",
      "specs": "M2 • 16GB RAM • 256GB SSD",
      "price": 799.00,
      "markup": 0,
      "isCompliant": true,
      "warranty": "90-Day Refurb Warranty",
      "matchScore": 0.92
    }
  ],
  "violatingQuote": { ...same as quote 1... },
  "approvedQuote": { ...same as quote 2... }
}
`;

        const result = await model.generateContent(promptTemplate);
        const text = result.response.text();
        const parsed = JSON.parse(text) as ShoppingAnalysisResult;

        return NextResponse.json({
          success: true,
          isLiveLLM: true,
          model: "gemini-1.5-flash",
          provider: "Google Gemini AI",
          analysis: parsed,
        });
      } catch (llmErr: any) {
        console.warn("Gemini Live call failed, falling back to local intelligence engine:", llmErr.message);
        const fallback = analyzeShoppingPrompt(prompt, budgetCap);
        return NextResponse.json({
          success: true,
          isLiveLLM: false,
          fallbackReason: llmErr.message,
          provider: "AgentPay Smart Engine (Local Fallback)",
          analysis: fallback,
        });
      }
    }

    // Zero-config mode: Local dynamic intelligence engine
    const analysis = analyzeShoppingPrompt(prompt, budgetCap);
    return NextResponse.json({
      success: true,
      isLiveLLM: false,
      provider: "AgentPay Dynamic Engine (Zero-Config)",
      analysis,
    });
  } catch (err: any) {
    console.error("AI Analysis Route Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze shopping prompt" },
      { status: 500 }
    );
  }
}
