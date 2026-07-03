import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Inventory List Displays Empty State Message", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "inventory_list_empty_state",
    "Inventory List Displays Empty State Message"
  );

  try {
    await recorder.step("Register empty inventory API mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "empty_inventory" });
    });

    await recorder.step("Navigate to /inventory", async () => {
      await page.goto("/inventory");
    });

    await recorder.step("Verify inventory page renders", async () => {
      await expect(
        page.getByRole("heading", { name: "Inventory Items", exact: true })
      ).toBeVisible();
    });

    await recorder.step("Verify empty-state message is shown", async () => {
      await expect(
        page.getByText("No inventory items found", { exact: true })
      ).toBeVisible();
    });

    await recorder.step("Verify no inventory rows are rendered", async () => {
      await expect(page.locator("tbody tr")).toHaveCount(0);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:inventory_list_empty_state");
  } finally {
    await recorder.save(testInfo);
  }
});
