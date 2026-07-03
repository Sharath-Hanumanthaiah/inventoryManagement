import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Total Stock Units and Filtered Counts Update Accurately", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("inventory_list_total_and_filtered_counts", "Total Stock Units and Filtered Counts Update Accurately");

  await recorder.step("Set up mocked APIs with three inventory items totaling 20 units");
  await setupInventoryAppMocks(page, { scenario: "default" });

  await recorder.step("Navigate to /inventory");
  await page.goto("/inventory", { waitUntil: "domcontentloaded" });

  await recorder.step("Wait for data to load");
  await expect(page.getByRole("heading", { name: "Inventory Items" })).toBeVisible();
  await expect(page.getByText("Loading inventory data...")).not.toBeVisible();
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(3);

  await recorder.step("Verify total stock units equals 20");
  await expect(page.locator(".page-header .panel").filter({ hasText: "Total Stock Units:" })).toContainText("20");
  await expect(page.locator(".page-header .panel").filter({ hasText: "Filtered Count:" })).toContainText("3");

  await recorder.step("Filter by the category belonging to the item with quantity 3 or less matching a single row in the fixture");
  await page.locator("select.form-select.filter-select").nth(0).selectOption("Produce");

  await recorder.step("Verify filtered item count equals 1 and only the matching row is shown");
  await expect(rows).toHaveCount(1);
  await expect(page.locator("tbody tr", { hasText: "Tomatoes" })).toBeVisible();
  await expect(page.locator(".page-header .panel").filter({ hasText: "Filtered Count:" })).toContainText("1");
  await expect(page.locator(".page-header .panel").filter({ hasText: "Total Stock Units:" })).toContainText("1");

  await recorder.step("Clear filters and verify counts return to the full dataset values");
  await page.getByRole("button", { name: /Reset Filters/i }).click();
  await expect(rows).toHaveCount(3);
  await expect(page.locator(".page-header .panel").filter({ hasText: "Filtered Count:" })).toContainText("3");
  await expect(page.locator(".page-header .panel").filter({ hasText: "Total Stock Units:" })).toContainText("20");

  console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_total_and_filtered_counts");
  await recorder.save(testInfo);
});
