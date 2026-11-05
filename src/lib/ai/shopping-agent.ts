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

// Check for Non-Shopping Intent
const NON_SHOPPING_TRIGGERS = [
  "hello", "hi", "how are you", "who are you", "write a poem", "tell me a joke",
  "what is", "why is", "capital of", "weather", "translate", "help me code",
  "python", "javascript", "function", "math", "poem", "essay"
];

export function analyzeShoppingPrompt(prompt: string, userBudgetCap?: number): ShoppingAnalysisResult {
  const cleanPrompt = prompt.trim().toLowerCase();

  // Edge Case 1: Check for Non-Shopping Queries
  const isNonShopping = NON_SHOPPING_TRIGGERS.some((trigger) => cleanPrompt.startsWith(trigger)) &&
    !Object.values(CATEGORY_MAP).some(cat => cat.keywords.some(k => cleanPrompt.includes(k)));

  if (isNonShopping || cleanPrompt.length < 3) {
    return {
      isShopping: false,
      budgetCap: userBudgetCap || 0,
      feedbackMessage:
        "ℹ️ Non-Shopping Request: AgentPay is specialized for product price verification and safe checkout. Please search for an item you want to buy (e.g., 'Developer laptop under $900' or 'Wireless headphones under $250').",
      quotes: [],
    };
  }

  // Detect explicit budget in text (e.g. "under $900", "for $300", "< 500")
  let detectedBudget = userBudgetCap;
  const budgetMatch = cleanPrompt.match(/(?:under|below|for|budget|cap|\<|\$)\s*\$?(\d+(?:\.\d{2})?)/i);
  if (budgetMatch && budgetMatch[1]) {
    detectedBudget = parseFloat(budgetMatch[1]);
  }

  // Detect category
  let matchedCategoryKey = "laptop";
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (cat.keywords.some(k => cleanPrompt.includes(k))) {
      matchedCategoryKey = key;
      break;
    }
  }

  const categoryConfig = CATEGORY_MAP[matchedCategoryKey];
  const finalBudget = detectedBudget && detectedBudget > 0 ? detectedBudget : categoryConfig.defaultPrice;

  // Edge Case 2: Unrealistic budget
  if (finalBudget < categoryConfig.minReasonablePrice) {
    return {
      isShopping: true,
      isUnrealistic: true,
      category: matchedCategoryKey,
      budgetCap: finalBudget,
      feedbackMessage: `⚠️ Unrealistic Price Limit: Verified models for ${matchedCategoryKey}s typically start at $${categoryConfig.minReasonablePrice}+. No compliant stores found under $${finalBudget.toFixed(2)}.`,
      quotes: [],
    };
  }

  // Dynamic Quote Construction
  // Quote 1: Overpriced with sneaky fee
  const surcharge = categoryConfig.items.overpriced.surcharge;
  const quote1Price = Math.round(finalBudget * 1.05) + surcharge;

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
  const quote2Price = Math.round(finalBudget * 0.94);
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
  const quote3Price = Math.round(finalBudget * 0.98);
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
    category: matchedCategoryKey,
    extractedItem: categoryConfig.items.approved.name,
    budgetCap: finalBudget,
    quotes: [quote1, quote2, quote3],
    violatingQuote: quote1,
    approvedQuote: quote2,
  };
}
