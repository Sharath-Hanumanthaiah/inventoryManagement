import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Existing inventory item auto-populates category and physical state", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_existing_item_auto_populate", "Existing inventory item auto-populates category and physical state");

  try {
    await recorder.step("Register existing item autopopulate mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_existing_item_autopopulate" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Select existing inventory item", async () => {
      await page.locator("#order-item-select").selectOption("item-coffee-1");
    });

    await recorder.step("Verify category and physical state auto-populate", async () => {
      await expect(page.locator("#order-category")).toHaveValue("Beverages");
      await expect(page.locator("#order-category")).toBeDisabled();
      await expect(page.getByText("Physical State", { exact: true })).toBeVisible();
      await expect(page.getByText("solid", { exact: true })).toBeVisible();
      await expect(page.getByText("Order New Product", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_existing_item_auto_populate");
  } finally {
    await recorder.save(testInfo);
  }
});
