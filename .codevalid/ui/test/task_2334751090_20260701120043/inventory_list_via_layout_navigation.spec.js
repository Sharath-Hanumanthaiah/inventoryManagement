import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Access Inventory List via Layout Navigation", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "inventory_list_via_layout_navigation",
    "Access Inventory List via Layout Navigation"
  );

  try {
    await recorder.step("Register default inventory API mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "inventory_table_default" });
    });

    await recorder.step("Navigate to the dashboard route", async () => {
      await page.goto("/");
    });

    await recorder.step("Click the Inventory Items navigation link", async () => {
      await page.getByRole("link", { name: "Inventory Items" }).click();
    });

    await recorder.step("Verify navigation to /inventory and inventory view rendering", async () => {
      await expect(page).toHaveURL(/\/inventory$/);
      await expect(
        page.getByRole("heading", { name: "Inventory Items", exact: true })
      ).toBeVisible();
    });

    await recorder.step("Verify inventory content or placeholder is displayed without error", async () => {
      const table = page.locator("table");
      const emptyState = page.getByText("No inventory items found", { exact: true });
      await expect(table.or(emptyState).first()).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_via_layout_navigation");
  } finally {
    await recorder.save(testInfo);
  }
});
