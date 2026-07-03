import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Accessing /inventory displays InventoryList with persistent layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_inventory_route_displays_inventory_list",
    testTitle: "Accessing /inventory displays InventoryList with persistent layout",
  });

  try {
    await recorder.step("Register default inventory app mocks with low stock and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to the inventory route", async () => {
      await page.goto("/inventory");
    });

    await recorder.step("Verify InventoryList content is rendered with persistent sidebar", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Inventory Items" })).toHaveClass(/active/);
      await expect(page).toHaveURL(/\/inventory$/);
    });

    await recorder.step("Verify low stock alert information is displayed", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
    });

    await recorder.step("Verify pending supplier order badge shows a count greater than zero", async () => {
      const ordersLink = page.getByRole("link", { name: "Replenish Orders" });
      await expect(ordersLink).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_inventory_route_displays_inventory_list");
  } finally {
    await recorder.save(testInfo);
  }
});
