import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Form Rejects Category Creation Without Name", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_create_category_missing_name", "Form Rejects Category Creation Without Name");

  try {
    await recorder.step("Register API mocks for empty categories", async () => {
      await setupInventoryAppMocks(page, { scenario: "categories_empty_state" });
    });

    await recorder.step("Navigate directly to the categories page", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Fill optional fields but leave the required category name blank", async () => {
      await page.locator("#cat-desc").fill("Snack items");
      await page.locator("#aisle-select").selectOption("Aisle 2");
      await page.locator("#section-select").selectOption("Section B");
      await page.locator("#shelf-select").selectOption("Shelf 1");
      await expect(page.locator("#cat-name")).toHaveValue("");
    });

    await recorder.step("Attempt to submit the form and verify browser validation blocks it", async () => {
      await page.getByRole("button", { name: "Create & Map Category" }).click();
      await expect(page.locator("#cat-name")).toBeFocused();

      const isInvalid = await page.locator("#cat-name").evaluate((el) => !el.checkValidity());
      expect(isInvalid).toBe(true);

      const validationMessage = await page.locator("#cat-name").evaluate((el) => el.validationMessage);
      expect(validationMessage.length).toBeGreaterThan(0);
    });

    await recorder.step("Verify no category was created and layout remains empty", async () => {
      await expect(page.getByText("Configured Categories (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No categories registered", { exact: true })).toBeVisible();
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toBeVisible();
      await expect(page.locator(".item-title", { hasText: "Snack items" })).toHaveCount(0);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_create_category_missing_name");
  } finally {
    await recorder.save(testInfo);
  }
});
