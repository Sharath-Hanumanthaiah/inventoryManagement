import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { dashboardScenarios, setupDashboardMocks, waitForDashboardApis } from "../../helpers/mock-api.js";

test("Dashboard renders when both API requests fail", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("dashboard_handles_parallel_api_failures", "Dashboard renders when both API requests fail");
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await recorder.step("Mock both GET /api/items and GET /api/orders as failed responses");
  await setupDashboardMocks(page, dashboardScenarios.allFetchesFail);

  await recorder.step("Navigate to '/' and allow both API requests to fail");
  await page.goto("/");
  await waitForDashboardApis(page);

  await recorder.step("Verify the Dashboard page remains visible");
  await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();

  await recorder.step("Verify analytics sections display empty data and the Stock Alert Center contains no items");
  await expect(page.getByText("0 Alerts")).toBeVisible();
  await expect(page.getByText("No items are currently out of stock. Excellent!")).toBeVisible();
  await expect(page.getByText("No low stock items. Inventory healthy!")).toBeVisible();
  await expect(page.getByText("No data available")).toHaveCount(3);

  await recorder.step("Verify errors are logged to the browser console");
  await expect.poll(() => consoleErrors.some((entry) => entry.includes("Error loading dashboard data:"))).toBeTruthy();

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_handles_parallel_api_failures");
  await recorder.save(testInfo);
});
