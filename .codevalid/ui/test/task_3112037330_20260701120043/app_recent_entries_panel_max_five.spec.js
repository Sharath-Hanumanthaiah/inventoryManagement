import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Recent entries panel shows no more than five stock additions per session", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_recent_entries_panel_max_five",
    testTitle: "Recent entries panel shows no more than five stock additions per session",
  });

  await setupInventoryAppMocks(page, {
    scenario: "recent_entries_max_five",
  });

  await recorder.step("Open Add Stock page", async () => {
    await page.goto("/add-stock");
    // No existing items → form is directly in new-product mode
    await expect(page.getByLabel("Item Name")).toBeVisible();
  });

  for (let index = 1; index <= 6; index += 1) {
    await recorder.step(`Submit stock entry ${index}`, async () => {
      await page.locator("#new-item-name").fill(`Entry ${index}`);
      await page.locator("#category-select").selectOption("Unknown");
      await page.locator("#quantity-input").fill(String(index));
      await page.locator("#stock-in-date").fill(`2024-06-0${Math.min(index, 9)}`);
      await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
      await expect(page.getByText(`Successfully added ${index} unit(s) of "Entry ${index}" to stock!`)).toBeVisible();
    });
  }

  await recorder.step("Verify only latest five entries are displayed in newest-first order", async () => {
    const itemTitles = page.locator(".quick-list .item-title");
    await expect(itemTitles).toHaveCount(5);
    await expect(itemTitles.nth(0)).toHaveText("Entry 6");
    await expect(itemTitles.nth(1)).toHaveText("Entry 5");
    await expect(itemTitles.nth(2)).toHaveText("Entry 4");
    await expect(itemTitles.nth(3)).toHaveText("Entry 3");
    await expect(itemTitles.nth(4)).toHaveText("Entry 2");
    await expect(page.getByText("Entry 1")).toHaveCount(0);
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_recent_entries_panel_max_five");
  await recorder.save(testInfo);
});
