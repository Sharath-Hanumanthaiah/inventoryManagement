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

  await recorder.step("Switch to New Product mode and submit lowercase name to merge with existing Widget A", async () => {
    await page.getByText("New Product").first().click();
    // Wait for the new-item name input to appear before typing
    await expect(page.getByLabel("Item Name")).toBeVisible();
    await page.locator("#new-item-name").fill("widget a");
    await page.locator("#category-select").selectOption("Electronics");
    await page.locator("#quantity-input").fill("5");
    await page.locator("#stock-in-date").fill("2024-06-15");
    await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
  });

  await recorder.step("Verify success banner appears", async () => {
    await expect(page.getByText(/Successfully added/)).toBeVisible();
  });

  await recorder.step("Verify merge result in inventory", async () => {
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventory Items" })).toBeVisible();
    const rows = page.locator("tbody tr", { has: page.getByText(/Widget A/i) });
    await expect(rows).toHaveCount(1);
    const row = rows.first();
    await expect(row.getByRole("cell", { name: "Widget A" })).toBeVisible();
    // Use exact: true to avoid "15" matching inside "2024-06-15"
    await expect(row.getByText("15", { exact: true })).toBeVisible();
    await expect(row.getByText("2024-06-15")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_merge_existing_item");
  await recorder.save(testInfo);
});
