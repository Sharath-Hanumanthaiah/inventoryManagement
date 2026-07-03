import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Adding stock to existing item auto-populates category, state, and expiry date", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_existing_item_auto_populate",
    testTitle: "Adding stock to existing item auto-populates category, state, and expiry date",
  });

  await setupInventoryAppMocks(page, {
    scenario: "existing_item_autopopulate",
  });

  await recorder.step("Open Add Stock page", async () => {
    await page.goto("/add-stock", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Add Stock" })).toBeVisible();
  });

  await recorder.step("Select existing Widget A item", async () => {
    await page.locator("#existing-item-select").selectOption("item-widget-a");
  });

  await recorder.step("Verify category and expiry are auto-populated and locked", async () => {
    const categorySelect = page.locator("#category-select");
    await expect(categorySelect).toHaveValue("Electronics");
    await expect(categorySelect).toBeDisabled();

    const expiryDate = page.locator("#expiry-date");
    await expect(expiryDate).toHaveValue("2024-12-01");
  });

  await recorder.step("Verify physical state is displayed as locked", async () => {
    await expect(page.getByText("(Item physical state is locked)")).toBeVisible();
    await expect(page.getByText(/^solid$/i)).toBeVisible();
  });

  await recorder.step("Verify editable fields remain available", async () => {
    await expect(page.locator("#quantity-input")).toBeEditable();
    await expect(page.locator("#stock-in-date")).toBeEditable();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_existing_item_auto_populate");
  await recorder.save(testInfo);
});
