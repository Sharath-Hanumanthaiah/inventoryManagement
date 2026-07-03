import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Pending Orders Panel Shows Empty State When No Orders", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_pending_empty_state",
    "Pending Orders Panel Shows Empty State When No Orders"
  );

  try {
    await recorder.step("Register mock APIs with no existing orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_empty_states" });
    });

    await recorder.step("Navigate to the orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Verify pending deliveries empty state and zero badge count", async () => {
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(0\)/ })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_pending_empty_state");
  } finally {
    await recorder.save(testInfo);
  }
});
