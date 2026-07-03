import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Completed Orders Table Shows Empty State When No Deliveries", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_completed_empty_state",
    "Completed Orders Table Shows Empty State When No Deliveries"
  );

  try {
    await recorder.step("Register mock APIs with no delivered orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_empty_states" });
    });

    await recorder.step("Navigate to the orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Verify completed orders history empty state", async () => {
      await expect(page.getByRole("heading", { name: /Completed Orders History \(0\)/ })).toBeVisible();
      await expect(page.getByText("No order history", { exact: true })).toBeVisible();
      await expect(page.locator("tbody tr")).toHaveCount(0);
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_completed_empty_state");
  } finally {
    await recorder.save(testInfo);
  }
});
