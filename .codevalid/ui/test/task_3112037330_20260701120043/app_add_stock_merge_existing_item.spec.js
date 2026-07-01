import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Add Stock merges quantity with existing item using case-insensitive match", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_merge_existing_item",
    testTitle: "Add Stock merges quantity with existing item using case-insensitive match",
  });

  await setupInventoryAppMocks(page, {
    scenario: "add_stock_merge_case_insensitive",
  });

  await recorder.step("Open Add Stock page", async () => {
    await page.goto("/add-stock");
  });

  await recorder.step("Submit lowercase item name to merge with existing Widget A", async () => {
    await page.getByText("New Product").first().click();
    await page.locator("#new-item-name").fill("widget a");
    await page.locator("#category-select").selectOption("Electronics");
    await page.locator("#quantity-input").fill("5");
    await page.locator("#stock-in-date").fill("2024-06-15");
    await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
  });

  await recorder.step("Verify merge result in inventory", async () => {
    await page.goto("/inventory");
    const rows = page.locator("tbody tr", { has: page.getByText(/Widget A/i) });
    await expect(rows).toHaveCount(1);
    const row = rows.first();
    await expect(row.getByRole("cell", { name: "Widget A" })).toBeVisible();
    await expect(row.getByText("15")).toBeVisible();
    await expect(row.getByText("2024-06-15")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_merge_existing_item");
  await recorder.save(testInfo);
});
