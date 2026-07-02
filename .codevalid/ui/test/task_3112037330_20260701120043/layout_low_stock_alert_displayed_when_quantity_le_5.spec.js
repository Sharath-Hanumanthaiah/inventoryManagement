import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";

const inventoryResponse = [
  {
    id: "inv-low-1",
    name: "Tomatoes",
    category: "Produce",
    quantity: 5,
    state: "solid",
    expiryDate: "2026-07-10",
    lastStockIn: "2026-06-30",
    salesTrend: [6, 5, 4, 5, 6, 5],
    seasonalSales: { summer: 18, monsoon: 9, winter: 9, spring: 10 }
  },
  {
    id: "inv-2",
    name: "Rice",
    category: "Grains",
    quantity: 20,
    state: "solid",
    expiryDate: "2027-01-01",
    lastStockIn: "2026-06-20",
    salesTrend: [2, 2, 3, 3, 2, 4],
    seasonalSales: { summer: 5, monsoon: 7, winter: 8, spring: 6 }
  }
];

const categoriesResponse = [
  { id: "cat-1", name: "Produce", description: "Fresh produce" },
  { id: "cat-2", name: "Grains", description: "Grains and staples" }
];

const ordersResponse = [
  {
    id: "ord-1",
    itemName: "Tomatoes",
    category: "Produce",
    quantity: 10,
    state: "solid",
    orderDate: "2026-06-30",
    expectedArrival: "2026-07-04",
    status: "pending",
    price: 20.0
  }
];

test("Low Stock Alerts Are Visible When Inventory Quantity Is 5 or Less", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_low_stock_alert_displayed_when_quantity_le_5", "Low Stock Alerts Are Visible When Inventory Quantity Is 5 or Less");

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    // App calls /api/items (not /api/inventory)
    if (method === "GET" && path.endsWith("/api/items")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(inventoryResponse) });
      return;
    }

    if (method === "GET" && path.endsWith("/api/categories")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(categoriesResponse) });
      return;
    }

    if (method === "GET" && path.endsWith("/api/orders")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ordersResponse) });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  try {
    await recorder.recordStep("Navigate to the dashboard where global stock alerts are summarized");
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Overview", exact: true })).toBeVisible();

    await recorder.recordStep("Verify the low stock KPI label is visible");
    await expect(page.getByText("Low Stock (1-5)")).toBeVisible();

    await recorder.recordStep("Verify the low stock KPI count shows 1");
    // Scope to the KPI card that contains the Low Stock label to avoid matching other '1' values
    const lowStockKpi = page.locator(".kpi-card", { has: page.getByText("Low Stock (1-5)") });
    await expect(lowStockKpi.locator(".kpi-value")).toContainText("1");

    await recorder.recordStep("Confirm the low stock item is surfaced in a visually distinct warning area");
    // The Dashboard renders low-stock items in a "Low Stock Warning" section with item name and quantity badge.
    // Scope to the low-stock quick-list to avoid matching the same item name in the "Stocking Up" panel.
    const lowStockSection = page.locator(".quick-list").filter({ has: page.locator(".badge-lowstock") });
    await expect(lowStockSection.locator(".item-title", { hasText: "Tomatoes" })).toBeVisible();
    await expect(lowStockSection.locator(".badge-lowstock", { hasText: "5 left" })).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_low_stock_alert_displayed_when_quantity_le_5");
  } finally {
    await recorder.save(testInfo);
  }
});
