import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import {
  setupDashboardMocks,
  dashboardScenarios,
  waitForDashboardApis,
} from "../../helpers/mock-api.js";

test("Dashboard renders with empty inventory data when item fetch fails", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "dashboard_renders_with_empty_data_when_items_fetch_fails",
    testTitle: testInfo.title,
  });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await recorder.step("Mock GET /api/items to fail and GET /api/orders to succeed", async () => {
    await setupDashboardMocks(page, dashboardScenarios.itemsFetchFails);
  });

  await recorder.step("Launch the application at route '/'", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for API requests to complete", async () => {
    await waitForDashboardApis(page);
  });

  await recorder.step("Verify the Dashboard page still renders", async () => {
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  await recorder.step("Verify analytics sections render with empty or zeroed data", async () => {
    await expect(page.locator(".kpi-card", { hasText: "Total Unique Items" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Out of Stock" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Low Stock (1-5)" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Pending Orders" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.getByText("0 Alerts")).toBeVisible();
    await expect(page.getByText("No data available").first()).toBeVisible();
  });

  await recorder.step("Verify an error is logged to the browser console", async () => {
    await expect.poll(() => consoleErrors.join("\n")).toContain("Error loading dashboard data:");
    await expect.poll(() => consoleErrors.join("\n")).toContain("Failed to fetch items");
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_renders_with_empty_data_when_items_fetch_fails");
  await recorder.save(testInfo);
});
