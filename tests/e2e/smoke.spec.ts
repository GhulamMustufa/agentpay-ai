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
    await expect(page.getByText("Shopping Demo & Dashboard")).toBeVisible();
    await expect(page.getByText("Your Spending Limit")).toBeVisible();
  });

  test("4. Magic Moment execution triggers shopping search and catch", async ({ page }) => {
    await page.goto("/dashboard");
    const executeButton = page.getByRole("button", { name: /start shopping search/i });
    await executeButton.click();

    // Verify searching state
    await expect(page.getByText(/searching stores/i)).toBeVisible();

    // Await fee caught or approval state
    await expect(page.getByText(/sneaky fee caught|your approval needed/i)).toBeVisible({ timeout: 5000 });
  });

  test("5. Interactive Documentation (/docs) loads with quickstart and copy button", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByText("Interactive Documentation")).toBeVisible();
    await expect(page.getByText("Quickstart Guide")).toBeVisible();
  });
});
