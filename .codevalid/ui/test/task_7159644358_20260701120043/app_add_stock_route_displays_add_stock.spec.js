import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Accessing /add-stock displays AddStock with persistent layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_route_displays_add_stock",
    testTitle: "Accessing /add-stock displays AddStock with persistent layout",
  });

  try {
    await recorder.step("Register default inventory app mocks with low stock and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to the add stock route", async () => {
      await page.goto("/add-stock");
    });

    await recorder.step("Verify Add Stock page content is rendered with persistent sidebar", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Add Stock" })).toHaveClass(/active/);
      await expect(page).toHaveURL(/\/add-stock$/);
      await expect(page.getByText(/add stock/i).first()).toBeVisible();
    });

    await recorder.step("Verify low stock alert information is displayed", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
    });

    await recorder.step("Verify pending supplier order badge shows a count greater than zero", async () => {
      const ordersLink = page.getByRole("link", { name: "Replenish Orders" });
      await expect(ordersLink).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_route_displays_add_stock");
  } finally {
    await recorder.save(testInfo);
  }
});
