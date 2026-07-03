import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

const inventoryFixtures = [
  {
    id: "dash-item-6",
    name: "Item Six",
    category: "General",
    quantity: 6,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-10",
    name: "Item Ten",
    category: "General",
    quantity: 10,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-15",
    name: "Item Fifteen",
    category: "General",
    quantity: 15,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
];

test("Dashboard correctly reflects all items in stock with quantity > 5", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "dashboard_inventory_health_all_items_in_stock_above_threshold",
    "Dashboard correctly reflects all items in stock with quantity > 5"
  );

  try {
    await recorder.step("Register mocked inventory where every item is above the low-stock threshold", async () => {
      await mockHomePageApis(page, {
        inventory: inventoryFixtures,
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

    await recorder.step("Assert low stock and out of stock are zero and in stock equals total items", async () => {
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
      await expect(inStockKpi.locator(".kpi-value")).toHaveText("3");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_inventory_health_all_items_in_stock_above_threshold");
  } finally {
    await recorder.save(testInfo);
  }
});
