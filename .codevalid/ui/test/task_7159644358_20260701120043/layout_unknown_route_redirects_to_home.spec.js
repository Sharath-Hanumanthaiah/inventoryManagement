import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Unknown route redirects to root '/' and renders Dashboard with persistent layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "layout_unknown_route_redirects_to_home",
    "Unknown Route Redirects to Root ('/')"
  );

  try {
    await recorder.step("Register mocked API responses for inventory, categories, and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to an unknown route and verify redirect to '/'", async () => {
      await page.goto("/fake-path");
      await expect(page).toHaveURL(/\/$/);
    });

    await recorder.step("Verify the Dashboard page is rendered after redirect", async () => {
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole("link", { name: "Dashboard" })).toHaveClass(/active/);
    });

    await recorder.step("Verify the persistent sidebar remains visible and no error page is shown", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Inventory Items" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Add Stock" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Categories & Layout" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toBeVisible();
      await expect(page.getByText(/not found/i)).toHaveCount(0);
    });

    await recorder.step("Verify global indicators are displayed when matching data exists", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_unknown_route_redirects_to_home");
  } finally {
    await recorder.save(testInfo);
  }
});
