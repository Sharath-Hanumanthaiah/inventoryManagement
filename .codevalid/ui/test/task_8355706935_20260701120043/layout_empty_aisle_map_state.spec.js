import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Aisle Layout Map Shows Empty When No Mappings Exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_empty_aisle_map_state", "Aisle Layout Map Shows Empty When No Mappings Exist");

  try {
    await recorder.step("Register API mocks with an unmapped category", async () => {
      await setupInventoryAppMocks(page, { scenario: "categories_unmapped_layout_state" });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Verify configured category is listed", async () => {
      const snacksRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Snacks" })
      }).first();

      await expect(snacksRow).toBeVisible();
      await expect(page.getByText("Configured Categories (1)", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify the aisle map renders an empty grid with no category assignments", async () => {
      await expect(page.getByText("Visual Aisle Layout", { exact: true })).toBeVisible();
      await expect(page.locator(".placement-value")).toHaveCount(0);
      await expect(page.getByText("Empty Aisle")).toHaveCount(5);
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toHaveCount(0);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_empty_aisle_map_state");
  } finally {
    await recorder.save(testInfo);
  }
});
