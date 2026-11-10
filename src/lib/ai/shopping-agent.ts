/**
 * Dynamic Shopping Intelligence Engine & Edge Case Handler
 * Parses user prompts, extracts budget caps, detects non-shopping queries,
 * and generates realistic multi-vendor quotes for any product category.
 */

export interface ShoppingQuote {
  vendor: string;
  item: string;
  specs: string;
  price: number;
  markup: number;
  markupReason?: string;
  isCompliant: boolean;
  warranty: string;
  matchScore: number;
}

export interface ShoppingAnalysisResult {
  isShopping: boolean;
  isUnrealistic?: boolean;
  category?: string;
  extractedItem?: string;
  budgetCap: number;
  feedbackMessage?: string;
  quotes: ShoppingQuote[];
  violatingQuote?: ShoppingQuote;
  approvedQuote?: ShoppingQuote;
}

// Category presets with realistic baseline prices
const CATEGORY_MAP: Record<string, {
  keywords: string[];
  minReasonablePrice: number;
  defaultPrice: number;
  items: {
    overpriced: { vendor: string; name: string; specs: string; surcharge: number; surchargeName: string };
    approved: { vendor: string; name: string; specs: string };
    alternative: { vendor: string; name: string; specs: string };
  };
}> = {
  kit: {
    keywords: ["studio kit", "podcast", "microphone", "mic", "boom arm", "usb mic", "starter kit"],
    minReasonablePrice: 40,
    defaultPrice: 450,
    items: {
      overpriced: {
        vendor: "ProAudio Warehouse",
        name: "Creator Studio Audio Bundle",
        specs: "USB-C Condenser Mic • Studio Cans • Boom Arm",
        surcharge: 65,
        surchargeName: "Unauthorized Studio Bundle Fee",
      },
      approved: {
        vendor: "Official Creator Direct (PayPal Verified)",
        name: "Shure MV7 + Studio Monitor Bundle",
        specs: "USB/XLR Dynamic Mic • Closed-Back Headphones • Desk Boom",
      },
      alternative: {
        vendor: "CreatorGear Outlet",
        name: "Blue Yeti X Podcast Kit",
        specs: "4-Capsule Condenser Mic • Pop Filter • Articulated Arm",
      },
    },
  },
  laptop: {
    keywords: ["laptop", "notebook", "macbook", "computer", "thinkpad", "workstation", "pc"],
    minReasonablePrice: 200,
    defaultPrice: 900,
    items: {
      overpriced: {
        vendor: "CloudTech Supply",
        name: "Dell XPS 13 Developer Edition",
        specs: "Intel Core i7-1360P • 16GB RAM • 512GB SSD",
        surcharge: 100,
        surchargeName: "Unauthorized Rush Processing Fee",
      },
      approved: {
        vendor: "Official Dell Direct (PayPal Verified)",
        name: "Dell XPS 13 Developer Edition",
        specs: "Intel Core i7-1360P • 16GB RAM • 512GB SSD • Ubuntu/Win",
      },
      alternative: {
        vendor: "Certified Refurb Store",
        name: "Apple MacBook Air 13\" M2",
        specs: "Apple M2 • 16GB Unified RAM • 256GB SSD (90-day warranty)",
      },
    },
  },
  headphones: {
    keywords: ["headphone", "headphones", "earbuds", "earphones", "airpods", "headset", "audio"],
    minReasonablePrice: 30,
    defaultPrice: 250,
    items: {
      overpriced: {
        vendor: "AudioExpress Store",
        name: "Sony WH-1000XM5 Wireless",
        specs: "Active Noise Canceling • 30hr Battery • LDAC Hi-Res",
        surcharge: 45,
        surchargeName: "Mandatory Express Handling Fee",
      },
      approved: {
        vendor: "Bose Authorized Direct",
        name: "Bose QuietComfort 45",
        specs: "World-Class Noise Canceling • Aware Mode • 24hr Battery",
      },
      alternative: {
        vendor: "SoundWorld Outlet",
        name: "Sennheiser Momentum 4",
        specs: "Adaptive ANC • 60hr Battery Life • Open Box",
      },
    },
  },
  monitor: {
    keywords: ["monitor", "display", "screen", "4k", "ultrawide", "oled"],
    minReasonablePrice: 80,
    defaultPrice: 400,
    items: {
      overpriced: {
        vendor: "ScreenDepot International",
        name: "LG 27UK850 4K UHD Display",
        specs: "27\" 4K UHD (3840x2160) • IPS HDR10 • USB-C 60W",
        surcharge: 60,
        surchargeName: "Regional Freight Surcharge",
      },
      approved: {
        vendor: "Dell Official Store",
        name: "Dell S2722QC 27\" 4K USB-C Hub",
        specs: "27\" 4K UHD • 99% sRGB • USB-C Power Delivery • 3-Yr Warranty",
      },
      alternative: {
        vendor: "ASUS Authorized Partner",
        name: "ASUS ProArt PA278CV",
        specs: "27\" 1440p QHD • Calman Verified 100% sRGB • Ergonomic Stand",
      },
    },
  },
  chair: {
    keywords: ["chair", "seating", "desk chair", "ergonomic", "seat"],
    minReasonablePrice: 50,
    defaultPrice: 350,
    items: {
      overpriced: {
        vendor: "OfficeComfort Solutions",
        name: "Herman Miller Mirra 2 (Remanufactured)",
        specs: "Triflex Back • Harmonic 2 Tilt • Adjustable Lumbar",
        surcharge: 75,
        surchargeName: "Third-Party Assembly Surcharge",
      },
      approved: {
        vendor: "Steelcase Direct Store",
        name: "Steelcase Series 1 Ergonomic Chair",
        specs: "LiveBack Technology • Weight-Activated Recline • 12-Yr Warranty",
      },
      alternative: {
        vendor: "Autonomous Outlet",
        name: "Autonomous ErgoChair Pro",
        specs: "Adjustable Headrest & Armrests • Up to 300 lbs Capacity",
      },
    },
  },
};

