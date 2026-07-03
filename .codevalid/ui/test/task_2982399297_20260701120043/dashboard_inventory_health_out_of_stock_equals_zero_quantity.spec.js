import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

const inventoryFixtures = [
  {
    id: "dash-item-0",
    name: "Item Zero",
    category: "General",
    quantity: 0,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-1",
    name: "Item One",
    category: "General",
    quantity: 1,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-3",
    name: "Item Three",
    category: "General",
    quantity: 3,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
  {
    id: "dash-item-5",
    name: "Item Five",
    category: "General",
    quantity: 5,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-06-01",
    salesTrend: [1, 1, 1, 1, 1, 1],
    seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
  },
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
];

test("Dashboard correctly identifies out-of-stock items (quantity == 0)", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "dashboard_inventory_health_out_of_stock_equals_zero_quantity",
    "Dashboard correctly identifies out-of-stock items (quantity == 0)"
  );

  try {
    await recorder.step("Register mocked inventory and order APIs for out-of-stock scenario", async () => {
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

    await recorder.step("Assert the out-of-stock KPI shows only the quantity-zero items", async () => {
      const outOfStockKpi = page.locator(".kpi-card", {
        has: page.getByText("Out of Stock", { exact: true }),
      });
      await expect(outOfStockKpi.locator(".kpi-value")).toHaveText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_inventory_health_out_of_stock_equals_zero_quantity");
  } finally {
    await recorder.save(testInfo);
  }
});
