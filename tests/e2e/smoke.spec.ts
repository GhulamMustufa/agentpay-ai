import { test, expect } from "@playwright/test";

test.describe("AgentPay AI E2E Smoke Tests", () => {
  test("1. Landing page loads cleanly with headline and status badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("PayPal AI Hackathon 2026")).toBeVisible();
  });

  test("2. Theme toggle switches between dark and light modes cleanly", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // Check initial dark mode
    await expect(html).toHaveClass(/dark/);

    // Click toggle button
    const themeBtn = page.getByRole("button", { name: /toggle theme/i });
    await themeBtn.click();

    // Verify dark class removed
    await expect(html).not.toHaveClass(/dark/);

    // Click again to toggle back
    await themeBtn.click();
    await expect(html).toHaveClass(/dark/);
  });

  test("3. 1-Click Guest Demo Bypass button navigates directly to /dashboard", async ({ page }) => {
    await page.goto("/");
    const demoButton = page.getByRole("link", { name: /try the live demo|open demo/i }).first();
    await demoButton.click();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("AgentPay AI Shopping")).toBeVisible();
    await expect(page.getByText("Spending Limit")).toBeVisible();
    await expect(page.getByText("Powered by AG Grid")).toBeVisible();
  });

  test("4. Magic Moment execution triggers shopping search, catches hidden fee, and enables 1-click PayPal approval", async ({ page }) => {
    await page.goto("/dashboard");
    const executeButton = page.getByRole("button", { name: /find best deals safely/i });
    await executeButton.click();

    // Await fee blocked alert and 1-click approval button
    await expect(page.getByText(/overpriced store blocked/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: /1-click approve via paypal/i })).toBeVisible({ timeout: 8000 });
  });

  test("5. Interactive Documentation (/docs) loads with quickstart and copy button", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByText("Quickstart: Run AgentPay in 2 Minutes")).toBeVisible();
    await expect(page.getByText("Sponsor Developer Tools")).toBeVisible();
  });
});
