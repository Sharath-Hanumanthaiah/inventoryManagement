import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Place Order Page Renders Form and UI on Direct Access", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_direct_access_form_rendered",
    "Place Order Page Renders Form and UI on Direct Access"
  );

  try {
    await recorder.step("Register mock APIs for direct orders page access", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_direct_access_compare" });
    });

    await recorder.step("Navigate directly to /orders", async () => {
      await page.goto("/orders");
      await expect(page).toHaveURL(/\/orders$/);
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Verify the place-order form fields are rendered", async () => {
      await expect(page.getByText("Order Item Selection", { exact: true })).toBeVisible();
      await expect(page.locator("#order-item-select")).toBeVisible();
      await expect(page.locator("#order-category")).toBeVisible();
      await expect(page.getByText("Physical State", { exact: true })).toBeVisible();
      await expect(page.locator("#order-qty")).toBeVisible();
      await expect(page.locator("#order-price")).toBeVisible();
      await expect(page.locator("#expected-arrival")).toBeVisible();
    });

    await recorder.step("Verify action button and orders panels are visible", async () => {
      await expect(page.getByRole("button", { name: "Place Replenish Order", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(1\)/ })).toBeVisible();
      await expect(page.getByText("Orange Juice", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Completed Orders History \(0\)/ })).toBeVisible();
      await expect(page.getByText("No order history", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_direct_access_form_rendered");
  } finally {
    await recorder.save(testInfo);
  }
});
