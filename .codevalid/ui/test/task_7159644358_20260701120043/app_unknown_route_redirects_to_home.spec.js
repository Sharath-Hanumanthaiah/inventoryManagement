import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Accessing unknown route redirects to /", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_unknown_route_redirects_to_home",
    testTitle: "Accessing unknown route redirects to /",
  });

  try {
    await recorder.step("Register default inventory app mocks with low stock and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to an unknown route", async () => {
      await page.goto("/nonexistent");
    });

    await recorder.step("Verify the app redirects to the home route and renders Dashboard", async () => {
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("link", { name: "Dashboard" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    });

    await recorder.step("Verify the sidebar remains visible after redirect", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Inventory Items" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Add Stock" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Categories & Layout" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toBeVisible();
    });

    await recorder.step("Verify global indicators are displayed after redirect", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_unknown_route_redirects_to_home");
  } finally {
    await recorder.save(testInfo);
  }
});
