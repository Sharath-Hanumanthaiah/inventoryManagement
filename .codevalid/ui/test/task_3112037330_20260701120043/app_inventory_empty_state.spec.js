import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Inventory table shows empty state when no items exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_inventory_empty_state",
    testTitle: "Inventory table shows empty state when no items exist",
  });

  await setupInventoryAppMocks(page, {
    scenario: "inventory_empty_state",
  });

  await recorder.step("Open inventory page", async () => {
    await page.goto("/inventory");
  });

  await recorder.step("Wait for data load to complete", async () => {
    // Use exact:true to avoid substring-matching the h3 "No inventory items found"
    await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();
    await expect(page.getByText("Loading inventory data...")).not.toBeVisible({ timeout: 5000 });
  });

  await recorder.step("Verify empty state message and Add Stock navigation", async () => {
    await expect(page.getByRole("heading", { name: "No inventory items found", exact: true })).toBeVisible();
    await expect(page.getByText(/Try resetting your filters or search terms, or add new stock to get started\./)).toBeVisible();
    await expect(page.getByRole("link", { name: /Add Stock/i })).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_inventory_empty_state");
  await recorder.save(testInfo);
});
