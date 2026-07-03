import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Direct Access to Categories Page", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_direct_access", "Direct Access to Categories Page");

  try {
    await recorder.step("Register mocked API responses required by the Categories page");
    await setupInventoryAppMocks(page, { scenario: "default" });

    await recorder.step("Navigate directly to route '/categories'");
    await page.goto("/categories", { waitUntil: "domcontentloaded" });

    await recorder.step("Verify the Categories page renders without errors");
    await expect(page).toHaveURL(/\/categories$/);
    await expect(page.getByRole("heading", { name: "Categories & Layout" })).toBeVisible();
    await expect(page.getByText("Define product categories and specify their physical coordinates in the store layout")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create Category" })).toBeVisible();
    await expect(page.getByLabel("Category Name")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks")).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_direct_access");
  } finally {
    await recorder.save(testInfo);
  }
});
