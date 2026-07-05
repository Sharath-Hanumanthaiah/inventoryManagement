import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { dashboardScenarios, setupDashboardMocks, waitForDashboardApis } from "../../helpers/mock-api.js";

test("Dashboard loads analytics with inventory and order data", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("dashboard_loads_inventory_analytics_successfully", "Dashboard loads analytics with inventory and order data");

  await recorder.step("Set up mocked GET /api/items and GET /api/orders responses with mixed inventory quantities and valid order data");
  await setupDashboardMocks(page, dashboardScenarios.analyticsDefaultSuccess);

  await recorder.step("Navigate to the default landing route '/' ");
  await page.goto("/");

  await recorder.step("Wait for dashboard API requests to complete");
  await waitForDashboardApis(page);

  await recorder.step("Verify the Dashboard page is displayed");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
  await expect(page.getByText("Real-time analytics, stock warnings, and seasonal demand intelligence")).toBeVisible();

  await recorder.step("Verify inventory analytics metrics are visible");
  await expect(page.getByText("Total Unique Items")).toBeVisible();
  await expect(page.getByText("Out of Stock")).toBeVisible();
  await expect(page.getByText("Low Stock (1-5)")).toBeVisible();
  await expect(page.getByText("Pending Orders")).toBeVisible();
  await expect(page.getByText("4", { exact: true })).toBeVisible();
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("2", { exact: true })).toBeVisible();

  await recorder.step("Verify Out of Stock metrics include items where quantity equals 0");
  await expect(page.getByRole("heading", { name: "Out of Stock (0 units)" })).toBeVisible();
  await expect(page.getByText("Tomato Soup")).toBeVisible();
  await expect(page.getByText("Out of Stock", { exact: true })).toBeVisible();

  await recorder.step("Verify Low Stock metrics include items where quantity is between 1 and 5");
  await expect(page.getByRole("heading", { name: "Low Stock Warning (1 to 5 units)" })).toBeVisible();
  await expect(page.getByText("Pasta")).toBeVisible();
  await expect(page.getByText("3 left")).toBeVisible();

  await recorder.step("Verify In Stock metrics include items where quantity is greater than 5");
  await expect(page.getByText("Premium Rice")).toBeVisible();
  await expect(page.getByText("Olive Oil")).toBeVisible();
  await expect(page.getByText("Low Stock Warning (1 to 5 units)")).toBeVisible();
  await expect(page.getByText("Tomato Soup")).toBeVisible();

  await recorder.step("Verify the Stock Alert Center is visible");
  await expect(page.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();
  await expect(page.getByText("2 Alerts")).toBeVisible();

  await recorder.step("Verify trend and graph visualizations are displayed");
  await expect(page.getByRole("heading", { name: "Sales Demand Trend" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product Demand Comparison" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seasonal Product Performance" })).toBeVisible();
  await expect(page.locator("select.form-select")).toBeVisible();

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_loads_inventory_analytics_successfully");
  await recorder.save(testInfo);
});
