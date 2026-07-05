import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import {
  setupDashboardMocks,
  dashboardScenarios,
  waitForDashboardApis,
} from "../../helpers/mock-api.js";

test("Dashboard renders with empty order data when order fetch fails", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "dashboard_renders_with_empty_data_when_orders_fetch_fails",
    testTitle: testInfo.title,
  });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await recorder.step("Mock GET /api/items to succeed and GET /api/orders to fail", async () => {
    await setupDashboardMocks(page, dashboardScenarios.ordersFetchFails);
  });

  await recorder.step("Launch the application at route '/'", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for API requests to complete", async () => {
    await waitForDashboardApis(page);
  });

  await recorder.step("Verify the Dashboard page still renders", async () => {
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
  });

  await recorder.step("Verify inventory analytics sections remain visible", async () => {
    await expect(page.getByText("Total Unique Items")).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Total Unique Items" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sales Demand Trend" })).toBeVisible();
    await expect(page.getByText("No data available").first()).toBeVisible();
  });

  await recorder.step("Verify an error is logged to the browser console", async () => {
    await expect.poll(() => consoleErrors.join("\n")).toContain("Error loading dashboard data:");
    await expect.poll(() => consoleErrors.join("\n")).toContain("Failed to fetch orders");
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_renders_with_empty_data_when_orders_fetch_fails");
  await recorder.save(testInfo);
});
