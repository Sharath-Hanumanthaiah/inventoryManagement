/**
 * Sample Playwright test for the Inventory Management React/Vite app.
 *
 * Covers:
 *  - Dashboard loads and shows KPI cards
 *  - Navigation to Inventory list
 *  - Navigation to Categories page
 *  - Navigation to Orders page
 *
 * Uses ExecutionRecorder to produce flow recordings compatible with
 * the CodeValid upload pipeline.
 *
 * The webServer in playwright.config.js starts `vite dev --port 5174`
 * which proxies /api/* to the mock server on port 5001.
 * Start the mock server before running tests:
 *   node .codevalid/ui/mock/mock-server.js
 */

import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../helpers/execution-recorder.js";

// ---------------------------------------------------------------------------
// Test 1 – Dashboard renders KPI cards
// ---------------------------------------------------------------------------
test("dashboard loads and displays KPI stat cards", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "sample-dashboard-kpis",
    testTitle: "Dashboard loads and displays KPI stat cards",
  });

  await recorder.step("Navigate to root URL", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for Dashboard heading", async () => {
    await expect(page.getByRole("heading", { name: /Dashboard Overview/i })).toBeVisible({
      timeout: 15000,
    });
  });

  await recorder.step("Verify KPI cards are present", async () => {
    // The dashboard renders four KPI cards; assert at least one is visible
    const kpiCards = page.locator(".kpi-card");
    await expect(kpiCards.first()).toBeVisible({ timeout: 10000 });
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    recorder.record("KPI card count verified", { count });
  });

  await recorder.step("Take dashboard screenshot", async () => {
    await page.screenshot({ path: "dashboard-kpis.png", fullPage: false });
  });

  await recorder.save(testInfo);
});

// ---------------------------------------------------------------------------
// Test 2 – Navigation: Inventory page
// ---------------------------------------------------------------------------
test("navigates to Inventory list page", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "sample-nav-inventory",
    testTitle: "Navigates to Inventory list page",
  });

  await recorder.step("Navigate to root URL", async () => {
    await page.goto("/");
  });

  await recorder.step("Click Inventory nav link", async () => {
    // The Layout sidebar likely contains an 'Inventory' link
    const inventoryLink = page
      .getByRole("link", { name: /inventory/i })
      .first();
    await inventoryLink.click();
  });

  await recorder.step("Verify Inventory page URL", async () => {
    await expect(page).toHaveURL(/\/inventory/, { timeout: 10000 });
    recorder.record("URL confirmed", { url: page.url() });
  });

  await recorder.step("Verify page renders content", async () => {
    // The page should not be blank; check for any heading or list element
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });

  await recorder.save(testInfo);
});

// ---------------------------------------------------------------------------
// Test 3 – Navigation: Categories page
// ---------------------------------------------------------------------------
test("navigates to Categories page", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "sample-nav-categories",
    testTitle: "Navigates to Categories page",
  });

  await recorder.step("Navigate to root URL", async () => {
    await page.goto("/");
  });

  await recorder.step("Click Categories nav link", async () => {
    const catLink = page
      .getByRole("link", { name: /categor/i })
      .first();
    await catLink.click();
  });

  await recorder.step("Verify Categories page URL", async () => {
    await expect(page).toHaveURL(/\/categories/, { timeout: 10000 });
  });

  await recorder.save(testInfo);
});

// ---------------------------------------------------------------------------
// Test 4 – Navigation: Orders page
// ---------------------------------------------------------------------------
test("navigates to Orders / Place Order page", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "sample-nav-orders",
    testTitle: "Navigates to Orders / Place Order page",
  });

  await recorder.step("Navigate to root URL", async () => {
    await page.goto("/");
  });

  await recorder.step("Click Orders nav link", async () => {
    const ordersLink = page
      .getByRole("link", { name: /order/i })
      .first();
    await ordersLink.click();
  });

  await recorder.step("Verify Orders page URL", async () => {
    await expect(page).toHaveURL(/\/orders/, { timeout: 10000 });
  });

  await recorder.save(testInfo);
});
