import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import {
  setupDashboardMocks,
  dashboardScenarios,
  waitForDashboardApis,
} from "../../helpers/mock-api.js";

test("Dashboard renders safely when all analytics fetches fail", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "dashboard_renders_with_empty_data_when_all_fetches_fail",
    testTitle: testInfo.title,
  });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await recorder.step("Mock both dashboard API requests to fail", async () => {
    await setupDashboardMocks(page, dashboardScenarios.allFetchesFail);
  });

  await recorder.step("Launch the application at route '/'", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for API requests to complete", async () => {
    await waitForDashboardApis(page);
  });

  await recorder.step("Verify the Dashboard page renders without crashing", async () => {
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stock Alert Center" })).toBeVisible();
  });

  await recorder.step("Verify analytics sections display empty or zero-state data", async () => {
    await expect(page.locator(".kpi-card", { hasText: "Total Unique Items" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Out of Stock" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Low Stock (1-5)" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.locator(".kpi-card", { hasText: "Pending Orders" }).getByText("0", { exact: true })).toBeVisible();
    await expect(page.getByText("0 Alerts")).toBeVisible();
    await expect(page.getByText("No arrivals this week")).toBeVisible();
    await expect(page.getByText("No data available").first()).toBeVisible();
  });

  await recorder.step("Verify fetch errors are logged to the browser console", async () => {
    await expect.poll(() => consoleErrors.join("\n")).toContain("Error loading dashboard data:");
    const combined = consoleErrors.join("\n");
    expect(combined.includes("Failed to fetch items") || combined.includes("Failed to fetch orders")).toBeTruthy();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_renders_with_empty_data_when_all_fetches_fail");
  await recorder.save(testInfo);
});
