import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Empty State Displays When No Inventory Items Exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("inventory_list_empty_state", "Empty State Displays When No Inventory Items Exist");

  await recorder.step("Set up mocked APIs with no inventory items");
  await setupInventoryAppMocks(page, { scenario: "empty_inventory" });

  await recorder.step("Navigate to /inventory");
  await page.goto("/inventory", { waitUntil: "domcontentloaded" });

  await recorder.step("Wait for data load to complete");
  // Use exact:true — without it, getByRole name does substring matching and the query
  // "Inventory Items" would also match the h3 "No inventory items found" causing a strict-mode error.
  await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();
  await expect(page.getByText("Loading inventory data...")).not.toBeVisible({ timeout: 5000 });

  await recorder.step("Verify empty state is shown and the inventory table is not rendered");
  await expect(page.getByRole("heading", { name: "No inventory items found", exact: true })).toBeVisible();
  await expect(page.getByText("Try resetting your filters or search terms, or add new stock to get started.")).toBeVisible();
  await expect(page.locator("table.data-table")).toHaveCount(0);

  await recorder.step("Verify total stock units is zero and controls remain visible");
  await expect(page.locator(".page-header .panel").filter({ hasText: "Total Stock Units:" })).toContainText("0");
  await expect(page.locator(".page-header .panel").filter({ hasText: "Filtered Count:" })).toContainText("0");
  await expect(page.getByPlaceholder("Search items by name or category...")).toBeVisible();
  await expect(page.locator("select.form-select.filter-select")).toHaveCount(3);

  console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_empty_state");
  await recorder.save(testInfo);
});
