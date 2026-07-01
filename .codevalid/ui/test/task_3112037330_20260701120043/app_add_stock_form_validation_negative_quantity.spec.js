import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Add Stock form rejects submission with non-positive quantity", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_form_validation_negative_quantity",
    testTitle: "Add Stock form rejects submission with non-positive quantity",
  });

  await setupInventoryAppMocks(page, {
    scenario: "add_stock_validation_new_item",
  });

  page.on("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Please enter a valid positive quantity.");
    await dialog.accept();
  });

  await recorder.step("Open Add Stock page", async () => {
    await page.goto("/add-stock");
  });

  // When no existing items the form is already in new-product mode —
  // the segmented control is hidden and #new-item-name is directly visible.
  await recorder.step("Enter invalid quantity in new-product mode", async () => {
    await expect(page.getByLabel("Item Name")).toBeVisible();
    await page.locator("#new-item-name").fill("Widget B");
    await page.locator("#quantity-input").fill("-5");
    await page.locator("#expiry-date").fill("2024-12-31");
    await page.locator("#stock-in-date").fill("2024-06-01");
  });

  await recorder.step("Submit and verify blocked by alert", async () => {
    await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
    await expect(page.getByText("Successfully added")).toHaveCount(0);
    await expect(page.locator("#new-item-name")).toHaveValue("Widget B");
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_form_validation_negative_quantity");
  await recorder.save(testInfo);
});
