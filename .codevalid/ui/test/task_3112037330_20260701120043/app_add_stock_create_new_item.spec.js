import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Add Stock creates new inventory item when no matching name exists", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_create_new_item",
    testTitle: "Add Stock creates new inventory item when no matching name exists",
  });

  await setupInventoryAppMocks(page, {
    scenario: "add_stock_create_new_item",
  });

  await recorder.step("Open Add Stock page", async () => {
    await page.goto("/add-stock");
  });

  await recorder.step("Create a new product stock entry", async () => {
    await page.getByText("New Product").first().click();
    await expect(page.getByLabel("Item Name")).toBeVisible();
    await page.locator("#new-item-name").fill("Novel Product");
    await page.locator("#category-select").selectOption("Unknown");
    await page.locator("#quantity-input").fill("15");
    await page.getByText("Solid Product").click();
    await page.locator("#stock-in-date").fill("2024-06-10");
    await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
  });

  await recorder.step("Verify success banner and recent entries", async () => {
    await expect(page.getByText('Successfully added 15 unit(s) of "Novel Product" to stock!')).toBeVisible();
    // Use item-title locator to avoid strict-mode violation with the success banner text
    await expect(page.locator(".item-title", { hasText: "Novel Product" })).toBeVisible();
    await expect(page.getByText("Logged on 2024-06-10")).toBeVisible();
    await expect(page.getByText("+15")).toBeVisible();
  });

  await recorder.step("Verify item exists in inventory with computed defaults", async () => {
    await page.goto("/inventory");
    const row = page.locator("tr", { has: page.getByRole("cell", { name: "Novel Product" }) });
    await expect(row).toBeVisible();
    await expect(row.getByRole("cell", { name: "Unknown" })).toBeVisible();
    await expect(row.getByText("15")).toBeVisible();
    await expect(row.getByText("2024-06-10")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_create_new_item");
  await recorder.save(testInfo);
});
