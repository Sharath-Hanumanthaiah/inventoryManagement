import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Global indicators hidden when no low stock or pending orders exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_global_indicators_hidden_when_conditions_not_met",
    testTitle: "Global indicators hidden when no low stock or pending orders exist",
  });

  try {
    await recorder.step("Register empty inventory app mocks with no low stock items and no pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "empty_inventory" });
    });

    await recorder.step("Navigate to the dashboard route", async () => {
      await page.goto("/");
    });

    await recorder.step("Verify dashboard and persistent sidebar are visible", async () => {
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Dashboard" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    });

    await recorder.step("Verify no low stock alert message is present", async () => {
      await expect(page.getByText(/low stock warning/i)).toHaveCount(0);
      await expect(page.locator(".badge-lowstock")).toHaveCount(0);
    });

    await recorder.step("Verify no pending supplier order badge is displayed", async () => {
      const ordersLink = page.getByRole("link", { name: "Replenish Orders" });
      await expect(ordersLink.locator("span")).toHaveCount(1);
      await expect(ordersLink).not.toContainText(/\b\d+\b/);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_global_indicators_hidden_when_conditions_not_met");
  } finally {
    await recorder.save(testInfo);
  }
});
