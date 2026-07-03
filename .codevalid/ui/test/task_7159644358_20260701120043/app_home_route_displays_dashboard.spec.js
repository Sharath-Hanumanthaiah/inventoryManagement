import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Accessing / displays Dashboard with persistent layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_home_route_displays_dashboard",
    testTitle: "Accessing / displays Dashboard with persistent layout",
  });

  try {
    await recorder.step("Register default inventory app mocks with low stock and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to the root route", async () => {
      await page.goto("/");
    });

    await recorder.step("Verify the persistent sidebar navigation is visible", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Inventory Items" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Add Stock" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Categories & Layout" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toBeVisible();
    });

    await recorder.step("Verify the Dashboard page is rendered in the main content area", async () => {
      await expect(page.getByRole("link", { name: "Dashboard" })).toHaveClass(/active/);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    });

    await recorder.step("Verify low stock alert information is displayed in the layout", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
    });

    await recorder.step("Verify pending supplier order badge shows a count greater than zero", async () => {
      const ordersLink = page.getByRole("link", { name: "Replenish Orders" });
      await expect(ordersLink).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_home_route_displays_dashboard");
  } finally {
    await recorder.save(testInfo);
  }
});
