import { describe, it, expect } from "vitest";
import { analyzeShoppingPrompt } from "../ai/shopping-agent";

describe("Dynamic Shopping Intelligence Engine", () => {
  it("should detect non-shopping queries and halt gracefully", () => {
    const result = analyzeShoppingPrompt("Hello, can you write me a poem about the sea?");
    expect(result.isShopping).toBe(false);
    expect(result.feedbackMessage).toContain("Non-Shopping Request");
    expect(result.quotes).toHaveLength(0);
  });

  it("should detect unrealistic budgets and warn user", () => {
    const result = analyzeShoppingPrompt("Find me a laptop under $15");
    expect(result.isShopping).toBe(true);
    expect(result.isUnrealistic).toBe(true);
    expect(result.feedbackMessage).toContain("Unrealistic Price Limit");
  });

  it("should dynamically extract category and budget for headphones", () => {
    const result = analyzeShoppingPrompt("Find noise canceling headphones under $250");
    expect(result.isShopping).toBe(true);
    expect(result.isUnrealistic).toBe(false);
    expect(result.category).toBe("headphones");
    expect(result.budgetCap).toBe(250);
    expect(result.quotes).toHaveLength(3);

    // Overpriced quote check
    expect(result.violatingQuote).toBeDefined();
    expect(result.violatingQuote?.price).toBeGreaterThan(250);
    expect(result.violatingQuote?.markup).toBeGreaterThan(0);

    // Approved quote check
    expect(result.approvedQuote).toBeDefined();
    expect(result.approvedQuote?.price).toBeLessThanOrEqual(250);
    expect(result.approvedQuote?.isCompliant).toBe(true);
  });

  it("should dynamically handle monitor category with custom budget", () => {
    const result = analyzeShoppingPrompt("Buy a 4k monitor for $400", 400);
    expect(result.category).toBe("monitor");
    expect(result.budgetCap).toBe(400);
    expect(result.approvedQuote?.item).toContain("Dell");
  });

  it("should dynamically handle ergonomic chair category", () => {
    const result = analyzeShoppingPrompt("Ergonomic desk chair for $350");
    expect(result.category).toBe("chair");
    expect(result.violatingQuote?.item).toContain("Herman Miller");
    expect(result.approvedQuote?.item).toContain("Steelcase");
  });
});
