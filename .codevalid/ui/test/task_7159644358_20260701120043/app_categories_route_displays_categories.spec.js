import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Accessing /categories displays Categories with persistent layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_categories_route_displays_categories",
    testTitle: "Accessing /categories displays Categories with persistent layout",
  });

  try {
    await recorder.step("Register default inventory app mocks with low stock and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to the categories route", async () => {
      await page.goto("/categories");
    });

    await recorder.step("Verify Categories page content is rendered with persistent sidebar", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Categories & Layout" })).toHaveClass(/active/);
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByText(/categories/i).first()).toBeVisible();
    });

    await recorder.step("Verify low stock alert information is displayed", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
    });

    await recorder.step("Verify pending supplier order badge shows a count greater than zero", async () => {
      const ordersLink = page.getByRole("link", { name: "Replenish Orders" });
      await expect(ordersLink).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_categories_route_displays_categories");
  } finally {
    await recorder.save(testInfo);
  }
});
