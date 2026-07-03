import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Categories Page Shows Empty State When No Categories Exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_empty_state_no_categories", "Categories Page Shows Empty State When No Categories Exist");

  try {
    await recorder.step("Register API mocks with no categories", async () => {
      await setupInventoryAppMocks(page, { scenario: "categories_empty_state" });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Verify configured categories empty state", async () => {
      await expect(page.getByText("Configured Categories (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No categories registered", { exact: true })).toBeVisible();
      await expect(page.getByText("Create your first category in the form to begin mapping items in the store.", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify aisle layout empty state and no mapped labels", async () => {
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toBeVisible();
      await expect(page.getByText("Aisles will populate once categories are created and mapped.", { exact: true })).toBeVisible();
      await expect(page.locator(".placement-value")).toHaveCount(0);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_empty_state_no_categories");
  } finally {
    await recorder.save(testInfo);
  }
});
