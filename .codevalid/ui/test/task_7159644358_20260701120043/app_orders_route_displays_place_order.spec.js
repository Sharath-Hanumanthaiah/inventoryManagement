import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Accessing /orders displays PlaceOrder with persistent layout", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_orders_route_displays_place_order",
    testTitle: "Accessing /orders displays PlaceOrder with persistent layout",
  });

  try {
    await recorder.step("Register default inventory app mocks with low stock and pending orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to the orders route", async () => {
      await page.goto("/orders");
    });

    await recorder.step("Verify Place Order page content is rendered with persistent sidebar", async () => {
      await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toHaveClass(/active/);
      await expect(page).toHaveURL(/\/orders$/);
      await expect(page.getByText(/order/i).first()).toBeVisible();
    });

    await recorder.step("Verify low stock alert information is displayed", async () => {
      await expect(page.getByText(/low stock/i).first()).toBeVisible();
    });

    await recorder.step("Verify pending supplier order badge shows a count greater than zero", async () => {
      const ordersLink = page.getByRole("link", { name: "Replenish Orders" });
      await expect(ordersLink).toContainText("1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:app_orders_route_displays_place_order");
  } finally {
    await recorder.save(testInfo);
  }
});
