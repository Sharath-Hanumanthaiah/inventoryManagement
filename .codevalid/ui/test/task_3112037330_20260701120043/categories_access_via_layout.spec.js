import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Access Categories Page from Layout (Landing)", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_access_via_layout", "Access Categories Page from Layout (Landing)");

  try {
    await recorder.step("Register mocked API responses required by the application shell and Categories page");
    await setupInventoryAppMocks(page, { scenario: "default" });

    await recorder.step("Navigate to route '/'");
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();

    await recorder.step("Click the navigation link labeled 'Categories & Layout' in the application UI");
    await page.getByRole("link", { name: /Categories\s*&\s*Layout/i }).click();

    await recorder.step("Verify the application navigates to '/categories' and renders the Categories page");
    await expect(page).toHaveURL(/\/categories$/);
    await expect(page.getByRole("heading", { name: "Categories & Layout" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create Category" })).toBeVisible();
    await expect(page.getByLabel("Category Name")).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_access_via_layout");
  } finally {
    await recorder.save(testInfo);
  }
});
