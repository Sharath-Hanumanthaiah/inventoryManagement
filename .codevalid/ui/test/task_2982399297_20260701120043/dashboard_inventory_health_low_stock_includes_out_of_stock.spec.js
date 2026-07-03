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

test("Dashboard displays correct low stock count including out-of-stock items", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "dashboard_inventory_health_low_stock_includes_out_of_stock",
    "Dashboard displays correct low stock count including out-of-stock items"
  );

  try {
    await recorder.step("Register mocked inventory and order APIs for dashboard low-stock scenario", async () => {
      await mockHomePageApis(page, {
        inventory: inventoryFixtures,
        categories: [],
        orders: [],
      });
    });

    await recorder.step("Navigate directly to the dashboard route because the app has no sign-in page", async () => {
      await page.goto("/");
    });

    await recorder.step("Verify the dashboard page header is visible", async () => {
      await expect(page.getByRole("heading", { name: "Dashboard Overview", exact: true })).toBeVisible();
    });

    await recorder.step("Locate the low stock KPI and assert it includes quantity zero items per business rule", async () => {
      const lowStockKpi = page.locator(".kpi-card", {
        has: page.getByText("Low Stock (1-5)", { exact: true }),
      });
      await expect(lowStockKpi.locator(".kpi-value")).toHaveText("4");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_inventory_health_low_stock_includes_out_of_stock");
  } finally {
    await recorder.save(testInfo);
  }
});
