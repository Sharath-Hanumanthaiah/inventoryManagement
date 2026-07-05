import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupDashboardMocks, waitForDashboardApis } from "../../helpers/mock-api.js";

const emptyScenario = {
  items: { status: 200, body: [] },
  orders: { status: 200, body: [] },
};

test("Dashboard renders correctly with empty inventory and order data", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("dashboard_handles_empty_inventory_and_orders", "Dashboard renders correctly with empty inventory and order data");

  await recorder.step("Mock empty inventory and empty order datasets");
  await setupDashboardMocks(page, emptyScenario);

  await recorder.step("Navigate to '/' and wait for API requests to complete");
  await page.goto("/");
  await waitForDashboardApis(page);

  await recorder.step("Verify the Dashboard page remains visible");
  await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();

  await recorder.step("Verify KPI metrics display zero values");
  await expect(page.getByText("Total Unique Items")).toBeVisible();
  await expect(page.locator(".kpi-card").filter({ hasText: "Out of Stock" })).toBeVisible();
  await expect(page.getByText("Low Stock (1-5)")).toBeVisible();
  await expect(page.getByText("Pending Orders")).toBeVisible();
  await expect(page.locator(".kpi-value").filter({ hasText: /^0$/ }).first()).toBeVisible();

  await recorder.step("Verify the Stock Alert Center displays no alert items");
  await expect(page.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();
  await expect(page.getByText("0 Alerts")).toBeVisible();
  await expect(page.getByText("No items are currently out of stock. Excellent!")).toBeVisible();
  await expect(page.getByText("No low stock items. Inventory healthy!")).toBeVisible();

  await recorder.step("Verify the graph representation areas are displayed without data");
  await expect(page.getByRole("heading", { name: "Sales Demand Trend" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product Demand Comparison" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seasonal Product Performance" })).toBeVisible();
  await expect(page.getByText("No data available")).toHaveCount(3);

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_handles_empty_inventory_and_orders");
  await recorder.save(testInfo);
});
