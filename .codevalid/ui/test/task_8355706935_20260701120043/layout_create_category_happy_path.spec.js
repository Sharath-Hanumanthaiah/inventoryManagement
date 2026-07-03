import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("User Creates New Category with All Fields", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_create_category_happy_path", "User Creates New Category with All Fields");

  try {
    await recorder.step("Register API mocks for an empty categories scenario", async () => {
      await setupInventoryAppMocks(page, { scenario: "categories_empty_state" });
    });

    await recorder.step("Open the dashboard route", async () => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { name: "Apex Inventory" })).toBeVisible();
    });

    await recorder.step("Navigate to Categories & Layout from the sidebar", async () => {
      await page.getByRole("link", { name: "Categories & Layout" }).click();
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Verify empty states before creating a category", async () => {
      await expect(page.getByText("No categories registered", { exact: true })).toBeVisible();
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toBeVisible();
    });

    await recorder.step("Fill category details and placement coordinates", async () => {
      await page.locator("#cat-name").fill("Dairy");
      await page.locator("#cat-desc").fill("Milk, cheese, yogurt products");
      await page.locator("#aisle-select").selectOption("Aisle 1");
      await page.locator("#section-select").selectOption("Section A");
      await page.locator("#shelf-select").selectOption("Shelf 4");
    });

    await recorder.step("Submit the category creation form", async () => {
      await page.getByRole("button", { name: "Create & Map Category" }).click();
    });

    await recorder.step("Verify the category appears in the configured list", async () => {
      const categoryRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Dairy" })
      }).first();

      await expect(categoryRow).toBeVisible();
      await expect(categoryRow.locator(".item-subtitle")).toContainText("Milk, cheese, yogurt products");
      await expect(categoryRow.getByText("Aisle 1", { exact: true })).toBeVisible();
      await expect(categoryRow.getByText("Section A", { exact: true })).toBeVisible();
      await expect(categoryRow.getByText("Shelf 4", { exact: true })).toBeVisible();
      await expect(page.getByText("Configured Categories (1)", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify the visual aisle layout map shows the mapped category", async () => {
      const aisleCell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 1", { exact: true })
      }).first();

      await expect(aisleCell).toBeVisible();
      await expect(aisleCell.getByText("Dairy", { exact: true })).toBeVisible();
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).not.toBeVisible();
    });

    await recorder.step("Verify the form resets after successful creation", async () => {
      await expect(page.locator("#cat-name")).toHaveValue("");
      await expect(page.locator("#cat-desc")).toHaveValue("");
      await expect(page.locator("#aisle-select")).toHaveValue("Aisle 1");
      await expect(page.locator("#section-select")).toHaveValue("Section A");
      await expect(page.locator("#shelf-select")).toHaveValue("Shelf 1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_create_category_happy_path");
  } finally {
    await recorder.save(testInfo);
  }
});
