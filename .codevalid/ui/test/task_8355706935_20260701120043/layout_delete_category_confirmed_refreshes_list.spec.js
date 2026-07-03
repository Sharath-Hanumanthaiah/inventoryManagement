import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Confirmed Category Deletion Refreshes List and Removes Mapping", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_delete_category_confirmed_refreshes_list", "Confirmed Category Deletion Refreshes List and Removes Mapping");

  try {
    let confirmMessage = "";

    await recorder.step("Register API mocks with one deletable category", async () => {
      await setupInventoryAppMocks(page, { scenario: "categories_delete_confirmed_refresh" });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Verify Frozen category appears in the list and aisle map", async () => {
      const frozenRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Frozen" })
      }).first();
      await expect(frozenRow).toBeVisible();

      const aisleCell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 4", { exact: true })
      }).first();
      await expect(aisleCell.getByText("Frozen", { exact: true })).toBeVisible();
    });

    await recorder.step("Confirm deletion of the category", async () => {
      page.once("dialog", async (dialog) => {
        confirmMessage = dialog.message();
        await dialog.accept();
      });

      const frozenRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Frozen" })
      }).first();
      await frozenRow.locator("button[title='Delete Category']").click();
      await expect.poll(() => confirmMessage.length).toBeGreaterThan(0);
    });

    await recorder.step("Verify the list refreshes and the mapping is removed", async () => {
      expect(confirmMessage).toContain('Are you sure you want to delete the "Frozen" category?');

      await expect(page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Frozen" })
      })).toHaveCount(0);

      await expect(page.getByText("Configured Categories (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No categories registered", { exact: true })).toBeVisible();
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toBeVisible();
      await expect(page.locator(".placement-value", { hasText: "Frozen" })).toHaveCount(0);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_delete_category_confirmed_refreshes_list");
  } finally {
    await recorder.save(testInfo);
  }
});
