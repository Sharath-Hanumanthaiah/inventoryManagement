import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Inventory List Loads Correctly with Data and Low Stock Indicators", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("inventory_list_happy_path", "Inventory List Loads Correctly with Data and Low Stock Indicators");

  await recorder.step("Set up mocked inventory, category, and order APIs with mixed stock quantities and arrival dates");
  await setupInventoryAppMocks(page, { scenario: "default" });

  await recorder.step("Navigate to /inventory");
  await page.goto("/inventory", { waitUntil: "domcontentloaded" });

  await recorder.step("Wait for inventory data to load");
  await expect(page.getByRole("heading", { name: "Inventory Items" })).toBeVisible();
  await expect(page.getByText("Loading inventory data...")).not.toBeVisible({ timeout: 5000 });

  await recorder.step("Verify inventory table displays at least two rows");
  const table = page.locator("table.data-table");
  await expect(table).toBeVisible();
  const rows = table.locator("tbody tr");
  await expect(rows).toHaveCount(3);

  await recorder.step("Verify low stock indicators are displayed for items with quantity less than or equal to 5");
  await expect(page.locator("tbody tr", { hasText: "Orange Juice" }).getByText("Low stock")).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: "Tomatoes" }).getByText("Low stock")).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: "Rice" }).getByText("In stock")).toBeVisible();

  await recorder.step("Verify total stock units count matches the sum of all item quantities");
  await expect(page.getByText("Total Stock Units:")).toBeVisible();
  await expect(page.locator(".page-header .panel").filter({ hasText: "Total Stock Units:" })).toContainText("20");

  await recorder.step("Verify last stock-in dates and next arrival dates are populated");
  await expect(page.locator("tbody tr", { hasText: "Orange Juice" })).toContainText("2024-06-18");
  await expect(page.locator("tbody tr", { hasText: "Orange Juice" })).toContainText("2024-06-25");
  await expect(page.locator("tbody tr", { hasText: "Rice" })).toContainText("2024-06-10");
  // Rice has no pending order in this scenario, so Next Arrival shows placeholder text
  await expect(page.locator("tbody tr", { hasText: "Rice" }).getByText(/No orders placed/i)).toBeVisible();

  await recorder.step("Enter a search term matching an item name");
  await page.getByPlaceholder("Search items by name or category...").fill("Orange");

  await recorder.step("Verify filtered item count updates correctly for search results");
  await expect(rows).toHaveCount(1);
  await expect(page.locator(".page-header .panel").filter({ hasText: "Filtered Count:" })).toContainText("1");
  await expect(page.locator("tbody tr", { hasText: "Orange Juice" })).toBeVisible();

  await recorder.step("Reset the search and apply a category filter");
  await page.getByRole("button", { name: /Reset Filters/i }).click();
  await page.locator("select.form-select.filter-select").nth(0).selectOption("Beverages");

  await recorder.step("Verify only items from the selected category are shown and filtered count matches");
  await expect(rows).toHaveCount(1);
  await expect(page.locator("tbody tr", { hasText: "Orange Juice" })).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: "Rice" })).toHaveCount(0);
  await expect(page.locator("tbody tr", { hasText: "Tomatoes" })).toHaveCount(0);
  await expect(page.locator(".page-header .panel").filter({ hasText: "Filtered Count:" })).toContainText("1");

  console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_happy_path");
  await recorder.save(testInfo);
});