// Check for Non-Shopping Intent & Prompt Injection Patterns
const NON_SHOPPING_TRIGGERS = [
  "hello", "hi", "how are you", "who are you", "write", "tell me a joke",
  "what is", "why is", "explain", "capital of", "weather", "translate", "help me code",
  "python", "javascript", "function", "math", "poem", "haiku", "essay", "story", "recipe",
  "summarize", "select * from",
];

const INJECTION_TRIGGERS = [
  "system override",
  "ignore all budget",
  "ignore previous",
  "ignore all rules",
  "bypass policy",
  "zero verification",
  "override limit",
];

const GENERAL_SHOPPING_VERBS = ["buy", "purchase", "find me", "shop", "order", "need a", "looking for", "price"];
const GENERAL_PRODUCT_NOUNS = [
  "keyboard", "mouse", "webcam", "desk", "gpu", "iphone", "smartphone", "phone", "tablet", "ipad",
  "camera", "speaker", "charger", "cable", "router", "ssd", "drive", "printer", "coffee",
];

export function analyzeShoppingPrompt(prompt: string, userBudgetCap?: number): ShoppingAnalysisResult {
  const cleanPrompt = prompt.trim().toLowerCase();
  const hasExplicitBudget = typeof userBudgetCap === "number" && Number.isFinite(userBudgetCap) && userBudgetCap > 0;
  const boundedUserBudget = hasExplicitBudget ? userBudgetCap : 0;

  // Security Gate: Neutralize prompt-injection override attempts deterministically
  if (INJECTION_TRIGGERS.some((trig) => cleanPrompt.includes(trig))) {
    return {
      isShopping: false,
      budgetCap: boundedUserBudget,
      feedbackMessage:
        "🛡️ Guardrail Blocked Prompt Override: Adversarial instructions cannot alter your spending cap or bypass PayPal verification.",
      quotes: [],
    };
  }

  // Detect category explicitly using word boundaries so short tokens like "mic" don't match "ergonomic"
  let matchedCategoryKey: string | null = null;
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    const hasMatch = cat.keywords.some((k) => {
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(cleanPrompt);
    });
    if (hasMatch) {
      matchedCategoryKey = key;
      break;
    }
  }

  // Edge Case 1: Check for Non-Shopping Queries (either explicit trigger or no recognizable shopping intent)
  const startsOrContainsNonShopping = NON_SHOPPING_TRIGGERS.some(
    (trigger) => cleanPrompt.startsWith(trigger) || cleanPrompt.includes(trigger)
  );
  const matchesProductNoun = GENERAL_PRODUCT_NOUNS.some((noun) => new RegExp(`\\b${noun}\\b`, "i").test(cleanPrompt));
  const hasShoppingSignal =
    Boolean(matchedCategoryKey) ||
    matchesProductNoun ||
    GENERAL_SHOPPING_VERBS.some((verb) => cleanPrompt.includes(verb));

  if (cleanPrompt.length < 3 || (!matchedCategoryKey && (startsOrContainsNonShopping || !hasShoppingSignal))) {
    return {
      isShopping: false,
      budgetCap: boundedUserBudget,
      feedbackMessage:
        "ℹ️ Non-Shopping Request: AgentPay is specialized for product price verification and safe checkout. Please search for an item you want to buy (e.g., 'Developer laptop under $900' or 'Wireless headphones under $250').",
      quotes: [],
    };
  }

  const effectiveCategoryKey = matchedCategoryKey || "general";

  // Detect explicit budget in text (e.g. "under $900", "for $300", "< 500")
  // Security rule: If caller passed an explicit userBudgetCap, prompt text can tighten it but NEVER raise it!
  let detectedBudget = hasExplicitBudget ? boundedUserBudget : undefined;
  const budgetMatch = cleanPrompt.match(/(?:under|below|for|budget|cap|\<|\$)\s*\$?(\d+(?:\.\d{2})?)/i);
  if (budgetMatch && budgetMatch[1]) {
    const promptBudget = parseFloat(budgetMatch[1]);
    if (Number.isFinite(promptBudget) && promptBudget > 0) {
      detectedBudget = hasExplicitBudget ? Math.min(boundedUserBudget, promptBudget) : promptBudget;
    }
  }

  const requestedLabel =
    prompt
      .trim()
      .replace(/^(buy|find me|find|purchase|order|shop for|looking for)\s+(a|an)?\s*/i, "")
      .replace(/\s+(under|below|for|budget|cap)\s*\$?\d+(?:\.\d{2})?.*$/i, "")
      .trim()
      .slice(0, 48) || "Requested Hardware Item";

  const categoryConfig =
    matchedCategoryKey && CATEGORY_MAP[matchedCategoryKey]
      ? CATEGORY_MAP[matchedCategoryKey]
      : {
          keywords: [],
          minReasonablePrice: 10,
          defaultPrice: 150,
          items: {
            overpriced: {
              vendor: "Reseller Express Hub",
              name: requestedLabel,
              specs: "Standard Retail Model • 3rd-Party Fulfillment",
              surcharge: Math.max(8, Math.round((detectedBudget || 150) * 0.15)),
              surchargeName: "Unauthorized Handling Fee",
            },
            approved: {
              vendor: "Verified Merchant Direct (PayPal Verified)",
              name: requestedLabel,
              specs: "Factory Sealed • Direct Merchant Fulfillment",
            },
            alternative: {
              vendor: "Authorized Outlet Store",
              name: `${requestedLabel} (Value Bundle)`,
              specs: "Standard Retail Warranty • Verified Seller",
            },
          },
        };
  const finalBudget =
    typeof userBudgetCap === "number" && Number.isFinite(userBudgetCap) && userBudgetCap <= 0
      ? userBudgetCap
      : detectedBudget && detectedBudget > 0
        ? detectedBudget
        : categoryConfig.defaultPrice;

  // Edge Case 2: Zero, negative, or unrealistic budget
  if (!Number.isFinite(finalBudget) || finalBudget <= 0 || finalBudget < categoryConfig.minReasonablePrice) {
    return {
      isShopping: true,
      isUnrealistic: true,
      category: effectiveCategoryKey,
      budgetCap: Math.max(0, finalBudget),
      feedbackMessage: `⚠️ Unrealistic Price Limit: Verified models for ${effectiveCategoryKey} items typically start at $${categoryConfig.minReasonablePrice}+. No compliant stores found under $${Math.max(0, finalBudget).toFixed(2)}.`,
      quotes: [],
    };
  }

  // Dynamic Quote Construction
  // Quote 1: Overpriced with sneaky fee
  const surcharge = categoryConfig.items.overpriced.surcharge;
  const quote1Price = Math.max(finalBudget + 1, Math.round(finalBudget * 1.05) + surcharge);

  const quote1: ShoppingQuote = {
    vendor: categoryConfig.items.overpriced.vendor,
    item: categoryConfig.items.overpriced.name,
    specs: categoryConfig.items.overpriced.specs,
    price: quote1Price,
    markup: surcharge,
    markupReason: categoryConfig.items.overpriced.surchargeName,
    isCompliant: false,
    warranty: "1-Year Standard",
    matchScore: 0.88,
  };

  // Quote 2: Compliant, fair price under budget
  const quote2Price = Math.max(1, Number((finalBudget * 0.94).toFixed(2)));
  const quote2: ShoppingQuote = {
    vendor: categoryConfig.items.approved.vendor,
    item: categoryConfig.items.approved.name,
    specs: categoryConfig.items.approved.specs,
    price: quote2Price,
    markup: 0,
    isCompliant: true,
    warranty: "Full 1-Year Manufacturer Warranty",
    matchScore: 0.98,
  };

  // Quote 3: Alternative
  const quote3Price = Math.max(1, Number((finalBudget * 0.98).toFixed(2)));
  const quote3: ShoppingQuote = {
    vendor: categoryConfig.items.alternative.vendor,
    item: categoryConfig.items.alternative.name,
    specs: categoryConfig.items.alternative.specs,
    price: quote3Price,
    markup: 0,
    isCompliant: true,
    warranty: "90-Day Limited Warranty",
    matchScore: 0.92,
  };

  return {
    isShopping: true,
    isUnrealistic: false,
    category: effectiveCategoryKey,
    extractedItem: categoryConfig.items.approved.name,
    budgetCap: finalBudget,
    quotes: [quote1, quote2, quote3],
    violatingQuote: quote1,
    approvedQuote: quote2,
  };
}
