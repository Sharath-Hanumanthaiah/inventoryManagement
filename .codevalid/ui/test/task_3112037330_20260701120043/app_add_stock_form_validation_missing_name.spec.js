import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Add Stock form rejects submission with empty item name", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_form_validation_missing_name",
    testTitle: "Add Stock form rejects submission with empty item name",
  });

  await setupInventoryAppMocks(page, {
    scenario: "add_stock_validation_new_item",
  });

  await recorder.step("Open Add Stock page", async () => {
    await page.goto("/add-stock");
  });

  await recorder.step("Switch to New Product mode", async () => {
    await page.getByText("New Product").first().click();
    await expect(page.getByLabel("Item Name")).toBeVisible();
  });

  await recorder.step("Fill other fields and keep item name empty", async () => {
    await page.locator("#new-item-name").fill("");
    await page.locator("#quantity-input").fill("10");
    await page.getByText("Solid Product").click();
    await page.locator("#expiry-date").fill("2024-12-31");
    await page.locator("#stock-in-date").fill("2024-06-01");
  });

  await recorder.step("Assert browser validation prevents submission", async () => {
    await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
    const validity = await page.locator("#new-item-name").evaluate((el) => el.validationMessage);
    expect(validity).not.toBe("");
    await expect(page.locator("#new-item-name")).toBeFocused();
    await expect(page.getByText("Successfully added")).toHaveCount(0);
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_form_validation_missing_name");
  await recorder.save(testInfo);
});
