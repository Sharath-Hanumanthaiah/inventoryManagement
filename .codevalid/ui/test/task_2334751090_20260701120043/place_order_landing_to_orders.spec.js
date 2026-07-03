import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Navigate to Place Order from Layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_landing_to_orders",
    "Navigate to Place Order from Layout"
  );

  try {
    await recorder.step("Register mock APIs for app layout navigation", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_direct_access_compare" });
    });

    await recorder.step("Navigate to dashboard and use sidebar link to open orders page", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "Dashboard Overview", exact: true })).toBeVisible();
      await page.getByRole("link", { name: "Replenish Orders" }).click();
      await expect(page).toHaveURL(/\/orders$/);
    });

    await recorder.step("Verify the orders page matches direct-access UI", async () => {
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
      await expect(page.locator("#order-item-select")).toBeVisible();
      await expect(page.locator("#order-category")).toBeVisible();
      await expect(page.getByText("Physical State", { exact: true })).toBeVisible();
      await expect(page.locator("#order-qty")).toBeVisible();
      await expect(page.locator("#order-price")).toBeVisible();
      await expect(page.locator("#expected-arrival")).toBeVisible();
      await expect(page.getByRole("button", { name: "Place Replenish Order", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(1\)/ })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Completed Orders History \(0\)/ })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_landing_to_orders");
  } finally {
    await recorder.save(testInfo);
  }
});
