import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { dashboardScenarios, setupDashboardMocks, waitForDashboardApis } from "../../helpers/mock-api.js";

test("Dashboard correctly classifies stock status boundary values", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("dashboard_displays_correct_stock_classification_boundaries", "Dashboard correctly classifies stock status boundary values");

  await recorder.step("Mock inventory items with quantities 0, 1, 5, and 6+ and valid orders");
  await setupDashboardMocks(page, dashboardScenarios.metricClassification);

  await recorder.step("Navigate to '/' and wait for inventory and order data to load");
  await page.goto("/");
  await waitForDashboardApis(page);

  await recorder.step("Verify the item with quantity 0 appears in the Out of Stock category");
  const stockAlertPanel = page.locator(".panel").filter({ has: page.getByRole("heading", { name: "Stock Alert Center" }) });
  await expect(stockAlertPanel.getByText("Tomato Soup")).toBeVisible();
  await expect(stockAlertPanel.getByText("Out of Stock", { exact: true })).toBeVisible();

  await recorder.step("Verify the items with quantities 1 and 5 appear in the Low Stock category");
  await expect(stockAlertPanel.getByText("Pasta")).toBeVisible();
  await expect(stockAlertPanel.getByText("1 left")).toBeVisible();
  await expect(stockAlertPanel.getByText("Olive Oil")).toBeVisible();
  await expect(stockAlertPanel.getByText("5 left")).toBeVisible();

  await recorder.step("Verify the item with quantity above 5 appears in the in-stock population and not in alert sections");
  await expect(page.getByText("Premium Rice").first()).toBeVisible();
  await expect(stockAlertPanel.getByText("Premium Rice")).toHaveCount(0);

  await recorder.step("Verify category counts reflect the documented business rules without overlap");
  await expect(page.getByText("Out of Stock")).toBeVisible();
  await expect(page.getByText("Low Stock (1-5)")).toBeVisible();
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("2", { exact: true })).toBeVisible();
  await expect(stockAlertPanel.getByText("3 Alerts")).toBeVisible();

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_displays_correct_stock_classification_boundaries");
  await recorder.save(testInfo);
});
