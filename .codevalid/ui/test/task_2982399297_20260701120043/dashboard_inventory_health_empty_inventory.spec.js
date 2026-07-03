import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

test("Dashboard correctly shows zero counts when no inventory items exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "dashboard_inventory_health_empty_inventory",
    "Dashboard correctly shows zero counts when no inventory items exist"
  );

  try {
    await recorder.step("Register mocked empty inventory and order APIs", async () => {
      await mockHomePageApis(page, {
        inventory: [],
        categories: [],
        orders: [],
      });
    });

    await recorder.step("Navigate to the dashboard landing page", async () => {
      await page.goto("/");
    });

    await recorder.step("Verify the dashboard heading is visible", async () => {
      await expect(page.getByRole("heading", { name: "Dashboard Overview", exact: true })).toBeVisible();
    });

    await recorder.step("Assert low stock, out of stock, and in stock counters all show zero", async () => {
      const lowStockKpi = page.locator(".kpi-card", {
        has: page.getByText("Low Stock (1-5)", { exact: true }),
      });
      const outOfStockKpi = page.locator(".kpi-card", {
        has: page.getByText("Out of Stock", { exact: true }),
      });
      const inStockKpi = page.locator(".kpi-card", {
        has: page.getByText("In Stock", { exact: true }),
      });

      await expect(lowStockKpi.locator(".kpi-value")).toHaveText("0");
      await expect(outOfStockKpi.locator(".kpi-value")).toHaveText("0");
      await expect(inStockKpi).toBeVisible();
      await expect(inStockKpi.locator(".kpi-value")).toHaveText("0");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_inventory_health_empty_inventory");
  } finally {
    await recorder.save(testInfo);
  }
});
