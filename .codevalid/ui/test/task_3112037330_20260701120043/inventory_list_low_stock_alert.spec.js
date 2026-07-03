import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Low Stock Alert Triggers When Quantity Is 5 or Less", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("inventory_list_low_stock_alert", "Low Stock Alert Triggers When Quantity Is 5 or Less");

  await recorder.step("Set up mocked inventory data containing items at quantity 5, 1, and above 5");
  await setupInventoryAppMocks(page, { scenario: "default" });

  await recorder.step("Navigate to /inventory");
  await page.goto("/inventory", { waitUntil: "domcontentloaded" });

  await recorder.step("Wait for inventory data to load");
  await expect(page.getByRole("heading", { name: "Inventory Items" })).toBeVisible();
  await expect(page.getByText("Loading inventory data...")).not.toBeVisible();

  await recorder.step("Verify each item with quantity less than or equal to 5 shows the Low stock indicator");
  const orangeRow = page.locator("tbody tr", { hasText: "Orange Juice" });
  const tomatoRow = page.locator("tbody tr", { hasText: "Tomatoes" });
  const riceRow = page.locator("tbody tr", { hasText: "Rice" });

  await expect(orangeRow).toContainText("5");
  await expect(orangeRow.getByText("Low stock")).toBeVisible();
  await expect(tomatoRow).toContainText("1");
  await expect(tomatoRow.getByText("Low stock")).toBeVisible();

  await recorder.step("Verify items with quantity greater than 5 do not show the Low stock indicator");
  await expect(riceRow).toContainText("14");
  await expect(riceRow.getByText("In stock")).toBeVisible();
  await expect(riceRow.getByText("Low stock")).toHaveCount(0);

  console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_low_stock_alert");
  await recorder.save(testInfo);
});
