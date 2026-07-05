import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { dashboardScenarios, setupDashboardMocks, waitForDashboardApis } from "../../helpers/mock-api.js";

test("Stock Alert Center displays alerts and combined alert count", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("dashboard_stock_alert_center_shows_combined_alerts", "Stock Alert Center displays alerts and combined alert count");

  await recorder.step("Mock dashboard data with out-of-stock and low-stock items");
  await setupDashboardMocks(page, dashboardScenarios.stockAlertCenter);

  await recorder.step("Navigate to '/' and wait for dashboard APIs");
  await page.goto("/");
  await waitForDashboardApis(page);

  const stockAlertPanel = page.locator(".panel").filter({ has: page.getByRole("heading", { name: "Stock Alert Center" }) });

  await recorder.step("Locate the Stock Alert Center");
  await expect(stockAlertPanel).toBeVisible();
  await expect(stockAlertPanel.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();

  await recorder.step("Verify out-of-stock items are listed with an 'Out of Stock' badge");
  await expect(stockAlertPanel.getByText("Tomato Soup")).toBeVisible();
  await expect(stockAlertPanel.getByText("Olive Oil")).toBeVisible();
  await expect(stockAlertPanel.getByText("Out of Stock", { exact: true })).toHaveCount(2);

  await recorder.step("Verify low-stock items with quantities between 1 and 5 are listed");
  await expect(stockAlertPanel.getByText("Pasta")).toBeVisible();
  await expect(stockAlertPanel.getByText("2 left")).toBeVisible();
  await expect(stockAlertPanel.getByText("Cereal")).toBeVisible();
  await expect(stockAlertPanel.getByText("5 left")).toBeVisible();

  await recorder.step("Verify the combined alert count equals the total number of alert entries");
  await expect(stockAlertPanel.getByText("4 Alerts")).toBeVisible();
  await expect(stockAlertPanel.locator(".quick-list-item")).toHaveCount(4);

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_stock_alert_center_shows_combined_alerts");
  await recorder.save(testInfo);
});
