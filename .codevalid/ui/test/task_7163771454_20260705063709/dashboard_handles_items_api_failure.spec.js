import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { dashboardScenarios, setupDashboardMocks, waitForDashboardApis } from "../../helpers/mock-api.js";

test("Dashboard renders with empty data when items API fails", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("dashboard_handles_items_api_failure", "Dashboard renders with empty data when items API fails");
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await recorder.step("Mock GET /api/items failure and successful GET /api/orders response");
  await setupDashboardMocks(page, dashboardScenarios.itemsFetchFails);

  await recorder.step("Navigate to '/' and allow the items request to fail");
  await page.goto("/");
  await waitForDashboardApis(page);

  await recorder.step("Verify the Dashboard page still renders");
  await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();

  await recorder.step("Verify inventory analytics areas render with empty data after Promise.all failure");
  await expect(page.getByText("0 Alerts")).toBeVisible();
  await expect(page.getByText("No items are currently out of stock. Excellent!")).toBeVisible();
  await expect(page.getByText("No low stock items. Inventory healthy!")).toBeVisible();
  await expect(page.getByText("No data available")).toHaveCount(3);

  await recorder.step("Verify an error is logged to the browser console");
  await expect.poll(() => consoleErrors.some((entry) => entry.includes("Error loading dashboard data:"))).toBeTruthy();

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_handles_items_api_failure");
  await recorder.save(testInfo);
});
