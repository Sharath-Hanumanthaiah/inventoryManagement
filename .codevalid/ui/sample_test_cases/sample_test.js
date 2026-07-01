import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../helpers/execution-recorder.js";

test.describe("Dashboard - Sample Test", () => {
  test("should load the dashboard and display KPI cards", async ({ page }, testInfo) => {
    const recorder = new ExecutionRecorder("CV-SAMPLE-001", "Dashboard KPI cards are visible");

    await recorder.step("Navigate to dashboard", async () => {
      await page.goto("/");
    });

    await recorder.step("Wait for page to be ready", async () => {
      await page.waitForLoadState("networkidle");
    });

    await recorder.step("Verify page title is visible", async () => {
      await expect(page.locator("h1")).toBeVisible();
    });

    await recorder.step("Verify KPI cards are rendered", async () => {
      const kpiCards = page.locator(".kpi-card");
      await expect(kpiCards).toHaveCount(4);
    });

    await recorder.step("Verify Total Unique Items KPI label", async () => {
      await expect(page.locator(".kpi-label").first()).toContainText("Total Unique Items");
    });

    await recorder.step("Verify Out of Stock KPI label", async () => {
      const labels = page.locator(".kpi-label");
      await expect(labels.nth(1)).toContainText("Out of Stock");
    });

    await recorder.step("Verify Low Stock KPI label", async () => {
      const labels = page.locator(".kpi-label");
      await expect(labels.nth(2)).toContainText("Low Stock");
    });

    await recorder.step("Verify Pending Orders KPI label", async () => {
      const labels = page.locator(".kpi-label");
      await expect(labels.nth(3)).toContainText("Pending Orders");
    });

    await recorder.save(testInfo);
  });

  test("should display Stock Alert Center panel", async ({ page }, testInfo) => {
    const recorder = new ExecutionRecorder("CV-SAMPLE-002", "Stock Alert Center panel is visible");

    await recorder.step("Navigate to dashboard", async () => {
      await page.goto("/");
    });

    await recorder.step("Wait for content to load", async () => {
      await page.waitForLoadState("networkidle");
    });

    await recorder.step("Verify Stock Alert Center panel title", async () => {
      await expect(page.locator(".panel-title").first()).toContainText("Stock Alert Center");
    });

    await recorder.step("Verify Stocking Up panel title", async () => {
      const panelTitles = page.locator(".panel-title");
      await expect(panelTitles.nth(1)).toContainText("Stocking Up");
    });

    await recorder.save(testInfo);
  });

  test("should navigate to Inventory page", async ({ page }, testInfo) => {
    const recorder = new ExecutionRecorder("CV-SAMPLE-003", "Navigation to inventory page works");

    await recorder.step("Navigate to dashboard", async () => {
      await page.goto("/");
    });

    await recorder.step("Navigate to /inventory", async () => {
      await page.goto("/inventory");
    });

    await recorder.step("Wait for page to load", async () => {
      await page.waitForLoadState("networkidle");
    });

    await recorder.step("Verify inventory page is accessible", async () => {
      await expect(page).toHaveURL(/inventory/);
    });

    await recorder.save(testInfo);
  });
});
