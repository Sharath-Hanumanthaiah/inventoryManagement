import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import {
  setupDashboardMocks,
  dashboardScenarios,
  waitForDashboardApis,
} from "../../helpers/mock-api.js";

test("Dashboard loads as default landing page with analytics data", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "dashboard_default_landing_page_loads_analytics",
    testTitle: testInfo.title,
  });

  await recorder.step("Register dashboard success mocks", async () => {
    await setupDashboardMocks(page, dashboardScenarios.analyticsDefaultSuccess);
  });

  await recorder.step("Launch the application at route '/'", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for GET /api/items and GET /api/orders requests to complete", async () => {
    await waitForDashboardApis(page);
  });

  await recorder.step("Verify the Dashboard page is displayed", async () => {
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
    await expect(page.getByText("Real-time analytics, stock warnings, and seasonal demand intelligence")).toBeVisible();
  });

  await recorder.step("Verify inventory analytics are rendered using returned inventory and order data", async () => {
    await expect(page.getByText("Total Unique Items")).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Total Unique Items" }).getByText("4", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Out of Stock" }).getByText("1", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Low Stock (1-5)" }).getByText("1", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Pending Orders" }).getByText("2", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();
    await expect(page.getByText("2 Alerts")).toBeVisible();
  });

  await recorder.step("Verify a graph or trend representation is visible on the Dashboard", async () => {
    await expect(page.getByRole("heading", { name: "Sales Demand Trend" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Product Demand Comparison" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seasonal Product Performance" })).toBeVisible();
    await expect(page.locator("select.form-select")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_default_landing_page_loads_analytics");
  await recorder.save(testInfo);
});
