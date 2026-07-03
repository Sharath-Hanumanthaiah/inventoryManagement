import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Categories Page Loads Without Errors", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "categories_page_loads_successfully",
    "Categories Page Loads Without Errors"
  );

  try {
    await recorder.step("Register mocked API responses for app bootstrap and categories page", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to the dashboard route", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "Dashboard Overview", exact: true })).toBeVisible();
    });

    await recorder.step("Navigate to the Categories page using the sidebar link", async () => {
      await page.getByRole("link", { name: "Categories & Layout" }).click();
      await expect(page).toHaveURL(/\/categories$/);
    });

    await recorder.step("Verify the Categories page renders successfully after layout navigation", async () => {
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Create Category", exact: true })).toBeVisible();
      await expect(page.getByLabel("Category Name")).toBeVisible();
    });

    await recorder.step("Navigate directly to the Categories route and verify it loads without redirect", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Create Category", exact: true })).toBeVisible();
      await expect(page.getByLabel("Category Name")).toBeVisible();
      await expect(page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks")).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_page_loads_successfully");
  } finally {
    await recorder.save(testInfo);
  }
});
