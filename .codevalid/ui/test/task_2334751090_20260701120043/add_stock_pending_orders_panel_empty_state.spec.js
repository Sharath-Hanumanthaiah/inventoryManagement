import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Pending orders panel displays empty state when no orders exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_pending_orders_panel_empty_state", "Pending orders panel displays empty state when no orders exist");

  try {
    await recorder.step("Register empty orders mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_empty_states" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Verify pending deliveries empty state", async () => {
      await expect(page.getByText("Pending Deliveries (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_pending_orders_panel_empty_state");
  } finally {
    await recorder.save(testInfo);
  }
});
