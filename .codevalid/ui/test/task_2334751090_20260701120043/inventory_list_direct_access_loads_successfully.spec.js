import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Direct Access to Inventory List Page", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "inventory_list_direct_access_loads_successfully",
    "Direct Access to Inventory List Page"
  );

  try {
    await recorder.step("Register default inventory API mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "inventory_table_default" });
    });

    await recorder.step("Navigate directly to /inventory", async () => {
      await page.goto("/inventory");
    });

    await recorder.step("Verify inventory page renders without errors", async () => {
      await expect(
        page.getByRole("heading", { name: "Inventory Items", exact: true })
      ).toBeVisible();
      await expect(
        page.getByPlaceholder("Search items by name or category...")
      ).toBeVisible();
    });

    await recorder.step("Verify an inventory list or placeholder is displayed", async () => {
      const table = page.locator("table");
      const emptyState = page.getByText("No inventory items found", { exact: true });
      await expect(table.or(emptyState).first()).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_direct_access_loads_successfully");
  } finally {
    await recorder.save(testInfo);
  }
});
