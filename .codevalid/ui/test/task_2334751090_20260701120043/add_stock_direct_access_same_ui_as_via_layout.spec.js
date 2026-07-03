import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Direct access to /add-stock and navigation via Layout display identical UI and functionality", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_direct_access_same_ui_as_via_layout", "Direct access to /add-stock and navigation via Layout display identical UI and functionality");

  try {
    await recorder.step("Register shared direct-access mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_direct_access_compare" });
    });

    await recorder.step("Navigate via layout to Replenish Orders", async () => {
      await page.goto("/");
      await page.getByRole("link", { name: "Replenish Orders" }).click();
      await expect(page).toHaveURL(/\/orders$/);
    });

    await recorder.step("Capture UI state via navigation path", async () => {
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
      await expect(page.getByText("Place Order", { exact: true })).toBeVisible();
      await expect(page.getByText("Pending Deliveries (1)", { exact: true })).toBeVisible();
      await expect(page.getByText("Completed Orders History (0)", { exact: true })).toBeVisible();
      const navPendingCard = page.locator(".quick-list-item", { hasText: "Orange Juice" }).first();
      await expect(navPendingCard).toBeVisible();
    });

    await recorder.step("Reload and access page directly", async () => {
      await page.goto("/orders");
      await expect(page).toHaveURL(/\/orders$/);
    });

    await recorder.step("Verify same UI and data through direct path", async () => {
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
      await expect(page.getByText("Place Order", { exact: true })).toBeVisible();
      await expect(page.getByText("Pending Deliveries (1)", { exact: true })).toBeVisible();
      await expect(page.getByText("Completed Orders History (0)", { exact: true })).toBeVisible();
      const directPendingCard = page.locator(".quick-list-item", { hasText: "Orange Juice" }).first();
      await expect(directPendingCard).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_direct_access_same_ui_as_via_layout");
  } finally {
    await recorder.save(testInfo);
  }
});
