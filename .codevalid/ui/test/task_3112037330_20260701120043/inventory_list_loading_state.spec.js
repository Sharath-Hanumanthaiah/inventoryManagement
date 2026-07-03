import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Loading Skeleton Appears During Data Fetch", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("inventory_list_loading_state", "Loading Skeleton Appears During Data Fetch");

  await recorder.step("Set up mocked APIs with an artificial response delay");
  await setupInventoryAppMocks(page, { scenario: "default", delayMs: 1200 });

  await recorder.step("Navigate to /inventory and observe the immediate loading UI");
  await page.goto("/inventory", { waitUntil: "domcontentloaded" });
  // Loading text renders above the table; with 1200ms delay it is visible right after navigation.
  await expect(page.getByText("Loading inventory data...")).toBeVisible();
  // Use exact:true to avoid substring matching h3 "No inventory items found" in addition to h1 "Inventory Items"
  await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();

  await recorder.step("Verify inventory content is not yet shown while requests are still pending");
  await expect(page.locator("table.data-table")).toHaveCount(0);
  await expect(page.locator("tbody tr")).toHaveCount(0);

  await recorder.step("Wait for the delayed API responses to complete and confirm the table appears");
  await expect(page.getByText("Loading inventory data...")).not.toBeVisible({ timeout: 8000 });
  await expect(page.locator("table.data-table")).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(3);

  console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_loading_state");
  await recorder.save(testInfo);
});
