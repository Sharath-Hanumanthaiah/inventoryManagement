import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import {
  setupDashboardMocks,
  dashboardScenarios,
  waitForDashboardApis,
} from "../../helpers/mock-api.js";

test("Stock Alert Center displays low-stock and out-of-stock items", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "dashboard_stock_alert_center_displays_alert_items",
    testTitle: testInfo.title,
  });

  await recorder.step("Register alert-center mocks", async () => {
    await setupDashboardMocks(page, dashboardScenarios.stockAlertCenter);
  });

  await recorder.step("Launch the application at route '/'", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for dashboard data to load", async () => {
    await waitForDashboardApis(page);
  });

  const stockAlertPanel = page.locator(".panel", { has: page.getByRole("heading", { name: "Stock Alert Center" }) });

  await recorder.step("Open or observe the Stock Alert Center section", async () => {
    await expect(page.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();
    await expect(stockAlertPanel).toBeVisible();
  });

  await recorder.step("Verify out-of-stock items are listed with an 'Out of Stock' badge", async () => {
    await expect(stockAlertPanel.getByText("Out of Stock (0 units)")).toBeVisible();
    await expect(stockAlertPanel.getByText("Tomato Soup")).toBeVisible();
    await expect(stockAlertPanel.getByText("Olive Oil")).toBeVisible();
    await expect(stockAlertPanel.getByText("Out of Stock", { exact: true }).first()).toBeVisible();
  });

  await recorder.step("Verify low-stock items with quantities between 1 and 5 are listed", async () => {
    await expect(stockAlertPanel.getByText("Low Stock Warning (1 to 5 units)")).toBeVisible();
    await expect(stockAlertPanel.getByText("Pasta")).toBeVisible();
    await expect(stockAlertPanel.getByText("Cereal")).toBeVisible();
    await expect(stockAlertPanel.getByText("2 left")).toBeVisible();
    await expect(stockAlertPanel.getByText("5 left")).toBeVisible();
  });

  await recorder.step("Verify the combined alert count equals the total number of out-of-stock and low-stock items", async () => {
    await expect(stockAlertPanel.getByText("4 Alerts")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_stock_alert_center_displays_alert_items");
  await recorder.save(testInfo);
});
