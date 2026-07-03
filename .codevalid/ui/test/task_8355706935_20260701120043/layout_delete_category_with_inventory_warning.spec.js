import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Deleting Category with Inventory Items Shows Warning Modal", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_delete_category_with_inventory_warning", "Deleting Category with Inventory Items Shows Warning Modal");

  try {
    let confirmMessage = "";

    await recorder.step("Register API mocks with Bakery category and dependent inventory", async () => {
      await setupInventoryAppMocks(page, { scenario: "categories_delete_with_inventory_warning" });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Verify Bakery is present before deletion attempt", async () => {
      const bakeryRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Bakery" })
      }).first();

      await expect(bakeryRow).toBeVisible();
      await expect(page.getByText("Configured Categories (1)", { exact: true })).toBeVisible();
    });

    await recorder.step("Trigger delete and dismiss the dependency warning confirm dialog", async () => {
      page.once("dialog", async (dialog) => {
        confirmMessage = dialog.message();
        await dialog.dismiss();
      });

      const bakeryRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Bakery" })
      }).first();

      await bakeryRow.locator("button[title='Delete Category']").click();
      await expect.poll(() => confirmMessage.length).toBeGreaterThan(0);
    });

    await recorder.step("Verify the warning text references inventory dependency and no deletion occurs", async () => {
      expect(confirmMessage).toContain('Warning: There are 2 item(s) currently in the "Bakery" category.');
      expect(confirmMessage).toContain("If you delete it, these items will have an unmapped category.");
      expect(confirmMessage).toContain("Do you want to proceed?");

      const bakeryRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Bakery" })
      }).first();

      await expect(bakeryRow).toBeVisible();
      await expect(page.getByText("Configured Categories (1)", { exact: true })).toBeVisible();

      const aisleCell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 2", { exact: true })
      }).first();
      await expect(aisleCell.getByText("Bakery", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_delete_category_with_inventory_warning");
  } finally {
    await recorder.save(testInfo);
  }
});
