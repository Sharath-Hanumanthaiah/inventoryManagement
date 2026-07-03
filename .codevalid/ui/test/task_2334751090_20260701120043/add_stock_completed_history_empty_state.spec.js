import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Completed orders history displays empty state when no delivered orders exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_completed_history_empty_state", "Completed orders history displays empty state when no delivered orders exist");

  try {
    await recorder.step("Register empty history mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_empty_states" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Verify completed orders history empty state", async () => {
      await expect(page.getByText("Completed Orders History (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No order history", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_completed_history_empty_state");
  } finally {
    await recorder.save(testInfo);
  }
});
