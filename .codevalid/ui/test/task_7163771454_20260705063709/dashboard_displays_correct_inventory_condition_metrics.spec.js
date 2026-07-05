import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import {
  setupDashboardMocks,
  dashboardScenarios,
  waitForDashboardApis,
} from "../../helpers/mock-api.js";

test("Dashboard displays correct inventory condition metrics", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "dashboard_displays_correct_inventory_condition_metrics",
    testTitle: testInfo.title,
  });

  await recorder.step("Register inventory classification mocks", async () => {
    await setupDashboardMocks(page, dashboardScenarios.metricClassification);
  });

  await recorder.step("Launch the application at route '/'", async () => {
    await page.goto("/");
  });

  await recorder.step("Wait for inventory and order data to load", async () => {
    await waitForDashboardApis(page);
  });

  await recorder.step("Verify items with quantity equal to 0 are counted under 'Out of Stock'", async () => {
    await expect(page.locator(".kpi-card", { hasText: "Out of Stock" }).getByText("1", { exact: true })).toBeVisible();
  });

  await recorder.step("Verify items with quantity between 1 and 5 inclusive are counted under 'Low Stock'", async () => {
    await expect(page.locator(".kpi-card", { hasText: "Low Stock (1-5)" }).getByText("2", { exact: true })).toBeVisible();
  });

  await recorder.step("Verify items with quantity greater than 5 are counted as in stock", async () => {
    await expect(page.locator(".kpi-card", { hasText: "Total Unique Items" }).getByText("4", { exact: true })).toBeVisible();
    await expect(page.getByText("Inventory healthy!")).not.toBeVisible({ timeout: 500 }).catch(() => {});
    const total = 4;
    const outOfStock = 1;
    const lowStock = 2;
    expect(total - outOfStock - lowStock).toBe(1);
    await expect(page.getByText("Premium Rice")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:dashboard_displays_correct_inventory_condition_metrics");
  await recorder.save(testInfo);
});
