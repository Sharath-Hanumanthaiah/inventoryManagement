import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

const inventoryFixtures = [
  {
    id: "dash-item-0a",
    name: "Item Zero A",
    category: "General",
    quantity: 0,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-0b",
    name: "Item Zero B",
    category: "General",
    quantity: 0,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-0c",
    name: "Item Zero C",
    category: "General",
    quantity: 0,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
];

test("Dashboard correctly reflects all items being out of stock", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "dashboard_inventory_health_all_items_out_of_stock",
    "Dashboard correctly reflects all items being out of stock"
  );

  try {
    await recorder.step("Register mocked inventory where every item quantity is zero", async () => {
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

    await recorder.step("Assert low stock and out of stock equal total items, and in stock is zero", async () => {
      const lowStockKpi = page.locator(".kpi-card", {
        has: page.getByText("Low Stock (1-5)", { exact: true }),
      });
      const outOfStockKpi = page.locator(".kpi-card", {
        has: page.getByText("Out of Stock", { exact: true }),
      });
      const inStockKpi = page.locator(".kpi-card", {
        has: page.getByText("In Stock", { exact: true }),
      });

      await expect(lowStockKpi.locator(".kpi-value")).toHaveText("3");
      await expect(outOfStockKpi.locator(".kpi-value")).toHaveText("3");
      await expect(inStockKpi).toBeVisible();
      await expect(inStockKpi.locator(".kpi-value")).toHaveText("0");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_inventory_health_all_items_out_of_stock");
  } finally {
    await recorder.save(testInfo);
  }
});
