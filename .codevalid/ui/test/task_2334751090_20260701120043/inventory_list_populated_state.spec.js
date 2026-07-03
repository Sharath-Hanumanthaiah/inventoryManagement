import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Inventory List Displays Items When Data Exists", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "inventory_list_populated_state",
    "Inventory List Displays Items When Data Exists"
  );

  try {
    await recorder.step("Register populated inventory API mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "inventory_table_default" });
    });

    await recorder.step("Navigate to /inventory", async () => {
      await page.goto("/inventory");
    });

    await recorder.step("Verify inventory page renders", async () => {
      await expect(
        page.getByRole("heading", { name: "Inventory Items", exact: true })
      ).toBeVisible();
    });

    await recorder.step("Verify at least one inventory item is displayed", async () => {
      const widgetRow = page.locator("tbody tr", {
        has: page.getByText("Widget A", { exact: true }),
      });
      await expect(widgetRow).toBeVisible();
    });

    await recorder.step("Verify item fields include product name, quantity, and category", async () => {
      const widgetRow = page.locator("tbody tr", {
        has: page.getByText("Widget A", { exact: true }),
      });
      await expect(widgetRow.getByText("Widget A", { exact: true })).toBeVisible();
      await expect(widgetRow.getByText("12", { exact: true })).toBeVisible();
      await expect(widgetRow.getByText("Electronics", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_populated_state");
  } finally {
    await recorder.save(testInfo);
  }
});
